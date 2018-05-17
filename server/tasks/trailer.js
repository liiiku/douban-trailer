const cp = require('child_process')
const { resolve } = require('path')

;(async () => {
    const script = resolve(__dirname, '../crawler/video')
    const child = cp.fork(script, [])  // cp.fork 可以派生出一个子进程
    let invoked = false  // 表示爬虫脚本有没有被运行过

    child.on('error', err => {
        if (invoked) return
        
        invoked = true

        console.log(err)
    })

    child.on('exit', code => {
        if (invoked) return

        invoked = true
        let err = code === 0 ? null : new Error('exit code ' +  code)

        console.log(err)
    })

    child.on('message', data => {
        // https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2512717509.jpg
        console.log(29, data)
    })
})()