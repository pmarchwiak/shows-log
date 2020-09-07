import Link from 'next/link';
import moment from 'moment';
import styles from '../../styles/Home.module.css';
import showsList from '../../data/data';
import { getShowForDate } from '../../lib/data-helpers';

function Page(props) {
  const { show } = props;
  const displayDate = moment(show.date, 'YYYY-MM-DD').format('MMMM Do, YYYY');
  console.log('in Page', show);

  return (
    <div>
      <div className={styles.container}>
        <h3>
          {displayDate}
          {' at '}
          <span className="venue">{show.venue}</span>
        </h3>
        {show.artists.map((artist) => <div><h2>{artist}</h2></div>)}
        <div className={styles.photoContainer}>
          {show.images.map((imgPath) => (
            <div key={imgPath} className={styles.showPhoto}>
              <img className={styles.showPhoto} alt="a band" src={imgPath} />
            </div>
          ))}
        </div>
      </div>
      <Link href="/" as="/" className="showLink"><a href="/">[back]</a></Link>
    </div>
  );
}

export async function getStaticProps(context) {
  const { date } = context.params;
  const show = getShowForDate(date);
  console.log(show);

  return {
    props: {
      show,
    },
  };
}

export async function getStaticPaths() {
  const paths = showsList.map((show) => ({
    params: { date: show.date },
  }));
  return {
    paths,
    fallback: false,
  };
}

export default Page;
