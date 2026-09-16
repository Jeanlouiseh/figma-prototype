// Default suppression rules for AR vs EL matching the design specification
export const AR_VS_EL_DEFAULT_RULES = [
  {
    id: 1,
    name: 'Rule name',
    description: 'Suppress clash if one element belongs to Pipes model.',
    suppressBasedOn: 'Model',
    targetScope: 'one element',
    attribute1: 'Pipes',
    isDualCondition: false,
    isImported: false,
    importedFrom: '',
  },
  {
    id: 2,
    name: 'Rule name',
    description: 'Suppress clash between Pipes category and Walls category.',
    suppressBasedOn: 'Category',
    targetScope: 'one element',
    attribute1: 'Pipes',
    attribute2: 'Walls',
    isDualCondition: true,
    isImported: false,
    importedFrom: '',
  },
  {
    id: 3,
    name: 'Rule name',
    description: 'Suppress clash based on element relationship via BBox.',
    suppressBasedOn: 'Relationship',
    relSourceClass: 'BBoxhigh',
    relTargetClass: 'BBoxlow',
    relViaClass: 'BBox',
    relDirection: 'forward',
    relVerb: 'belongs to a model named',
    isImported: true,
    importedFrom: 'AR vs PH',
  },
  {
    id: 4,
    name: 'Rule name',
    description: 'Suppress clash if both elements share the exact same category.',
    suppressBasedOn: 'ECSQL expression',
    ecsqlTarget: 'one element',
    ecsqlIntro: 'belongs to a model named',
    ecsqlCode: `SELECT
  SourceECInstanceId AS ElementA,
  TargetECInstanceId AS ElementB
FROM
  bis.Element
WHERE
  -- Suppress if both elements are in the exact same Category
  bis.Element.Category.Id = bis.Element.Category.Id
  -- And ensure we are looking at two different elements`,
    isImported: true,
    importedFrom: 'Parkway',
  },
];

// Central store for clash tests with localStorage persistence
export const INITIAL_TESTS = [
  {
    id: 1,
    name: 'AR vs EL',
    description: 'This is where the test description will go.',
    iModel: 'Parkway',
    active: '8932',
    total: '9800',
    lastRun: '14 June 2026',
    tag: 'WP03',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '02 April 2026',
    suppressionRules: AR_VS_EL_DEFAULT_RULES,
  },
  {
    id: 2,
    name: 'ST vs ME',
    description: 'Façade vs Structural Frame',
    iModel: 'Parkway',
    active: '2745',
    total: '4332',
    lastRun: '23 May 2026',
    tag: 'WP11',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '23 May 2026',
  },
  {
    id: 3,
    name: 'AR vs ST',
    description: 'Architectural envelope vs steel columns',
    iModel: 'Parkway',
    active: '1564',
    total: '1564',
    lastRun: '25 May 2026',
    tag: 'WP05',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '25 May 2026',
  },
  {
    id: 4,
    name: 'ME vs PL',
    description: 'Mechanical ductwork vs plumbing drains',
    iModel: 'Parkway',
    active: '7391',
    total: '12903',
    lastRun: '03 January 2026',
    tag: 'WP09',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '03 January 2026',
  },
  {
    id: 5,
    name: 'EL vs FP',
    description: 'Electrical cable trays vs fire sprinkler pipe',
    iModel: 'Parkway',
    active: '4827',
    total: '7839',
    lastRun: '27 December 2...',
    tag: 'WP03',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '27 December 2025',
  },
  {
    id: 6,
    name: 'ST vs FP',
    description: 'Structural trusses vs sprinkler mains',
    iModel: 'Tied Arch Bridge',
    active: '612',
    total: '1048',
    lastRun: '23 March 2026',
    tag: 'WP11',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '23 March 2026',
  },
  {
    id: 7,
    name: 'AR vs ME',
    description: 'Ceiling grid vs HVAC air terminals',
    iModel: 'Data Centre - 1',
    active: '3390',
    total: '3390',
    lastRun: '02 April 2026',
    tag: 'WP03',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '02 April 2026',
  },
  {
    id: 8,
    name: 'PL vs EL',
    description: 'Storm piping vs lighting conduit',
    iModel: 'Tied Arch Bridge',
    active: '129',
    total: '5217',
    lastRun: '14 October 2025',
    tag: 'WP05',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '14 October 2025',
  },
  {
    id: 9,
    name: 'ME vs FP',
    description: 'Chilled water lines vs fire risers',
    iModel: 'Data Centre - 1',
    active: '2071',
    total: '2984',
    lastRun: '21 October 2025',
    tag: 'WP09',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '21 October 2025',
  },
  {
    id: 10,
    name: 'ST vs EL',
    description: 'Bridge steel crossbeams vs electrical raceways',
    iModel: 'Tied Arch Bridge',
    active: '858',
    total: '861',
    lastRun: '29 September 2...',
    tag: 'WP11',
    createdBy: 'Jeanlouise Hornberger',
    lastRunDate: '29 September 2025',
  },
];

const STORAGE_KEY = 'bentley_clash_detection_tests';

export const getStoredTests = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t) => {
          let updated =
            t.description === 'Trevor Zegras'
              ? { ...t, description: 'This is where the test description will go.' }
              : t;
          if (
            (updated.id === 1 || updated.name === 'AR vs EL') &&
            (!updated.suppressionRules || updated.suppressionRules.length === 0)
          ) {
            updated = { ...updated, suppressionRules: AR_VS_EL_DEFAULT_RULES };
          }
          return updated;
        });
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
