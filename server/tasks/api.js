// http://api.douban.com//v2/movie/subject/1764796

const rp = require('request-promise-native')

async function fetchMovie (item) {
    const url = `http://api.douban.com//v2/movie/subject/${item.doubanId}`
    const res = await rp(url)

    return res
}

;(async () => {
    let movies = [
        { 
            doubanId: 27185291,
            title: '热血街舞团',
            rate: 5.8,
            poster: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2503658040.jpg' 
        },
        { 
            doubanId: 26654498,
            title: '爱你，西蒙',
            rate: 8.2,
            poster: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2501892505.jpg' 
        }
    ]

    movies.map(async movie => {
        let movieData = await fetchMovie(movie)

        try {
            movieData = JSON.parse(movieData)
            console.log(movieData.tags)
            console.log(movieData.summary)
        } catch (err) {
            console.log(err)
        }

        // console.log(movieData)
    })
})()