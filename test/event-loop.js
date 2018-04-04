/**
 * setImmediate 和 setTimeout(0)  执行的顺序不一定
 *
[阶段3.immediate] immediate 回调1
[阶段3.immediate] immediate 回调2
[阶段3.immediate] immediate 回调3
[阶段1...定时器] 定时器 回调1

或者是

[阶段1...定时器] 定时器 回调1
[阶段3.immediate] immediate 回调1
[阶段3.immediate] immediate 回调2
[阶段3.immediate] immediate 回调3

为什么会这样？
因为在事件循环启动的时候，有可能定时器的回调函数还没有被检测到，那么这个时候就会进入到第二个阶段
那么在第二个阶段发现没有IO的回调来执行的，这样就进入到第三个阶段，也就是check阶段，setImmediate
执行之后再去检查有没有到期的定时器，发现有一个定时器已经到期了



先执行process.nextTick 111-116 执行完之后发现还有一个promise没有被执行，这时候，会开始执行41，43之后，发现有一个
setImmediate，但是现在还没有走到check阶段，所以这个回调并不会执行，这个时候就会进入到定时器阶段，来执行setTimeout
100-109,但是呢在执行回调2的时候，新加了一个nextTick,那么就在下一个阶段之前把这个执行掉，这之后就会进入到io操作里面，第二阶段，
开始执行47，但是在读文件回调1中，有一个process.nextTick 92，这时候就来执行92，执行完发现当前阶段是处在IO阶段，但是没有一个新的
io回调完成，那么就会进入到第三个阶段，执行setImmediate 35-37 这时候会发现在promise 43中也有一个 所以43会被加载这个队列的后面.
并且在刚才的读文件操作中的两个setImmmediate 55 71 行也会被执行，因为当前的阶段是在第三个阶段，第三个阶段执行完之后，会进入下一个
阶段，这时候发现有nextTick,理论上应该先执行nextTick队列，但是这里有个同步的读文件的操作

 */
const { readFile, readFileSync } = require('fs')


setImmediate(() =>  console.log('[阶段3.immediate] immediate 回调1'))
setImmediate(() =>  console.log('[阶段3.immediate] immediate 回调2'))
setImmediate(() =>  console.log('[阶段3.immediate] immediate 回调3'))

Promise.resolve()
    .then(() => {
        console.log('[...等待切入下一个阶段] promise 回调 1')

        setImmediate(() => console.log('[阶段3.immediate] promise 回调1 增加的 immediate 回调4'))
    })

readFile('../package.json', 'utf-8', data => {
    console.log('[阶段2...IO 回调] 读文件回调1')

    readFile('../package-lock.json', 'utf-8', data => {
        console.log('[阶段2...IO 回调] 读文件回调2')
    
        setImmediate(() => console.log('[阶段3.immediate] 读文件回调2 增加的 immediate 回调4'))
    })

    setImmediate(() =>  {
        console.log('[阶段3.immediate] immediate 回调5')

        Promise.resolve()
            .then(() => {
                console.log('[...等待切入下一个阶段] promise 回调 2')

                process.nextTick(() => {
                    console.log('[...待切入下一个阶段] promise 回调2增加的 nextTick 回调5')
                })
            })
            .then(() => {
                console.log('[...等待切入下一个阶段] promise 回调 3')
            })
    })

    setImmediate(() =>  {
        console.log('[阶段3.immediate] immediate 回调6')

        process.nextTick(() => {
            console.log('[...待切入下一个阶段] immediate 回调6 nextTick 回调7')
        })
        console.log('[...待切入下一个阶段] 这块正在同步阻塞的读一个大文件')
        const video = readFileSync('../package-lock.json', 'utf-8')
        process.nextTick(() => {
            console.log('[...待切入下一个阶段] immediate 回调6 nextTick 回调8')
        })

        readFile('../package.json', 'utf-8', data => {
            console.log('[阶段2...IO回调] 读文件回调3')

            setImmediate(() => console.log('[阶段3.immediate] 读文件回调3 增加的 immediate 回调6'))

            setTimeout(() => console.log('[阶段1...定时器] 读文件回调3 增加的 定时器回调8'), 0)
        })
    })

    process.nextTick(() => {
        console.log('[...待切入下一个阶段] 读文件 回调1 增加的 nextTick 回调6')
    })

    setTimeout(() => console.log('[阶段1...定时器] 定时器 回调5'), 0)
    setTimeout(() => console.log('[阶段1...定时器] 定时器 回调6 '), 0)
})

setTimeout(() => console.log('[阶段1...定时器] 定时器 回调1'), 0)
setTimeout(() => {
    console.log('[阶段1...定时器] 定时器 回调2')

    process.nextTick(() => {
        console.log('[...待切入下一个阶段] nextTick 回调5')
    })
}, 0)
setTimeout(() => console.log('[阶段1...定时器] 定时器 回调3'), 0)
setTimeout(() => console.log('[阶段1...定时器] 定时器 回调4'), 0)

process.nextTick(() => console.log('[...待切入下一个阶段] nextTick 回调1'))
process.nextTick(() => {
    console.log('[...待切入下一个阶段] nextTick 回调2')
    process.nextTick(() => console.log('[...待切入下一个阶段] nextTick 回调4'))
})
process.nextTick(() => console.log('[...待切入下一个阶段] nextTick 回调3'))


/**
 * 结论：
一共是三个阶段
1、如果某个阶段里面的回调函数的队列被执行完以后，就会进入下一个阶段
2、无论在哪一个阶段里面，增加了process.nextTick除非当前阶段的回调还没有执行完毕，在下一个阶段开始之前，一定回来
执行process.nextTick,包括promise这样的microtask,而且在nextTick和promise里面又新增了microtack,会马上加入到
队列的尾部，也会来执行，而且执行完毕之后，才会进入到下一个阶段，并且nextTick高于promise
3、一旦有阻塞代码来执行的时候，不会影响到整个事件循环的秩序，但是会影响到在他前面在他后面的nextTick的执行的优先级,会等到
同步代码执行完毕之后，才会来执行nextTick
 * 
 */