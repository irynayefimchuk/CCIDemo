/**
 * OpportunityCard Data Schema & Template
 * ═══════════════════════════════════════
 * This file defines the data shape for every value displayed in the
 * OpportunityTileSupply summary card. Use it to build a database,
 * API response, or JSON file that populates different cards.
 *
 * FIELD MAP (keyed to visual regions of the card):
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  HEADER ROW                                                    │
 * │  [category] [setting] [procedure chip] → procedureTitle        │
 * ├──────────┬──────────┬──────────┬──────────┬────────────────────┤
 * │ SAVINGS  │ HIGH     │ LOW      │ SUPPLIES │ PATTERN            │
 * │ OPPTY    │ COST     │ COST     │ DRIVERS  │ BULLETS            │
 * │ KPI      │ PROVIDER │ PROVIDER │          │                    │
 * ├──────────┴──────────┴──────────┴──────────┴────────────────────┤
 * │  ACTION BAR: [Show More / Show Less]  [Dismiss] [Move to Active]│
 * └─────────────────────────────────────────────────────────────────┘
 */

// ─── Type Definitions ─────────────────────────────────────────────

export interface AdjunctService {
  description: string;
  cptCode: string;
}

export interface ProviderProfile {
  /** Display name (shown in popover, not on card surface) */
  name: string;
  /** Anonymized provider hash ID shown on card */
  id: string;
  /** Medical specialty */
  specialty: string;
  /** Location summary text */
  locations: string;
  /** Practice description / variation context */
  practiceNotes: string;
  /** Practice site names (shown in popover) */
  practiceSites: string[];
}

export interface OpportunityCardData {
  // ─── Identity ───────────────────────────────────────────────────
  /** Unique card identifier */
  id: string;
  /** Opportunity tracking ID (e.g., "OPP-1070003440-OUT-2412b776") */
  opportunityId: string;

  // ─── Header ─────────────────────────────────────────────────────
  /** Full procedure title displayed below the tags row
   *  e.g., "TOTAL KNEE ARTHROPLASTY, VENIPUNCTURE ROUTINE LAB DRAW..." */
  procedureTitle: string;
  /** Short procedure name for popover header
   *  e.g., "TOTAL KNEE REPLACEMENT" */
  procedureName: string;
  /** Variation category label + dot color
   *  Currently always "Supply Variation" with brand-purple dot */
  category: "Supply Variation" | "Labor Variation" | "Pharmacy Variation";
  /** Care setting chip */
  setting: "Outpatient" | "Inpatient";
  /** CPT codes associated with this opportunity */
  cptCodes: string[];
  /** DRG codes (empty array for outpatient) */
  drgCodes: string[];
  /** Adjunct services shown in the procedure popover */
  adjunctServices: AdjunctService[];

  // ─── KPI 1: Savings Opportunity ─────────────────────────────────
  savings: {
    /** Range string, e.g., "$21K - $222K" */
    annualImpactRange: string;
    /** Midpoint value, e.g., "$121.5K" */
    midpoint: string;
  };

  // ─── KPI 2: High-Cost Provider ──────────────────────────────────
  highCostProvider: {
    profile: ProviderProfile;
    /** Average cost per case, e.g., "$5,089" */
    avgCostPerCase: string;
    /** 12-month case count, e.g., 219 */
    caseVolume12mo: number;
    /** Per-case savings vs peer, e.g., "+$550" */
    savingsPerCase: string;
    /** Risk-adjusted probability percentage, e.g., "98.6%" */
    riskAdjustedProbability: string;
    /** Tooltip explanation for the probability badge */
    probabilityTooltip: string;
  };

  // ─── KPI 3: Low-Cost Provider (Peer Benchmark) ─────────────────
  lowCostProvider: {
    profile: ProviderProfile;
    /** Average cost per case, e.g., "$4,800" */
    avgCostPerCase: string;
    /** 12-month case count, e.g., 216 */
    caseVolume12mo: number;
  };

  // ─── KPI 4: Key Supply Drivers ──────────────────────────────────
  /** Top supply cost driver labels (bullet list) */
  keyDrivers: string[];

  // ─── KPI 5: Pattern Comparison Bullets ──────────────────────────
  providerPattern: {
    /** Short bullets (<1440px stacked layout, max 2) */
    bulletsShort: string[];
    /** Full bullets (>=1440px side-by-side layout, max 3) */
    bulletsFull: string[];
  };
  peerPattern: {
    bulletsShort: string[];
    bulletsFull: string[];
  };
}

// ─── Mock Data: Current Hardcoded Values ──────────────────────────

export const MOCK_OPPORTUNITIES: OpportunityCardData[] = [
  {
    id: "opp-001",
    opportunityId: "OPP-1070003440-OUT-2412b776",

    procedureTitle:
      "TOTAL KNEE ARTHROPLASTY, VENIPUNCTURE ROUTINE LAB DRAW, GAIT TRAINING THERAPY, IMPLANTABLE KNEE DEVICE, PT EVALUATION LOW COMPLEXITY",
    procedureName: "TOTAL KNEE REPLACEMENT",
    category: "Supply Variation",
    setting: "Outpatient",
    cptCodes: ["27447", "36415", "97116", "C1713", "97165"],
    drgCodes: [],
    adjunctServices: [
      { description: "Venipuncture, routine lab draw", cptCode: "36415" },
      { description: "PT evaluation, low complexity", cptCode: "97165" },
      { description: "Gait training therapy", cptCode: "97116" },
      { description: "Implantable knee device", cptCode: "C1713" },
    ],

    savings: {
      annualImpactRange: "$21K - $222K",
      midpoint: "$121.5K",
    },

    highCostProvider: {
      profile: {
        name: "Susan Wilson",
        id: "6e73ff31",
        specialty: "Orthopedic Surgery",
        locations: "38 Locations",
        practiceNotes:
          "Specializes in complex joint reconstruction. Primary variation source: Exclusive use of premium bone cements and Smith & Nephew implant systems.",
        practiceSites: [
          "St. Mary's Medical Center",
          "Northwest Orthopedic Institute",
          "Valley General Hospital",
          "Riverside Surgical Center",
        ],
      },
      avgCostPerCase: "$5,089",
      caseVolume12mo: 219,
      savingsPerCase: "+$550",
      riskAdjustedProbability: "98.6%",
      probabilityTooltip:
        "99% probability the cost difference is real (not due to random variation). Savings depend on adoption and volume.",
    },

    lowCostProvider: {
      profile: {
        name: "Robert Chen",
        id: "ae5b2ef4",
        specialty: "Orthopedic Surgery",
        locations: "Lead Benchmark Peer",
        practiceNotes:
          "Focuses on standardized musculoskeletal protocols. Uses lower-cost Simplex/DePuy alternatives with high clinical efficacy.",
        practiceSites: [
          "Harbor View Medical Center",
          "Pacific Orthopedic Group",
          "Eastside Surgery Center",
          "Bay Area Bone & Joint",
        ],
      },
      avgCostPerCase: "$4,800",
      caseVolume12mo: 216,
    },

    keyDrivers: ["Premium Bone cement", "Higher-cost knee implants"],

    providerPattern: {
      bulletsShort: [
        "Palacos cement ($110\u2013$123/unit), up to 4 units/case",
        "Bundled implants ($4,930 mean) limit flexibility",
      ],
      bulletsFull: [
        "Palacos cement ($110\u2013$123/unit), up to 4 units/case variability",
        "Bundled implants ($4,930 mean) drive higher base cost",
        "Combo avg $5,071/case \u2014 ~$500 above benchmark",
      ],
    },
    peerPattern: {
      bulletsShort: [
        "Simplex/CMW2 ($65\u2013$166/unit), 2.19 units/case",
        "Itemized components at lower per-case cost",
      ],
      bulletsFull: [
        "Simplex/CMW2 ($65\u2013$166/unit), consistent 2.19 units/case",
        "Itemized components (Stryker Triathlon) at lower cost",
        "Combo avg ~$4,570/case via standardized pricing",
      ],
    },
  },

  // ─── Example: Second opportunity (Hip Arthroplasty) ─────────────
  {
    id: "opp-002",
    opportunityId: "OPP-2080004112-OUT-8a31c9ef",

    procedureTitle:
      "TOTAL HIP ARTHROPLASTY, PHYSICAL THERAPY EVALUATION, IMPLANTABLE HIP DEVICE",
    procedureName: "TOTAL HIP REPLACEMENT",
    category: "Supply Variation",
    setting: "Outpatient",
    cptCodes: ["27130", "97161", "C1776"],
    drgCodes: [],
    adjunctServices: [
      { description: "PT evaluation, moderate complexity", cptCode: "97161" },
      { description: "Implantable hip device", cptCode: "C1776" },
    ],

    savings: {
      annualImpactRange: "$18K - $195K",
      midpoint: "$106.5K",
    },

    highCostProvider: {
      profile: {
        name: "James Patterson",
        id: "a4f2c718",
        specialty: "Orthopedic Surgery",
        locations: "12 Locations",
        practiceNotes:
          "High use of ceramic-on-ceramic bearing surfaces and custom femoral stems. Consistent selection of premium hip systems with limited generic alternatives.",
        practiceSites: [
          "Memorial Regional Hospital",
          "Westside Joint Center",
          "Lakewood Surgical Pavilion",
        ],
      },
      avgCostPerCase: "$6,230",
      caseVolume12mo: 187,
      savingsPerCase: "+$480",
      riskAdjustedProbability: "96.2%",
      probabilityTooltip:
        "96% probability the cost difference is real (not due to random variation). Savings depend on adoption and volume.",
    },

    lowCostProvider: {
      profile: {
        name: "Maria Gonzalez",
        id: "d9e1b305",
        specialty: "Orthopedic Surgery",
        locations: "Lead Benchmark Peer",
        practiceNotes:
          "Uses standardized metal-on-poly bearing systems with negotiated group pricing. Consistent 2-implant protocol per case.",
        practiceSites: [
          "Central Valley Medical Center",
          "Bayshore Orthopedic Group",
          "Summit Surgery Center",
        ],
      },
      avgCostPerCase: "$5,750",
      caseVolume12mo: 192,
    },

    keyDrivers: ["Ceramic bearing surfaces", "Custom femoral stems"],

    providerPattern: {
      bulletsShort: [
        "Ceramic-on-ceramic bearings ($1,200\u2013$1,450/unit)",
        "Custom stems add $800\u2013$1,100 per case",
      ],
      bulletsFull: [
        "Ceramic-on-ceramic bearings ($1,200\u2013$1,450/unit) vs metal-on-poly",
        "Custom femoral stems add $800\u2013$1,100 per case variability",
        "Combo avg $6,230/case \u2014 ~$480 above benchmark",
      ],
    },
    peerPattern: {
      bulletsShort: [
        "Metal-on-poly bearings ($650\u2013$800/unit)",
        "Standard femoral stems with group pricing",
      ],
      bulletsFull: [
        "Metal-on-poly bearings ($650\u2013$800/unit), consistent selection",
        "Standard femoral stems via group purchasing at lower cost",
        "Combo avg ~$5,750/case via standardized protocols",
      ],
    },
  },

  // ─── Example: Third opportunity (Spinal Fusion) ─────────────────
  {
    id: "opp-003",
    opportunityId: "OPP-3050001987-IN-5bc4d2a1",

    procedureTitle:
      "LUMBAR SPINAL FUSION, BONE GRAFT SUBSTITUTE, INTRAOPERATIVE NEUROMONITORING",
    procedureName: "LUMBAR SPINAL FUSION",
    category: "Supply Variation",
    setting: "Inpatient",
    cptCodes: ["22612", "22614", "20930", "95940"],
    drgCodes: ["460"],
    adjunctServices: [
      { description: "Bone graft substitute", cptCode: "20930" },
      { description: "Intraop neuromonitoring", cptCode: "95940" },
    ],

    savings: {
      annualImpactRange: "$45K - $310K",
      midpoint: "$177.5K",
    },

    highCostProvider: {
      profile: {
        name: "David Kim",
        id: "b7c3e942",
        specialty: "Spine Surgery",
        locations: "8 Locations",
        practiceNotes:
          "Exclusively uses BMP-2 biologics and titanium expandable cages. High per-case implant cost driven by brand loyalty.",
        practiceSites: [
          "University Spine Institute",
          "Northern Valley Medical Center",
          "Coast Neurosurgical Associates",
        ],
      },
      avgCostPerCase: "$14,850",
      caseVolume12mo: 142,
      savingsPerCase: "+$1,250",
      riskAdjustedProbability: "99.1%",
      probabilityTooltip:
        "99% probability the cost difference is real (not due to random variation). Savings depend on adoption and volume.",
    },

    lowCostProvider: {
      profile: {
        name: "Lisa Thompson",
        id: "f4a8d671",
        specialty: "Spine Surgery",
        locations: "Lead Benchmark Peer",
        practiceNotes:
          "Uses DBM putty biologics and PEEK static cages. Standardized implant tray with negotiated pricing.",
        practiceSites: [
          "Midwest Spine Center",
          "Prairie View Hospital",
          "Heartland Surgical Group",
        ],
      },
      avgCostPerCase: "$13,600",
      caseVolume12mo: 138,
    },

    keyDrivers: ["BMP-2 biologics", "Titanium expandable cages"],

    providerPattern: {
      bulletsShort: [
        "BMP-2 ($3,200\u2013$4,100/dose), used in 90% of cases",
        "Titanium expandable cages ($2,800/unit)",
      ],
      bulletsFull: [
        "BMP-2 ($3,200\u2013$4,100/dose), used in 90% of cases vs 30% peers",
        "Titanium expandable cages add $800\u2013$1,200 above PEEK alternatives",
        "Combo avg $14,850/case \u2014 ~$1,250 above benchmark",
      ],
    },
    peerPattern: {
      bulletsShort: [
        "DBM putty ($400\u2013$600/dose), comparable fusion rates",
        "PEEK static cages ($1,600\u2013$1,900/unit)",
      ],
      bulletsFull: [
        "DBM putty ($400\u2013$600/dose) with comparable fusion rates",
        "PEEK static cages at $1,600\u2013$1,900 via group purchasing",
        "Combo avg ~$13,600/case via standardized biologics protocol",
      ],
    },
  },
];

// ─── Helper: Empty template for creating new entries ──────────────

export const EMPTY_OPPORTUNITY: OpportunityCardData = {
  id: "",
  opportunityId: "",
  procedureTitle: "",
  procedureName: "",
  category: "Supply Variation",
  setting: "Outpatient",
  cptCodes: [],
  drgCodes: [],
  adjunctServices: [],
  savings: {
    annualImpactRange: "",
    midpoint: "",
  },
  highCostProvider: {
    profile: {
      name: "",
      id: "",
      specialty: "",
      locations: "",
      practiceNotes: "",
      practiceSites: [],
    },
    avgCostPerCase: "",
    caseVolume12mo: 0,
    savingsPerCase: "",
    riskAdjustedProbability: "",
    probabilityTooltip: "",
  },
  lowCostProvider: {
    profile: {
      name: "",
      id: "",
      specialty: "",
      locations: "",
      practiceNotes: "",
      practiceSites: [],
    },
    avgCostPerCase: "",
    caseVolume12mo: 0,
  },
  keyDrivers: [],
  providerPattern: {
    bulletsShort: [],
    bulletsFull: [],
  },
  peerPattern: {
    bulletsShort: [],
    bulletsFull: [],
  },
};
