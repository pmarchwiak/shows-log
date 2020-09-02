import { useRouter } from 'next/router'
import showsData from '../../data/data.js'

function Page(shows) {
    const router = useRouter()

    const date = router.query.date

    console.log("oh hi, the date is ", date)
    console.log(Object.keys(shows.shows))
    const show = shows.shows.find(show => show.date === date)
    console.log()

    return (
        <h1>{show.date} at {show.venue}</h1>
    )
  }

  export async function getStaticProps() {
    return {
      props: {
        shows: showsData.shows,
      },
    }
  }

  export async function getStaticPaths() {
    const paths = showsData.shows.map((show) => ({
        params: { date: show.date },
      }))
    return {
        paths,
      fallback: false
    };
  }
  

export default Page