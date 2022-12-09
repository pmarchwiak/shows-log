const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const path = require('path');
const pino = require('pino');

const log = pino({
  prettyPrint: {
    levelFirst: true,
    ignore: 'pid,hostname,time',
  },
});

function isImageExtension(filename) {
  const ext = filename.substr(filename.lastIndexOf(".") + 1);
  const valid = new Set(["png", "jpg", "jpeg"])
  return valid.has(ext.toLowerCase());
}

function getImagesForDate(date) {
  const imagesDir = path.join('public/images', date);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
    console.log('Created dir ', imagesDir);
  }
  const filenames = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

  const images = filenames.filter(isImageExtension).map((filename) => {
    const filePath = path.join(imagesDir, filename);
    console.log('Found image ', filePath);
    // anything in public dir is accessible as root
    return `/images/${date}/${filename}`;
  });
  return images;
}

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log(`Usage: node ${process.argv[1]} FILENAME`);
  process.exit(1);
}

const filename = process.argv[2];

fs.readFile(filename, 'utf8', (err, tsvData) => {
  if (err) throw err;
  log.debug(`OK: ${filename}`);
  log.debug(tsvData);

  const shows = parse(tsvData, {
    columns: true,
    delimiter: '\t',
    relaxColumnCount: true,
    skip_empty_lines: true,
  }).map((show, idx) => {
    log.debug(show.date);

    if (!show.date || !show.artists) {
      log.warn(`show or date are null for line ${idx}`, { show });
      return null;
    }

    let artists = [];
    if (show.artists) {
      // Festivals precede the artist list and end with a colon
      const eventNameDelimIdx = show.artists.indexOf(':');

      const firstCommaIdx = show.artists.indexOf(',');
      let artistsStartIdx = 0;
      if (firstCommaIdx > eventNameDelimIdx) {
        artistsStartIdx = eventNameDelimIdx + 1;
      }
      artists = show.artists.substr(artistsStartIdx === -1 ? 0 : artistsStartIdx).split(',')
        .map((artist) => artist.trim());
    }

    let genres = [];
    if (show.genres) {
      genres = show.genres.split(',').map((g) => g.trim());
    }

    let youtube = '';
    let link = '';
    if (show.links) {
      // assume just one link for now
      if (show.links.indexOf('youtube.com') >= 0) {
        youtube = show.links;
      } else {
        link = show.links;
      }
    }

    const images = getImagesForDate(show.date);

    const hasMedia = images.length > 0;

    return {
      date: show.date, artists, venue: show.venue.trim(), genres, youtube, link, images, hasMedia,
    };
  }).filter((s) => s !== null);

  // FIXME too hacky?
  let fileContents = `const showsList = ${JSON.stringify(shows, null, 2)}`;
  fileContents += '\n';
  fileContents += 'export default showsList';

  // write JSON string to a file
  const filePath = 'data/data.js';
  fs.writeFile(filePath, fileContents, (writeErr) => {
    if (writeErr) {
      throw writeErr;
    }
    log.info(`Wrote JSON data to ${filePath}`);
  });
});
