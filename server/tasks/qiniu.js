const qiniu = require('qiniu')
const nanoid = require('nanoid')
const config = require('../config')

const bucket = config.qiniu.bucket
const AK = config.qiniu.AK
const SK = config.qiniu.SK
const mac = new qiniu.auth.digest.Mac(AK, SK)

const cfg = new qiniu.conf.Config()
const client = new qiniu.rs.BucketManager(mac, config)

const uploadToQiniu = async (url, key) => {
  return new Promise((resolve, reject) => {
    client.fetch(url, bucket, key, (err, ret, info) => {
      if (err) {
        reject(err)
      } else {
        if (info.statusCode === 200) {
          resolve({ key })
        } else {
          reject(info)
        }
      }
    })
  })
}

;(async () => {
  let movies = [
    {
        video: 'http://vt1.doubanio.com/201804030006/f584561c1060e05935dba1f3fec1c70d/view/movie/M/302270967.mp4',
        doubanId: '3445906',
        poster: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2512717509.jpg',
        cover: 'https://img3.doubanio.com/img/trailer/medium/2514914002.jpg?'
    }
  ]

  movies.map(async movie => {
    if (movie.video && !movie.key) {
      try {
        console.log('正在传递video')
        let videoData = await uploadToQiniu(movie.video, nanoid() + '.mp4')
        console.log('正在传递cover')
        let coverData = await uploadToQiniu(movie.cover, nanoid() + '.png')
        console.log('正在传递poster')
        let posterData = await uploadToQiniu(movie.poster, nanoid() + '.png')

        if (videoData.key) {
          movie.videoKey = videoData.key
        }
        if (coverData.key) {
          movie.coverKey = coverData.key
        }
        if (posterData.key) {
          movie.posterKey = posterData.key
        }

        console.log(movie)
        // {
        //   video: 'http://vt1.doubanio.com/201804030006/f584561c1060e05935dba1f3fec1c70d/view/movie/M/302270967.mp4',
        //   doubanId: '3445906',
        //   poster: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2512717509.jpg',
        //   cover: 'https://img3.doubanio.com/img/trailer/medium/2514914002.jpg?',
        //   videoKey: 'http://p8uoi0h96.bkt.clouddn.com/~kpy2Xu_LnTSXzg6KfvxN.mp4',
        //   coverKey: 'http://p8uoi0h96.bkt.clouddn.com/QUgsMfFVVYocjLncH5qXo.png',
        //   posterKey: 'http://p8uoi0h96.bkt.clouddn.com/J7ft8yVf7Ohmgs70gCc4x.png'
        // }
      } catch (err) {
        console.log(err)
      }
    }
  })
})()
