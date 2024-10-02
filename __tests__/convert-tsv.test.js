/* eslint-disable no-undef */
const convert = require('../scripts/convert-tsv');

test('remove trailing num in parens from a title', () => {
  expect(convert.cleanTitle('title (3)')).toBe('title');
});

test('remove generated name in parens from a title', () => {
  expect(convert.cleanTitle('title (DSC30498)')).toBe('title');
});
