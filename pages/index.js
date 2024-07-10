import Head from 'next/head';
import Link from 'next/link';
import moment from 'moment';
import { Image } from 'react-feather';
import Dropdown from 'react-dropdown';
import { useState } from 'react';
import styles from '../styles/Home.module.css';
import { getAllShows, getAllGenres, getAllYears } from '../lib/data-helpers';

const GENRES_FILTER_RESET = '[all genres]';
const YEARS_FILTER_RESET = '[all years]';

export default function Home({ allShows, allGenres, allYears }) {
  const [shows, setShows] = useState(allShows);

  function genreSelected(selectedGenre) {
    const { value } = selectedGenre;
    console.log('selectedGenre', selectedGenre);
    if (value === GENRES_FILTER_RESET) {
      setShows(allShows);
    } else {
      setShows(allShows.filter((s) => s.genres.includes(value)));
    }
  }

  function yearSelected(selectedYear) {
    const { value } = selectedYear;
    if (value === YEARS_FILTER_RESET) {
      setShows(allShows);
    } else {
      setShows(allShows.filter((s) => s.date.indexOf(value) > -1));
    }
  }

  function mediaSelected(event) {
    const { checked } = event.target;
    setShows(allShows.filter((s) => !checked || s.hasMedia));
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Shows Log</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Shows Log
          </h1>
        </div>
        <div className={styles.filterContainer}>
          <Dropdown options={allGenres} placeholder="[genre]" onChange={genreSelected} className={styles.dropdown} />
          <Dropdown options={allYears} placeholder="[year]" onChange={yearSelected} className={styles.dropdown} />
          <div className={styles.filterCheckbox}>
            <Image size="15" className={styles.icon} />
            <input type="checkbox" defaultChecked={false} onChange={mediaSelected} />
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.gridChild}>
            {shows.map((show) => (
              <div key={show.key} className={styles.show}>
                { show.images.length > 0
                  && (
                  <Link href="/show/[dateId]" as={`/show/${show.dateId}`}>
                    [
                    {show.date}
                    ]
                  </Link>
                  )}
                { show.images.length === 0 && `[${show.date}]` }
                {' '}
                <span className="artist">{show.artists.join(' • ')}</span>
                {' @ '}
                <span className="venue">{show.venue}</span>
                <span>
                  {' '}
                  { show.images.length > 0 && <Image size="15" className={styles.icon} /> }
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>Created by Patrick Marchwiak. </span>
        <a href="https://github.com/pmarchwiak/showslog">
          <img className={styles.githubIcon} src="/images/GitHub-Mark-Light-64px.png" alt="github icon" />
        </a>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  const shows = getAllShows().slice().reverse().map((show) => {
    const displayDate = moment(show.date, 'M-DD-YYYY').format('YYYY-MM-DD');
    return { ...show, displayDate };
  });
  console.log('shows sample:', shows.slice(0, 5));
  const allGenres = getAllGenres();
  allGenres.push(GENRES_FILTER_RESET);

  const allYears = getAllYears();
  allYears.push(YEARS_FILTER_RESET);
  return {
    props: {
      allShows: shows, allGenres, allYears,
    },
  };
}
