import fs from 'fs';
import path from 'path';
import moment from 'moment';
import showsList from '../data/data';

export function getShowForDate(date) {
  return showsList.find((s) => s.date === date);
}

export function getShowsList() {
  console.log('trying to get list');
  return showsList;
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
