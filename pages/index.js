import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Image } from 'react-feather';
import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { getAllShows, getAllGenres, getAllYears } from '../lib/data-helpers';

const GENRES_FILTER_RESET = '[all genres]';
const YEARS_FILTER_RESET = '[all years]';

function FilterDropdown({ options, placeholder, selected, onChange, isOpen, onToggle }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        if (isOpen) onToggle(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        type="button"
        className={styles.dropdownControl}
        onClick={() => onToggle(!isOpen)}
      >
        {selected || placeholder}
      </button>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles.dropdownOption} ${selected === option ? styles.dropdownOptionSelected : ''}`}
              onClick={() => {
                onChange(option);
                onToggle(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function filterShows(allShows, genre, year) {
  let filtered = allShows;
  if (genre) filtered = filtered.filter((s) => s.genres.includes(genre));
  if (year) filtered = filtered.filter((s) => s.date.indexOf(year) > -1);
  return filtered;
}

export default function Home({ allShows, allGenres, allYears }) {
  const router = useRouter();
  const { view, genre, year } = router.query;

  const viewMode = view === 'list' ? 'list' : 'photo';
  const selectedGenre = genre || null;
  const selectedYear = year || null;
  const shows = filterShows(allShows, selectedGenre, selectedYear);

  const [openDropdown, setOpenDropdown] = useState(null);

  const showsWithPhotos = allShows.filter((s) => s.hasMedia);

  const getHeadlinerImage = (show) => {
    const highlighted = show.images.find((img) => img.highlight);
    return highlighted || show.images[0];
  };

  const thumbPath = (imagePath) =>
    imagePath.replace(/^\/images\//, '/thumbs/').replace(/\.\w+$/, '.webp');

  function updateQuery(params) {
    const query = { ...router.query, ...params };
    Object.keys(query).forEach((k) => { if (!query[k]) delete query[k]; });
    router.push({ pathname: '/', query }, undefined, { shallow: true });
  }

  function setViewMode(mode) {
    updateQuery({ view: mode === 'photo' ? undefined : mode });
  }

  function genreSelected(value) {
    if (value === GENRES_FILTER_RESET) {
      updateQuery({ genre: undefined, year: undefined });
    } else {
      updateQuery({ genre: value, year: undefined });
    }
  }

  function yearSelected(value) {
    if (value === YEARS_FILTER_RESET) {
      updateQuery({ genre: undefined, year: undefined });
    } else {
      updateQuery({ year: value, genre: undefined });
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
                      src={thumbPath(image.path)}
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
              <FilterDropdown
                options={allGenres}
                placeholder="[genre]"
                selected={selectedGenre}
                onChange={genreSelected}
                isOpen={openDropdown === 'genre'}
                onToggle={(open) => setOpenDropdown(open ? 'genre' : null)}
              />
              <FilterDropdown
                options={allYears}
                placeholder="[year]"
                selected={selectedYear}
                onChange={yearSelected}
                isOpen={openDropdown === 'year'}
                onToggle={(open) => setOpenDropdown(open ? 'year' : null)}
              />
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

  const allYears = getAllYears().sort((a, b) => b.localeCompare(a));
  allYears.push(YEARS_FILTER_RESET);
  return {
    props: {
      allShows: shows, allGenres, allYears,
    },
  };
}
