const parse = require('csv-parse/lib/sync')

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
  }
  // Read the file and print its contents.
  var fs = require('fs')
    , filename = process.argv[2];
  fs.readFile(filename, 'utf8', function(err, tsvData) {
    if (err) throw err;
    console.log('OK: ' + filename);
    console.log(tsvData);

    const shows = parse(tsvData, {
        columns: true,
        delimiter: "\t",
        relaxColumnCount: true,
        skip_empty_lines: true
      }).map(function(show) {
        console.log(show.date);

        show.date = show.date.replace(/\//g, "-");
        var eventName = "";
        if (show.artists) {
            var eventNameDelimIdx = show.artists.indexOf(":");
            var firstCommaIdx = show.artists.indexOf(",");
            var artistsStartIdx = 0;
            if (firstCommaIdx > eventNameDelimIdx) {
                eventName = show.artists.substr(0, eventNameDelimIdx);
                artistsStartIdx = eventNameDelimIdx + 1;
            }
            const artists = show.artists.substr(artistsStartIdx == -1 ? 0 : artistsStartIdx).split(",")
                .map(function(artist) {return artist.trim();});
            console.log(eventName);
            console.log(artists);
            show.artists = artists;

       }

        return show;

      })
      .filter(function(show) {return show.date.length > 0});

      console.log(shows);

      // FIXME don't do this.
      var fileContents = "const showsList = " + JSON.stringify(shows, null, 2);
      fileContents += "\n";
      fileContents += "export default showsList"

        // write JSON string to a file
        fs.writeFile('data/data.js', fileContents, (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved.");
        });




  });