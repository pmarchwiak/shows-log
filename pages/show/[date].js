import moment from 'moment';
import styles from '../../styles/Home.module.css';
import showsList from '../../data/data';
import { getShowForDate, getImagesForDate } from '../data-helpers';

function Page(props) {
  const { show, images } = props;
  const displayDate = moment(show.date, 'M-DD-YYYY').format('MMMM Do, YYYY');
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
      </div>
      <div className={styles.photoContainer}>
        {images.map((imgPath) => <div><img className={styles.showPhoto} alt="a band" src={imgPath} /></div>)}
      </div>
    </div>
  );
}

export async function getStaticProps(context) {
  const { date } = context.params;
  const show = getShowForDate(date);
  console.log(show);

  const images = getImagesForDate(date);

  return {
    props: {
      show, images,
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
