/* eslint-disable no-undef */
const convert = require('../scripts/convert-tsv');

test('remove trailing num in parens from a title', () => {
  expect(convert.cleanTitle('title (3)')).toBe('title');
});

test('remove generated name in parens from a title', () => {
  expect(convert.cleanTitle('title (DSC30498)')).toBe('title');
});

test('sort images by artist', () => {
  const artists = ['Radiohead', 'Bjork'];
  const imageObjects = [
    {
      path: 'a/b/d.jpg',
      title: 'Bjork',
    },
    {
      path: 'a/b/c.jpg',
      title: 'Radiohead',
    },
  ];
  const sorted = convert.sortImagesByArtists(imageObjects, artists);
  const expected = [
    {
      path: 'a/b/c.jpg',
      title: 'Radiohead',
    },
    {
      path: 'a/b/d.jpg',
      title: 'Bjork',
    },
  ];
  expect(sorted).toStrictEqual(expected);
});
