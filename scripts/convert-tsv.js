const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const path = require('path');
const pino = require('pino');
const { exec } = require('child_process');

const log = pino({
  prettyPrint: {
    levelFirst: true,
    ignore: 'pid,hostname,time',
  },
});

function isImageExtension(filename) {
  const ext = filename.substr(filename.lastIndexOf('.') + 1);
  const valid = new Set(['png', 'jpg', 'jpeg']);
  return valid.has(ext.toLowerCase());
}

function isGeneratedName(filename) {
  // Remove file extension if present
  const nameWithoutExtension = filename.split('.')[0];

  // UUID regex pattern
  const uuidPattern = /^[0-9a-fA-F-]{5,}/i;

  if (uuidPattern.test(nameWithoutExtension)) {
    return true;
  }
  if (filename.startsWith('IMG') || filename.startsWith('DSC')) {
    return true;
  }

  return false;
}

/**
 * turn "title (3)" into "title"
 *  or
 * "title (DSC233)" into "title"
 */
function cleanTitle(title) {
  return title.replace(/\s+\(((\d+)|(DSC\d+))\)$/, '');
}

function getImagesForDateAndMkDir(dateDirName) {
  const imagesDir = path.join('public/images', dateDirName);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
    console.log('Created dir ', imagesDir);
  }
  const filenames = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

  const images = filenames.filter(isImageExtension).map((filename) => {
    let title = null;
    if (!isGeneratedName(filename)) {
      title = filename.split('.')[0];
      title = cleanTitle(title);
    }
    const filePath = path.join(imagesDir, filename);
    console.log('Found image ', filePath);
    // anything in public dir is accessible as root

    return {
      path: `/images/${dateDirName}/${filename}`,
      title,
    };
  });

  return images;
}

// if titles match artist names, have those appear first, in the given artists order
function sortImagesByArtists(imageObjects, artists) {
  const sortedImages = [];
  const imageObjSet = new Set(imageObjects);

  artists.forEach((artist) => {
    console.log(artist);
    // find any images that match the title and remove them from the set
    imageObjSet.forEach((obj) => {
      if (obj.title && obj.title.toLowerCase() === artist.toLowerCase()) {
        imageObjSet.delete(obj);
        sortedImages.push(obj);
      }
    });
  });

  // if there any unmatched images, add them to the end
  imageObjSet.forEach((obj) => {
    sortedImages.push(obj);
  });

  return sortedImages;
}

function openPhotosAtDate(dateStr) {
  // Convert date to YYYY-MM-DD format if it's a Date object
  // Parse the date string as a local date (ignoring time zone)
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Month is 0-based in JavaScript Date

  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // TODO this sort of works but the "All Photos" menu item
  // is only available when not viewing a single photo.
  // Some ways to fix:
  // - Find some other way to get to a view where the serach bar is available.
  // - Handle the failure and move to a different view first.

  // AppleScript to open Photos and navigate to the date
  const appleScript = `
    tell application "Photos"
      activate
      delay 1 -- Wait for Photos to open
      
      -- Navigate to Library under Photos menu
      tell application "System Events"
        tell process "Photos"
          click menu item "All Photos" of menu "View" of menu bar 1
          delay 1
          keystroke "f" using {command down} -- Open search bar
          delay 1
          keystroke "${formattedDate}" -- Enter the formatted date
          delay 1
          key code 36 -- Press Enter
        end tell
      end tell
      
      -- Set the search filter to the specified date
      search for "${formattedDate}"
    end tell
  `;

  // Execute the AppleScript
  return new Promise((resolve, reject) => {
    exec(`osascript -e '${appleScript}'`, (error, stdout) => {
      if (error) {
        reject(new Error(`Failed to open Photos: ${error.message}`));
        return;
      }
      resolve(stdout);
    });
  });
}

if (require.main === module) {
  // Make sure we got a filename on the command line.
  if (process.argv.length < 3) {
    console.log(`Usage: node ${process.argv[1]} FILENAME`);
    process.exit(1);
  }

  const filename = process.argv[2];

  // TODO add a mode to list shows that are missing
  fs.readFile(filename, 'utf8', (err, tsvData) => {
    if (err) throw err;
    log.debug(`OK: ${filename}`);
    log.debug(tsvData);

    const dateCount = {};
    const shows = parse(tsvData, {
      columns: true,
      delimiter: '\t',
      relaxColumnCount: true,
      skip_empty_lines: true,
    }).map((show, idx) => {
      log.debug(show.date);

      // Support multiple shows in one day by adding a suffix
      let dateId = show.date;
      if (show.date in dateCount) {
        dateCount[show.date] += 1;
        dateId = `${dateId}_${dateCount[show.date]}`;
      } else {
        dateCount[show.date] = 1;
      }

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

      const images = getImagesForDateAndMkDir(dateId);

      const sortedImages = sortImagesByArtists(images, artists);

      const hasMedia = images.length > 0;

      return {
        date: show.date,
        dateId,
        artists,
        venue: show.venue.trim(),
        genres,
        youtube,
        link,
        images: sortedImages,
        hasMedia,
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

    // TODO update this to show more than one recent date where photos are missing
    // and allow it to run via a different command line arg
    const mostRecentMissingPhotos = shows
      .filter((show) => show && show.images.length === 0)
      .sort((a, b) => (b.date > a.date ? 1 : -1))[0];

    if (mostRecentMissingPhotos) {
      console.log(`Most recent date with missing photos: ${mostRecentMissingPhotos.date}`);
    } else {
      console.log('All shows have photos.');
    }

    // Disable this for now until it's less buggy
    // openPhotosAtDate(mostRecentMissingPhotos.date);
  });
}

module.exports = {
  isImageExtension,
  isGeneratedName,
  cleanTitle,
  sortImagesByArtists,
};
