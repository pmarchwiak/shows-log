import { useRouter } from 'next/router'
import fs from 'fs'
import path from 'path'
import moment from 'moment'
import styles from '../../styles/Home.module.css'
import showsList from '../../data/data.js'

function Page(props) {
    const show = props.show
    const images = props.images
    const displayDate = moment(show.date, "M-DD-YYYY").format("MMMM Do, YYYY");
    console.log("in Page", show)

    return (
        <div>
        <div className={styles.container}>
            <h3>{displayDate} at <span className="venue">{show.venue}</span></h3>
            {show.artists.map((artist) => <div><h2>{artist}</h2></div>)}
        </div>
        <div className={styles.photoContainer}>
            {images.map((path) => <div><img className={styles.showPhoto} src={path}></img></div>)}
        </div>
        </div>
    )
  }

  export async function getStaticProps(context) {
    const date = context.params.date

    const show = showsList.find(show => show.date === date)
    console.log(show)

    const dirDate = moment(show.date, "M-DD-YYYY").format("YYYY-MM-DD");

    const imagesDir = path.join(process.cwd(), 'public/images', dirDate)
    const filenames = fs.readdirSync(imagesDir)

    const displayDate = moment(show.date, "M-DD-YYYY").format("MMMM Do, YYYY");
    console.log(displayDate)
      
    const images = filenames.map((filename) => {
      const filePath = path.join('/images', dirDate, filename)
      console.log("Found image ", filePath)
      return filePath
    })

    return {
      props: {
        show, images
      },
    }
  }

  export async function getStaticPaths() {
    const paths = showsList.map((show) => ({
        params: { date: show.date },
      }))
    return {
        paths,
      fallback: false
    };
  }
  

export default Page