import fs from 'fs';
import path from 'path';
import moment from 'moment';
import showsList from '../data/data';

export function getShowForDate(date) {
  return showsList.find((s) => s.date === date);
}

export function getAllGenres() {
  console.log('the showslist', showsList);
  const allGenres = Array.from(new Set(showsList.flatMap((s) => {
    return s.genre.split(',').map((g) => g.trim());
  })));
  console.log('allgenres', allGenres);
  return allGenres.sort();
}

export function getShowsByGenre(genre) {
  return showsList.filter((s) => s.genre.split(',').includes(genre));
}

export function getImagesForDate(date) {
  const dirDate = moment(date, 'M-DD-YYYY').format('YYYY-MM-DD');

  const imagesDir = path.join(process.cwd(), 'public/images', dirDate);
  const filenames = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

  const displayDate = moment(date, 'M-DD-YYYY').format('MMMM Do, YYYY');
  console.log(displayDate);

  const images = filenames.map((filename) => {
    const filePath = path.join('/images', dirDate, filename);
    console.log('Found image ', filePath);
    return filePath;
  });
  return images;
}

export function getShowsList() {
  console.log('trying to get list');
  const theShows = showsList.map((s) => {
    const genres = s.genre && s.genre.length > 0 ? s.genre.split(',') : [];
    const images = getImagesForDate(s.date);
    return { ...s, images, genres };
  });
  return theShows;
}
