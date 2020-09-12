import showsList from '../data/data';

export function getShowForDate(date) {
  return showsList.find((s) => s.date === date);
}

export function getAllGenres() {
  const allGenres = Array.from(new Set(
    showsList.flatMap((s) => s.genres),
  ));
  console.log('allgenres', allGenres);
  return allGenres.sort();
}

export function getAllYears() {
  const allYears = Array.from(new Set(showsList.map((s) => s.date.split('-')[0])));
  console.log('all years', allYears);
  return allYears.sort();
}

export function getShowsByGenre(genre) {
  return showsList.filter((s) => s.genre.split(',').includes(genre));
}

export function getShowsList() {
  return showsList;
}

export function getMyArtists() {
  return ['Big Ten Football', 'Rise of Marakara'];
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
