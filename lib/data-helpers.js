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
