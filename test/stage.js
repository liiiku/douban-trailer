/**
 * 1、关注process.nextTick在时间模型中的优先级
 * 2、libuv相关
 * 3、evnetEmitter相关
 * 
process.nextTick 的回调
出大事了
Promise的第 1 次回调
Promise的第 2 次回调
process.nextTick 的第 2 次回调
0毫秒到期执行的定时器回调
immediate 立即回调
完成文件 1 读操作的回调
完成文件 2 读操作的回调
100毫秒到期执行的定时器回调
200毫秒到期执行的定时器回调


在第二个回调 promise的then执行完毕之后，因为在第一个回调里面，新加入了一个promise.nextTick，在这个结束以后，当前的循环体
里面还有一个未执行的nextTick，执行完之后，发现当前循环体重没有了nextTick promise这样的microtask，就会进入到timers阶段
100 200ms可能还没有到期，这时候就会进入到poll阶段，读文件的操作

这个结果不一样的原因，在于 readfile 这里的处理，readfile 也就是 IO 是不稳定的，执行时间不等，导致它如果没 ready，
那么timer 后就会进入到 check 执行 setImmediate，就是你这种结果，如果 IO ready，那么就是视频中的效果，这就是 Nodejs 
里面 IO 魔性的地方，你可以把这个文件放到 /test 目录下，然后把 ./package.json 路径改成 ../package.json，多执行几次，
会发现结果并不总是一致的，原因就在于 eventloop 转起来的时候，readfile 是否 ready，timer 是否到期进栈，这两个不确定因素会
导致 setImmediate 会不会紧挨着 setTimeout 执行
 */

const { readFile } = require('fs')
const EventEmitter = require('events')

class EE extends EventEmitter {}

const yy = new EE()

yy.on('event', () => {
    console.log('出大事了')
})

setTimeout(() => {
    console.log('0毫秒到期执行的定时器回调')
}, 0)

setTimeout(() => {
    console.log('100毫秒到期执行的定时器回调')
}, 100)

setTimeout(() => {
    console.log('200毫秒到期执行的定时器回调')
}, 200)

readFile('../README.md', 'utf-8', data => {
    console.log('完成文件 1 读操作的回调')
})

readFile('./sync.js', 'utf-8', data => {
    console.log('完成文件 2 读操作的回调')
})

setImmediate(() => {
    console.log('immediate 立即回调')
})

process.nextTick(() => {
    console.log('process.nextTick 的回调')
})

Promise.resolve()
    .then(() => {
        yy.emit('event')
        process.nextTick(() => {  // IO饥饿
            console.log('process.nextTick 的第 2 次回调')
        })
        console.log('Promise的第 1 次回调')
    })
    .then(() => {
        console.log('Promise的第 2 次回调')
    })