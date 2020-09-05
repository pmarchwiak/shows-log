import Head from 'next/head';
import Link from 'next/link';
import moment from 'moment';
import styles from '../styles/Home.module.css';
import { getShowsList, getAllGenres, getAllYears } from './data-helpers';
import { Image } from 'react-feather';
import Dropdown from 'react-dropdown';
import { useState } from 'react'

const GENRES_FILTER_RESET = '[all genres]';
const YEARS_FILTER_RESET = '[all years]';

export default function Home({ allShows , allGenres , allYears }) {

  const [shows, setShows] = useState(allShows);

  function genreSelected(selectedGenre) {
    const { value, label } = selectedGenre;
    console.log("selectedGenre",selectedGenre);
    if (value === GENRES_FILTER_RESET) {
      setShows(allShows);
    }
    else {
      setShows(allShows.filter((s) => s.genres.includes(value)));
    }
  };

  function yearSelected(selectedYear) {
    const { value, label } = selectedYear;
    if (value === YEARS_FILTER_RESET) {
      setShows(allShows);
    }
    else {
      setShows(allShows.filter((s) => s.date.indexOf(value) > -1));
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Shows</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          shows list
        </h1>
        <Dropdown options={allGenres} placeholder={'filter by genre...'} onChange={genreSelected} className='dropdown'/>
        <Dropdown options={allYears} placeholder={'filter by year...'} onChange={yearSelected} className='dropdown'/>
        <div className={styles.grid}>
          <p>
            {shows.map((show) => (
              <div className={styles.show}>
                <Link href="/show/[date]" as={`/show/${show.date}`}>
               <a>
                 [
                 {show.displayDate}
                 ]
               </a>
                </Link>
                {' '}
                <span className="artist">{show.artists.join(' | ')}</span>
                {' @ '}
                <span className="venue">{show.venue}</span>
                <span>{' '}{ show.images.length > 0 && <Image /> }</span>
              </div>
            ))}
          </p>
        </div>
        <p className={styles.description}>
          Get started by editing
          {' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by
          {' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  const shows = getShowsList().slice().reverse().map((show) => {
    const displayDate = moment(show.date, 'M-DD-YYYY').format('YYYY-MM-DD');
    return { ...show, displayDate };
  });
  console.log("shows sample:", shows.slice(0, 5));
  const allGenres = getAllGenres();
  allGenres.push(GENRES_FILTER_RESET);

  const allYears = getAllYears();
  allYears.push(YEARS_FILTER_RESET);
  return {
    props: {
      allShows: shows, allGenres, allYears
    },
  };
}
