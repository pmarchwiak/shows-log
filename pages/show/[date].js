import Link from 'next/link';
import { Carousel } from 'react-responsive-carousel';
import moment from 'moment';
import styles from '../../styles/Home.module.css';
import showsList from '../../data/data';
import { getShowForDate } from '../../lib/data-helpers';

function Page(props) {
  const { show } = props;
  const displayDate = moment(show.date, 'YYYY-MM-DD').format('MMMM Do, YYYY');
  const galleryImages = show.images.map((img) => (
    <div key={img}>
      <img src={img} alt="todo" />
    </div>
  ));
  const carousel = galleryImages.length > 0 ? (
    <div className={styles.photoContainer}>
      <Carousel showStatus={false} showThumbs={galleryImages.length > 1}>
        {galleryImages}
      </Carousel>
    </div>
  ) : '';

  return (
    <div>
      <div className={styles.container}>
        <div className="showMetadata">
          <Link href="/" as="/"><a href="/" className="showLink">[back]</a></Link>
          <h1 className="show">
            {displayDate}
          </h1>
          <h4 className="venue">{show.venue}</h4>
          <div className="artistList">
            {show.artists.map((artist) => <div className="artistListItem" key={artist}><div>{artist}</div></div>)}
          </div>
        </div>
        { }
        { }
        { carousel }
      </div>
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
