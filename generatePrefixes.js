import fs from "fs";

// 👉 Paste your FULL Excel data here (cleaned manually once)
const zones = [
  {
    zone: "local",
    data: ["SO14-SO19", "SO30-32", "SO40-45", "SO50", "SO52-53", "PO30-41"]
  },
  {
    zone: "zone_1",
    data: ["B", "CV", "CW", "DE", "DY", "LE", "NG", "NN", "ST", "TF", "WS", "WV"]
  },
  {
    zone: "zone_2",
    data: ["BB", "BD", "DN1-DN22", "DN55", "HD", "HX", "L", "LS", "M", "OL", "PR", "S1-S26", "S35", "S40-S98", "SK1-SK8", "WA", "WF", "WN"]
  },
  {
    zone: "zone_3",
    data: ["CH", "DN31-DN41", "LN1-LN6", "MK", "PE1-PE19"]
  },
  {
    zone: "zone_4",
    data: ["AL", "BS1-BS21", "BS32-BS37", "BS98-BS99", "GL", "HP", "HR", "HU", "LU", "NP", "OX5-OX7", "OX15-OX17", "OX20-OX27", "PE30-PE38", "S32-S33", "S36", "SK9-SK23"]
  },
  {
    zone: "zone_5",
    data: ["BS22-BS31", "BS39-BS49", "CF", "CO", "HG", "IP", "LN7-LN13", "OX1-OX4", "OX9-OX14", "OX18", "OX28-OX49", "PE20-PE25", "SG", "SL1-SL2", "SL4-SL9", "SN", "SS", "WD"]
  },
  {
    zone: "zone_6",
    data: ["BA", "BH", "CB", "CM", "ME", "NE1-NE18", "NR", "RG", "RM16-RM18", "SO", "SR", "SY1-SY6", "SY8", "TS", "YO1-YO12", "YO14-YO17", "YO19", "YO23-YO26"]
  },
  {
    zone: "zone_7",
    data: ["CT", "GU", "KT23-KT24", "NE19-NE71", "PO1-PO22", "RH", "SP"]
  },
  {
    zone: "zone_8",
    data: ["BN", "CA1-CA4", "CA8-CA13", "CA16-CA27", "DT", "LD", "LL15-LL19", "LL21-LL78", "SA1-SA18", "SY7", "SY9-SY17", "SY21-SY22", "TN1-TN13", "TN15", "TN17-TN40", "YO13", "YO18", "YO21-YO22", "YO30-YO90"]
  },
  {
    zone: "zone_9",
    data: ["EX", "PL", "SA19-SA99", "SY18-SY20", "SY23-SY25", "TA", "TQ1-TQ5", "TQ12-TQ14"]
  },
  {
    zone: "zone_10",
    data: ["CA5-CA7", "CA14-CA15", "CA28", "DG1-DG2", "DG10-DG16", "EH1-EH30", "EH37-EH99", "FK1-FK9", "G1-G82", "KA1-KA3", "KA11-KA17", "KA20-KA25", "KA29-KA30", "KY1-KY5", "KY11-KY12", "KY99", "ML1-ML9", "PA1-PA4", "TD1-TD10", "TQ6-TQ11"]
  },
  {
    zone: "zone_11",
    data: ["DG3-DG9", "EH31-EH36", "EH39-EH42", "FK10-FK21", "G83-G84", "KA4-KA10", "KA18", "KY6-KY10", "KY13-KY16", "ML10-ML12", "PA5-PA19", "TD11-TD15"]
  },
  {
    zone: "zone_12",
    data: ["AB", "KA19", "PH8-PH13"]
  },
  {
    zone: "zone_13",
    data: ["IV1-IV20", "IV30-IV36", "PH19-PH32", "PH34-PH35"]
  },
  {
    zone: "zone_14",
    data: ["DD", "PH1-PH7", "PH14-PH18"]
  },
  {
    zone: "zone_15",
    data: ["IV40-IV56"]
  },
  {
    zone: "zone_16",
    data: ["HS", "KA27-KA28"]
  },
  {
    zone: "zone_17",
    data: ["KW15-KW16", "KW17", "ZE1-ZE3"]
  },
  {
    zone: "zone_18",
    data: ["BT1-BT23", "BT36-BT40"]
  },
  {
    zone: "zone_19",
    data: ["BT24-BT35", "BT41-BT94"]
  },
  {
    zone: "zone_22",
    data: ["PO30-PO41"]
  },
  {
    zone: "zone_23",
    data: ["GY", "IM", "JE"]
  },
  {
    zone: "zone_12a",
    data: ["TR"]
  },
  {
    zone: "zone_13a",
    data: ["IV21-IV28", "IV63", "KW1-KW14", "PA21-PA38", "PH33", "PH36-PH41", "PH49-PH50"]
  },
  {
    zone: "zone_16a",
    data: ["PA20", "PA41-PA80", "PH42-PH44"]
  },
  {
    zone: "zone_17a",
    data: ["KW16", "ZE2"]
  },
  {
    zone: "inner_london",
    data: ["E2-E20", "N1-N22", "NW1-NW11", "SE3-SE27", "SW2-SW19", "W3-W14"]
  },
  {
    zone: "outer_london",
    data: ["BR", "CR", "DA", "EN", "HA", "IG", "KT", "RM", "SL", "SM", "TW", "UB"]
  },
  {
    zone: "central_london",
    data: ["E1", "EC1-EC4", "SW1", "W1", "WC1-WC2"]
  }
];

// 🔥 RANGE EXPANDER (handles everything)
const expandRange = (range) => {
  range = range.replace(/–/g, "-");

  const match = range.match(/^([A-Z]+)(\d+)-([A-Z]*)(\d+)$/);
  if (!match) return [range];

  const [, prefix1, start, prefix2, end] = match;
  const prefix = prefix2 || prefix1;

  let results = [];
  for (let i = Number(start); i <= Number(end); i++) {
    results.push(prefix + i);
  }
  return results;
};

// 🔥 MAIN
let queries = [];

zones.forEach(({ zone, data }) => {
  data.forEach(item => {
    item = item.trim();

    // handle special case text
    if (item.includes("KW16")) {
      queries.push(`('KW16', '${zone}')`);
      return;
    }
    if (item.includes("ZE2")) {
      queries.push(`('ZE2', '${zone}')`);
      return;
    }

    if (item.includes("-")) {
      const expanded = expandRange(item);
      expanded.forEach(p => {
        queries.push(`('${p}', '${zone}')`);
      });
    } else {
      queries.push(`('${item}', '${zone}')`);
    }
  });
});

// remove duplicates
queries = [...new Set(queries)];

const sql = `
INSERT INTO postcode_zones (prefix, zone_name)
VALUES
${queries.join(",\n")};
`;

fs.writeFileSync("prefixes_full.sql", sql);
console.log("🔥 Full prefixes SQL generated");