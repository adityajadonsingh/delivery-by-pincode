import express from "express";
import cors from "cors";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔥 Helpers
const normalizePostcode = (p) => p.replace(/\s+/g, "").toUpperCase();

const getPrefixes = (postcode) => {
  const clean = normalizePostcode(postcode);

  return [
    clean.substring(0, 4),
    clean.substring(0, 3),
    clean.substring(0, 2),
    clean.substring(0, 1),
  ];
};

// ✅ NEW Route: Get delivery prices by postcode (ZONE BASED)
app.get("/api/delivery/:postcode", async (req, res) => {
  const { postcode } = req.params;

  try {
    const prefixes = getPrefixes(postcode);

    // 🔍 Find matching prefix (longest first)
    const [zoneRows] = await pool.query(
      `
      SELECT * FROM postcode_zones
      WHERE prefix IN (?, ?, ?, ?)
      ORDER BY LENGTH(prefix) DESC
      LIMIT 1
      `,
      prefixes,
    );

    if (zoneRows.length === 0) {
      return res.status(404).json({ message: "Delivery not available" });
    }

    const zoneName = zoneRows[0].zone_name;

    // 💰 Get zone pricing
    const [priceRows] = await pool.query(
      `SELECT * FROM zones WHERE zone_name = ?`,
      [zoneName],
    );

    if (priceRows.length === 0) {
      return res.status(500).json({ message: "Zone pricing not found" });
    }

    const economy = Number(priceRows[0].economy_price);
    const premium = economy + 20;

    res.json({
      postcode: normalizePostcode(postcode),
      zone: zoneName,
      economy_price: economy,
      premium_price: premium,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚚 Delivery Service API (Zone Based) running!");
});

app.get("/api/zones", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM zones
      ORDER BY
        CASE
          WHEN zone_name = 'local' THEN 0
          WHEN zone_name = 'inner_london' THEN 1
          WHEN zone_name = 'outer_london' THEN 2
          WHEN zone_name = 'central_london' THEN 3
          ELSE 4
        END,
        CAST(SUBSTRING_INDEX(zone_name, '_', -1) AS UNSIGNED),
        zone_name
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching zones" });
  }
});

// ✅ Update zone price
app.put("/api/zones/:zone", async (req, res) => {
  const { zone } = req.params;
  const { economy } = req.body;

  try {
    await pool.query("UPDATE zones SET economy_price = ? WHERE zone_name = ?", [
      economy,
      zone,
    ]);

    res.json({ message: "Zone updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// 🔍 NEW Search (prefix-based from postcode_zones)
app.get("/api/delivery/search/:prefix", async (req, res) => {
  const { prefix } = req.params;

  try {
    const clean = normalizePostcode(prefix);

    const [rows] = await pool.query(
      `
      SELECT pz.prefix, pz.zone_name, z.economy_price
      FROM postcode_zones pz
      JOIN zones z ON pz.zone_name = z.zone_name
      WHERE pz.prefix LIKE ?
      ORDER BY pz.prefix ASC
      LIMIT 50
      `,
      [`${clean}%`],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    // add premium dynamically
    const result = rows.map((row) => ({
      prefix: row.prefix,
      zone: row.zone_name,
      economy_price: Number(row.economy_price),
      premium_price: Number(row.economy_price) + 20,
    }));

    res.json(result);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ⚠️ OPTIONAL (KEEP FOR BACKUP PURPOSE ONLY)
// You can delete later once confident

app.post("/api/delivery", async (req, res) => {
  return res.status(400).json({
    message: "Postcode-level pricing disabled. Use zone system.",
  });
});

app.put("/api/delivery/:postcode", async (req, res) => {
  return res.status(400).json({
    message: "Postcode-level updates disabled. Use zone system.",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
