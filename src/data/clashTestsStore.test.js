import { getStoredTests, saveStoredTests, updateTestInStore, INITIAL_TESTS, hasTestResults, UNRUN_TEST_DEFAULTS } from './clashTestsStore';

const STORAGE_KEY = 'bentley_clash_detection_tests';

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});

afterEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});

test.each(['Roberto Clemente Bridge', 'Liberty Bridge', 'PPG Place'])(
  'preserves zero suppression rules for a saved %s test',
  (iModel) => {
    saveStoredTests([{ id: 'new-test', name: 'New test', iModel, suppressionRules: [] }]);

    expect(getStoredTests()[0].suppressionRules).toEqual([]);
    updateTestInStore('new-test', { lastRun: 'Just now' });
    expect(getStoredTests()[0].suppressionRules).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].suppressionRules).toEqual([]);
  }
);

test('initializes missing suppression rules to an empty list', () => {
  saveStoredTests([{ id: 'new-test', name: 'New test', iModel: 'Liberty Bridge' }]);

  expect(getStoredTests()[0].suppressionRules).toEqual([]);
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].suppressionRules).toEqual([]);
});

test('preserves explicitly added suppression rules', () => {
  const rules = [{ id: 'custom-rule', name: 'Custom rule' }];
  saveStoredTests([{ id: 'new-test', name: 'New test', suppressionRules: rules }]);

  expect(getStoredTests()[0].suppressionRules).toEqual(rules);
});

test('preserves existing demo tests and their rules', () => {
  expect(getStoredTests()).toEqual(INITIAL_TESTS);
  expect(getStoredTests()[0].suppressionRules.length).toBeGreaterThan(0);
});

test.each([
  { lastRun: 'Never' },
  { lastRun: 'Never', runCount: 1 },
  { lastRun: 'Never', runCount: 0 },
  { runCount: 0 },
  {},
])('does not expose results for an unrun test: %j', (testData) => {
  expect(hasTestResults(testData)).toBe(false);
});

test('exposes results only after a completed first run', () => {
  const testData = { id: 'new-test', name: 'New test', ...UNRUN_TEST_DEFAULTS };
  saveStoredTests([testData]);
  expect(hasTestResults(getStoredTests()[0])).toBe(false);

  updateTestInStore(testData.id, { lastRun: 'Just now', runCount: 1 });
  expect(hasTestResults(getStoredTests()[0])).toBe(true);
});

test('migrates never-run tests without granting results access', () => {
  saveStoredTests([{ id: 'new-test', lastRun: 'Never', runCount: 1 }]);
  expect(getStoredTests()[0].runCount).toBe(0);
  expect(hasTestResults(getStoredTests()[0])).toBe(false);
});

test('preserves results access for legacy completed tests', () => {
  saveStoredTests([{ id: 'old-test', lastRun: 'Just now' }]);
  expect(getStoredTests()[0].runCount).toBe(1);
  expect(hasTestResults(getStoredTests()[0])).toBe(true);
});
