import Link from 'next/link';
import moment from 'moment';
import styles from '../../styles/Home.module.css';
import showsList from '../../data/data';
import { getShowForDateId } from '../../lib/data-helpers';

function Page(props) {
  const { show } = props;
  const displayDate = moment(show.date, 'YYYY-MM-DD').format('MMMM Do, YYYY');
  const closeAllZooms = () => {
    document.querySelectorAll('.clickZoom input[type="checkbox"]:checked').forEach((cb) => {
      cb.checked = false;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeAllZooms();
    }
  };

  const galleryImages = show.images.map((img) => (
    <div key={img.path} className="imgContainer clickZoom">
      <input
        type="checkbox"
        id={`cb-${img.path}`}
        onChange={(e) => {
          if (e.target.checked) {
            document.addEventListener('keydown', handleKeyDown);
          } else {
            document.removeEventListener('keydown', handleKeyDown);
          }
        }}
      />
      <label htmlFor={`cb-${img.path}`} className="zoomOverlay" aria-label="Close zoomed image" />
      <label htmlFor={`cb-${img.path}`} className="zoomContent">
        <img src={img.path} alt={img.title || 'Show photo'} />
        <p>{img.title}</p>
      </label>
    </div>
  ));

  const carousel = galleryImages.length > 0 ? (
    <div className={styles.photoContainer}>
      {galleryImages}
    </div>
  ) : '';

  return (
    <div className="showContainer">
      <div className="showMetadata">
        <Link href="/" className="showLink">[back]</Link>
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
  );
}

export async function getStaticProps(context) {
  const { dateId } = context.params;
  const show = getShowForDateId(dateId);
  // console.log('The show is ', show);

  return {
    props: {
      show,
    },
  };
}

export async function getStaticPaths() {
  const paths = showsList.map((show) => ({
    params: { dateId: show.dateId },
  }));
  return {
    paths,
    fallback: false,
  };
}

export default Page;
