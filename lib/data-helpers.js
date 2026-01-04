import showsList from '../data/data';

const shows = showsList.map((show) => {
  const showWithKey = { ...show, key: (show.artists + show.venue + show.date) };
  return showWithKey;
});

export function getShowForDateId(dateId) {
  return shows.find((s) => s.dateId === dateId);
}

export function getAllGenres() {
  const allGenres = Array.from(new Set(
    shows.flatMap((s) => s.genres),
  ));
  return allGenres.sort();
}

export function getAllYears() {
  const allYears = Array.from(new Set(shows.map((s) => s.date.split('-')[0])));
  return allYears.sort();
}

export function getShowsByGenre(genre) {
  return shows.filter((s) => s.genre.split(',').includes(genre));
}

export function getAllShows() {
  return shows;
}

export function getMyArtists() {
  return ['Big Ten Football', 'Rise of Marakara', 'Soft Shape'];
}

export function getArtistCounts() {
  const artistCounts = new Map();
  showsList.flatMap((s) => s.artists).forEach((artist) => {
    let count = 0;
    if (artistCounts.has(artist) && !getMyArtists().includes(artist)) {
      count = artistCounts.get(artist);
    }
    artistCounts.set(artist, count + 1);
  });

  // sort map by count desc
  return Array.from(artistCounts.entries()).sort((a, b) => b[1] - a[1]);
}
