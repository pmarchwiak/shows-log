import Head from 'next/head';
import moment from 'moment';
import styles from '../styles/Home.module.css';
import { getAllShows, getAllGenres, getAllYears, getArtistCounts } from '../lib/data-helpers';

const GENRES_FILTER_RESET = '[all genres]';
const YEARS_FILTER_RESET = '[all years]';

export default function Stats({ allShows, allGenres, allYears, artistCounts }) {
  const totalCount = allShows.length;
  const topArtistCounts = artistCounts.slice(0, 10);
  return (
    <div className={styles.container}>
      <Head>
        <title>Shows Log Stats</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Shows Log Stats
        </h1>
        <div className={styles.grid}>
          <p>
            <h3>Total Shows:</h3>
            { totalCount }
          </p>
          <p>
            <h3>Top Artists</h3>
            {topArtistCounts.map(([artist, count]) => (
              <div>
                {artist}
                {': '}
                {count}
              </div>
            ))}
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Created by Patrick Marchwiak.</p>
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

  const artistCounts = getArtistCounts();
  console.log("artistCounts", artistCounts);
  return {
    props: {
      allShows: shows, allGenres, allYears, artistCounts,
    },
  };
}
