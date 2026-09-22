// Pre-configured suppression rules for Roberto Clemente Bridge
export const ROBERTO_CLEMENTE_DEFAULT_RULES = [
  {
    id: 1,
    name: 'Eyebar Suspension Fasteners',
    description: 'Suppress clearance overlap between suspender pinheads and truss top chord gussets.',
    suppressBasedOn: 'Model',
    targetScope: 'one element',
    attribute1: 'Eyebar_Chains',
    isDualCondition: false,
    isImported: false,
    importedFrom: '',
  },
  {
    id: 2,
    name: 'Deck Finger Expansion Joints',
    description: 'Suppress thermal expansion gap intersections between road deck fingers and floor stringers.',
    suppressBasedOn: 'Category',
    targetScope: 'both elements',
    attribute1: 'Deck_Expansion_Fingers',
    attribute2: 'Steel_Floor_Stringers',
    isDualCondition: true,
    isImported: false,
    importedFrom: '',
  },
  {
    id: 3,
    name: 'Promenade Picket Luminaire Wiring',
    description: 'Suppress architectural railing pickets vs low-voltage LED luminaire conduits.',
    suppressBasedOn: 'Category',
    targetScope: 'one element',
    attribute1: 'Promenade_Pickets',
    attribute2: 'LED_Luminaire_Conduit',
    isDualCondition: true,
    isImported: true,
    importedFrom: 'Roberto Clemente Bridge',
  },
  {
    id: 4,
    name: 'Same-model category clearance',
    description: 'Suppress clash if both elements share the exact same category within bridge superstructure.',
    suppressBasedOn: 'ECSQL expression',
    ecsqlTarget: 'one element',
    ecsqlIntro: 'belongs to a model named',
    ecsqlCode: `SELECT
  SourceECInstanceId AS ElementA,
  TargetECInstanceId AS ElementB
FROM
  bis.Element
WHERE
  bis.Element.Category.Id = bis.Element.Category.Id`,
    isImported: true,
    importedFrom: 'Roberto Clemente Bridge',
  },
];

// Pre-configured suppression rules for Liberty Bridge (Pittsburgh, PA)
export const LIBERTY_BRIDGE_DEFAULT_RULES = [
  {
    id: 101,
    name: 'Tunnel Portal Exhaust Transition',
    description: 'Suppress mechanical ventilation plenum transitions inside Liberty Tunnel south portal concrete abutment.',
    suppressBasedOn: 'Category',
    targetScope: 'both elements',
    attribute1: 'Tunnel_Portal_Abutment',
    attribute2: 'Tunnel_Vent_Plenums',
    isDualCondition: true,
    isImported: false,
    importedFrom: '',
  },
  {
    id: 102,
    name: 'Cantilever Warren Truss Gussets',
    description: 'Suppress heavy truss gusset plate fastener intersections with deck cross-girders.',
    suppressBasedOn: 'Model',
    targetScope: 'one element',
    attribute1: 'Cantilever_Truss_Gussets',
    isDualCondition: false,
    isImported: false,
    importedFrom: '',
  },
  {
    id: 103,
    name: 'De-icing Hydronic Loop Sleeves',
    description: 'Suppress hydronic roadway heating pipes passing through pre-engineered floor beam web sleeves.',
    suppressBasedOn: 'Category',
    targetScope: 'one element',
    attribute1: 'Hydronic_Deicing_Pipes',
    attribute2: 'Floor_Beam_Webs',
    isDualCondition: true,
    isImported: true,
    importedFrom: 'Liberty Bridge',
  },
];

// Pre-configured suppression rules for PPG Place (Pittsburgh, PA)
export const PPG_PLACE_DEFAULT_RULES = [
  {
    id: 201,
    name: 'Gothic Spire Curtain-Wall Outriggers',
    description: 'Suppress curtain-wall glass facade brackets attaching to corner spire structural outriggers.',
    suppressBasedOn: 'Category',
    targetScope: 'both elements',
    attribute1: 'CurtainWall_Mullions',
    attribute2: 'Gothic_Spire_Outriggers',
    isDualCondition: true,
    isImported: false,
    importedFrom: '',
  },
  {
    id: 202,
    name: 'Wintergarden Space-Frame Purlins',
    description: 'Suppress atrium diagonal space-frame struts intersecting secondary glazing purlins.',
    suppressBasedOn: 'Model',
    targetScope: 'one element',
    attribute1: 'Wintergarden_SpaceFrame',
    isDualCondition: false,
    isImported: false,
    importedFrom: '',
  },
  {
    id: 203,
    name: 'High-Rise Elevator Core Raceways',
    description: 'Suppress high-voltage elevator traction risers within designated drywall shaft enclosures.',
    suppressBasedOn: 'Category',
    targetScope: 'one element',
    attribute1: 'Elevator_Core_Shafts',
    attribute2: 'HighVoltage_Raceways',
    isDualCondition: true,
    isImported: true,
    importedFrom: 'PPG Place',
  },
];

// Alias for backward compatibility
export const AR_VS_EL_DEFAULT_RULES = ROBERTO_CLEMENTE_DEFAULT_RULES;

// Central store for clash tests with localStorage persistence
export const INITIAL_TESTS = [
  {
    id: 1,
    name: 'AR vs EL',
    description: 'This is where the test description will go.',
    iModel: 'Roberto Clemente Bridge',
    active: '8932',
    total: '9800',
    lastRun: '07 August 2026 09:00AM EST',
    tag: 'WP03',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '02 April 2026',
    suppressionRules: ROBERTO_CLEMENTE_DEFAULT_RULES,
  },
  {
    id: 2,
    name: 'ST vs ME',
    description: 'Façade vs Structural Frame',
    iModel: 'Roberto Clemente Bridge',
    active: '2745',
    total: '4332',
    lastRun: '23 May 2026 10:15AM EST',
    tag: 'WP11',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '23 May 2026',
    suppressionRules: ROBERTO_CLEMENTE_DEFAULT_RULES,
  },
  {
    id: 3,
    name: 'AR vs ST',
    description: 'Architectural envelope vs steel columns',
    iModel: 'Roberto Clemente Bridge',
    active: '1564',
    total: '1564',
    lastRun: '25 May 2026 02:45PM EST',
    tag: 'WP05',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '25 May 2026',
    suppressionRules: ROBERTO_CLEMENTE_DEFAULT_RULES,
  },
  {
    id: 4,
    name: 'ME vs PL',
    description: 'Mechanical ductwork vs plumbing drains',
    iModel: 'Roberto Clemente Bridge',
    active: '7391',
    total: '12903',
    lastRun: '03 January 2026 08:30AM EST',
    tag: 'WP09',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '03 January 2026',
    suppressionRules: ROBERTO_CLEMENTE_DEFAULT_RULES,
  },
  {
    id: 5,
    name: 'EL vs FP',
    description: 'Electrical cable trays vs fire sprinkler pipe',
    iModel: 'Roberto Clemente Bridge',
    active: '4827',
    total: '7839',
    lastRun: '27 December 2025 04:20PM EST',
    tag: 'WP03',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '27 December 2025',
    suppressionRules: ROBERTO_CLEMENTE_DEFAULT_RULES,
  },
  {
    id: 6,
    name: 'ST vs FP',
    description: 'Structural trusses vs sprinkler mains',
    iModel: 'PPG Place',
    active: '612',
    total: '1048',
    lastRun: '23 March 2026 11:00AM EST',
    tag: 'WP11',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '23 March 2026',
    suppressionRules: PPG_PLACE_DEFAULT_RULES,
  },
  {
    id: 7,
    name: 'AR vs ME',
    description: 'Ceiling grid vs HVAC air terminals',
    iModel: 'Liberty Bridge',
    active: '3390',
    total: '3390',
    lastRun: '02 April 2026 09:00AM EST',
    tag: 'WP03',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '02 April 2026',
    suppressionRules: LIBERTY_BRIDGE_DEFAULT_RULES,
  },
  {
    id: 8,
    name: 'PL vs EL',
    description: 'Storm piping vs lighting conduit',
    iModel: 'PPG Place',
    active: '129',
    total: '5217',
    lastRun: '14 October 2025 07:45AM EST',
    tag: 'WP05',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '14 October 2025',
    suppressionRules: PPG_PLACE_DEFAULT_RULES,
  },
  {
    id: 9,
    name: 'ME vs FP',
    description: 'Chilled water lines vs fire risers',
    iModel: 'Liberty Bridge',
    active: '2071',
    total: '2984',
    lastRun: '21 October 2025 01:30PM EST',
    tag: 'WP09',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '21 October 2025',
    suppressionRules: LIBERTY_BRIDGE_DEFAULT_RULES,
  },
  {
    id: 10,
    name: 'ST vs EL',
    description: 'Bridge steel crossbeams vs electrical raceways',
    iModel: 'PPG Place',
    active: '858',
    total: '861',
    lastRun: '29 September 2025 03:10PM EST',
    tag: 'WP11',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '29 September 2025',
    suppressionRules: PPG_PLACE_DEFAULT_RULES,
  },
];

const STORAGE_KEY = 'bentley_clash_detection_tests';

export const getStoredTests = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let hasChanges = false;
        const migrated = parsed.map((t) => {
          let updated =
            t.description === 'Trevor Zegras'
              ? { ...t, description: 'This is where the test description will go.' }
              : t;

          // Migrate iModel names: Parkway -> Roberto Clemente Bridge, Data Centre -> Liberty Bridge, Tied Arch -> PPG Place
          let iModelName = updated.iModel;
          if (iModelName === 'Parkway' || iModelName === 'Parkway Station') {
            iModelName = 'Roberto Clemente Bridge';
            hasChanges = true;
          } else if (iModelName === 'Data Centre - 1' || iModelName === 'Data Centre-1') {
            iModelName = 'Liberty Bridge';
            hasChanges = true;
          } else if (iModelName === 'Tied Arch Bridge') {
            iModelName = 'PPG Place';
            hasChanges = true;
          }
          if (iModelName !== updated.iModel) {
            updated = { ...updated, iModel: iModelName };
          }

          if (!updated.suppressionRules || updated.suppressionRules.length === 0) {
            if (iModelName === 'Liberty Bridge') {
              updated = { ...updated, suppressionRules: LIBERTY_BRIDGE_DEFAULT_RULES };
            } else if (iModelName === 'PPG Place') {
              updated = { ...updated, suppressionRules: PPG_PLACE_DEFAULT_RULES };
            } else {
              updated = { ...updated, suppressionRules: ROBERTO_CLEMENTE_DEFAULT_RULES };
            }
            hasChanges = true;
          }
          return updated;
        });

        if (hasChanges) {
          saveStoredTests(migrated);
        }
        return migrated;
      }
    }
  } catch (e) {
    // fallback to initial
  }
  return INITIAL_TESTS;
};

export const saveStoredTests = (tests) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch (e) {
    // ignore
  }
};

export const updateTestInStore = (testId, updates) => {
  try {
    const tests = getStoredTests();
    const updated = tests.map((t) => (t.id === testId ? { ...t, ...updates } : t));
    saveStoredTests(updated);
    return updated;
  } catch (e) {
    return [];
  }
};
