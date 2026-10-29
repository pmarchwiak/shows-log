/**
 * Moves per-show folders from public/images (or misnamed ones in public/content) to
 * public/content/<dateId>-<slug>. Reads the show list from data/data.js, so run
 * `make convert` first.
 *
 * Dry run by default; pass --apply to actually move folders.
 *
 *   node scripts/rename-content-dirs.js [--apply]
 */
const fs = require('fs');
const path = require('path');
const { CONTENT_ROOT, contentDirName, findContentDirs } = require('../content-dirs');

const LEGACY_ROOT = 'public/images';
const EXPORT_DB = '.osxphotos_export.db';
const DATE_DIR_PATTERN = /^\d{4}-\d{2}-\d{2}/;

function loadShows(dataPath) {
  const src = fs.readFileSync(dataPath, 'utf8')
    .replace(/^const showsList = /, '')
    .replace(/export default showsList\s*$/, '');
  return JSON.parse(src);
}

function listDateDirs(root) {
  if (!fs.existsSync(root)) {
    return [];
  }
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && DATE_DIR_PATTERN.test(entry.name))
    .map((entry) => entry.name);
}

function planMoves(shows) {
  const moves = [];
  const unchanged = [];
  const conflicts = [];
  const claimed = new Set();

  shows.forEach((show) => {
    const target = path.join(CONTENT_ROOT, contentDirName(show));
    const candidates = [
      ...findContentDirs(LEGACY_ROOT, show.dateId).map((d) => path.join(LEGACY_ROOT, d)),
      ...findContentDirs(CONTENT_ROOT, show.dateId).map((d) => path.join(CONTENT_ROOT, d)),
    ];
    candidates.forEach((c) => claimed.add(c));

    if (candidates.length === 0) {
      return;
    }
    if (candidates.length > 1) {
      conflicts.push(`${show.dateId}: multiple folders (${candidates.join(', ')})`);
      return;
    }
    const source = candidates[0];
    if (source === target) {
      unchanged.push(target);
    } else if (fs.existsSync(target)) {
      conflicts.push(`${source} → ${target}: target already exists`);
    } else {
      moves.push({ source, target });
    }
  });

  // date folders that don't belong to any show get moved over with their names as-is
  const orphans = [];
  listDateDirs(LEGACY_ROOT).forEach((d) => {
    const source = path.join(LEGACY_ROOT, d);
    if (!claimed.has(source)) {
      const target = path.join(CONTENT_ROOT, d);
      orphans.push(source);
      if (fs.existsSync(target)) {
        conflicts.push(`${source} → ${target}: target already exists`);
      } else {
        moves.push({ source, target });
      }
    }
  });
  listDateDirs(CONTENT_ROOT).forEach((d) => {
    const dir = path.join(CONTENT_ROOT, d);
    if (!claimed.has(dir)) {
      orphans.push(dir);
    }
  });

  return {
    moves, unchanged, conflicts, orphans,
  };
}

if (require.main === module) {
  const apply = process.argv.includes('--apply');
  const shows = loadShows('data/data.js');
  const {
    moves, unchanged, conflicts, orphans,
  } = planMoves(shows);

  moves.forEach(({ source, target }) => console.log(`${source} → ${target}`));
  if (orphans.length > 0) {
    console.log(`\nFolders with no matching show (moved without renaming): ${orphans.join(', ')}`);
  }
  if (conflicts.length > 0) {
    console.log('\nSkipped:');
    conflicts.forEach((c) => console.log(`  ${c}`));
  }

  const legacyDb = path.join(LEGACY_ROOT, EXPORT_DB);
  const moveDb = fs.existsSync(legacyDb) && !fs.existsSync(path.join(CONTENT_ROOT, EXPORT_DB));
  if (moveDb) {
    console.log(`\n${legacyDb} → ${path.join(CONTENT_ROOT, EXPORT_DB)}`);
  }

  console.log(`\n${moves.length} to move, ${unchanged.length} already correct, ${conflicts.length} skipped`);

  if (!apply) {
    console.log('Dry run, nothing changed. Re-run with --apply to move folders.');
    process.exit(0);
  }

  fs.mkdirSync(CONTENT_ROOT, { recursive: true });
  moves.forEach(({ source, target }) => fs.renameSync(source, target));
  if (moveDb) {
    fs.renameSync(legacyDb, path.join(CONTENT_ROOT, EXPORT_DB));
  }
  console.log('Done.');
}

module.exports = { planMoves };
