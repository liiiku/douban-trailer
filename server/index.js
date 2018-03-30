const Koa = require('koa')
const app = new Koa()
// const { htmlTpl, ejsTpl, pugTpl } = require('./tpl')
// const ejs = require('ejs')
// const pug = require('pug')
const views = require('koa-views')
const { resolve } = require('path')

// views()中两个参数，第一个参数是模板的路径，第二个参数，只要是后缀名是pug的文件，就会被识别成模板文件
app.use(views(resolve(__dirname, './views'), {
    extension: 'pug'
}))

app.use(async (ctx, next) => {
    // ctx.type = 'text/html; charset=utf-8'
    // ctx.body = ejs.render(ejsTpl, {
    //     you: 'Luke',
    //     me: 'LRN'
    // })
    // ctx.body = pug.render(pugTpl, {
    //     you: 'LUKEEEEEE',
    //     me: 'liiiiiku'
    // })
    // 这个时候render已经被views挂载到了应用上线文context上
    await ctx.render('index', {
        you: 'world',
        me: 'koa2'
    })
})

app.listen(4455)