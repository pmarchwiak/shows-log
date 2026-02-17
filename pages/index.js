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
  const [viewMode, setViewMode] = useState('photo');

  const showsWithPhotos = allShows.filter((s) => s.hasMedia);

  const getHeadlinerImage = (show) => {
    const highlighted = show.images.find((img) => img.highlight);
    if (highlighted) return highlighted;

    if (show.images.length === 1) return show.images[0];

    const headliner = show.artists[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = show.images.find((img) => {
      const titleNormalized = (img.title || img.path).toLowerCase().replace(/[^a-z0-9]/g, '');
      return titleNormalized.includes(headliner);
    });
    return match || show.images[0];
  };


  function genreSelected(selectedGenre) {
    const { value } = selectedGenre;
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
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.viewToggleButton} ${viewMode === 'photo' ? styles.viewToggleButtonActive : ''}`}
              onClick={() => setViewMode('photo')}
            >
              Photo Highlights
            </button>
            <button
              type="button"
              className={`${styles.viewToggleButton} ${viewMode === 'list' ? styles.viewToggleButtonActive : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
        {viewMode === 'photo' && (
          <div className={styles.photoGrid}>
            {showsWithPhotos.map((show) => {
              const formattedDate = moment(show.date, 'YYYY-MM-DD').format('MMM D, YYYY');
              const image = getHeadlinerImage(show);
              return (
                <Link href={`/show/${show.dateId}`} key={show.key} className={styles.photoCard}>
                  <div className={styles.photoCardImageWrapper}>
                    <img
                      src={image.path}
                      alt={image.title || `${show.artists.join(', ')} at ${show.venue}`}
                      className={styles.photoCardImage}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.photoCardInfo}>
                    <p className={styles.photoCardArtist}>{show.festival || show.artists[0]}</p>
                    <p className={styles.photoCardDetails}>{formattedDate} @ {show.venue}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {viewMode === 'list' && (
          <>
            <div className={styles.filterContainer}>
              <Dropdown options={allGenres} placeholder="[genre]" onChange={genreSelected} className={styles.dropdown} />
              <Dropdown options={allYears} placeholder="[year]" onChange={yearSelected} className={styles.dropdown} />
            </div>
            <div className={styles.grid}>
              <div className={styles.gridChild}>
                {shows.map((show) => (
                  <div key={show.key} className={styles.show}>
                    { show.images.length > 0
                      && (
                      <Link href={`/show/${show.dateId}`}>
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
          </>
        )}
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
