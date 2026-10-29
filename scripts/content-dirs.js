const fs = require('fs');

const CONTENT_ROOT = 'public/content';
const MAX_SLUG_LENGTH = 40;

/**
 * turn "Jenny Don't & the Spurs" into "jenny-dont-the-spurs"
 */
function slugify(name) {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length <= MAX_SLUG_LENGTH) {
    return slug;
  }
  // cut at the last word boundary that fits
  const cut = slug.substring(0, MAX_SLUG_LENGTH + 1);
  const lastDash = cut.lastIndexOf('-');
  return lastDash > 0 ? cut.substring(0, lastDash) : slug.substring(0, MAX_SLUG_LENGTH);
}

// e.g. "2023-05-27-big-thief", named after the festival if there is one, otherwise the headliner
function contentDirName(show) {
  return `${show.dateId}-${slugify(show.festival || show.artists[0])}`;
}

// a bare "2023-05-27" or "2023-05-27-<slug>", but not "2023-05-27_2-<slug>"
function isDirForDateId(dirName, dateId) {
  return dirName === dateId || dirName.startsWith(`${dateId}-`);
}

function findContentDirs(root, dateId) {
  if (!fs.existsSync(root)) {
    return [];
  }
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isDirForDateId(entry.name, dateId))
    .map((entry) => entry.name);
}

module.exports = {
  CONTENT_ROOT,
  slugify,
  contentDirName,
  isDirForDateId,
  findContentDirs,
};
