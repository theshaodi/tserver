const puppeteer = require('puppeteer');

// 爬取热门电影信息
const url = 'https://movie.douban.com/cinema/nowplaying/beijing/';

module.exports = async () => {
    // 1.打开浏览器
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: false, // 以无头浏览器的形式打开浏览器，没有洁面显示
    });
    // 2.创建tab标签页
    const page = await browser.newPage();
    // 3.跳转到指定网址
    await page.goto(url, {
        waitUntil: 'networkidle2', // 等待网络空闲时，再跳转加载页面
    });
    // 4.等待网址加载完成，开始爬去数据
    // 开启延时器，延时2秒钟再开始爬取数据
    await timeout();
    const result = await page.evaluate(() => {
        // 对加载好的页面进行dom操作
        // 获取所有热门电影的li
        let result = [];
        const $list = $('#nowplaying>.mod-bd>.lists>.list-item');
        // 之获取8条
        for (let i = 0; i < $list.length; i++) {
            const liDom = $list[i];
            // 电影标题
            let title = $(liDom).data('title');
            // 电影评分
            let rating = $(liDom).data('score');
            // 电影片长
            let runtime = $(liDom).data('duration');
            // 导演
            let director = $(liDom).data('director');
            // 主演
            let casts = $(liDom).data('actors');
            let doubanId = $(liDom).data('subject');
            // 电影的详情页网址
            let href = $(liDom).find('.poster>a').attr('href');
            // 电影海报图
            let images = $(liDom).find('.poster>a>img').attr('src');
            result.push({
                title,
                rating,
                runtime,
                director,
                doubanId,
                casts,
                href,
                images
            })

        }
        return result;
    })
    // 遍历爬取到的8条数据
    for (let i = 0; i < result.length; i++) {
        // 获取条目信息
        let item = result[i];
        let url = item.href;
        await page.goto(url, {
            waitUntil: 'networkidle2' // 等待网络空闲时,在跳转加载页面
        });
        // 爬取其他数据
        let itemResult = await page.evaluate(() => {
            let genre = [];
            const $genre = $('[property="v:genre"]');
            for (let j = 0; j < $genre.length; j++) {
                genre.push($genre[j].innerText);
            }
            // 简介
            const summary = $('[property="v:summary"]').html().replace(/\s+/g, '');
            let releaseDate = [];
            const $releaseDate = $('[property="v:initialReleaseDate"]');
            for (let j = 0; j < $releaseDate.length; j++) {
                releaseDate.push($releaseDate[j].innerText);
            }
            return {
                genre,
                summary,
                releaseDate
            }
        })
        item.genre = itemResult.genre;
        item.summary = itemResult.summary;
        item.releaseDate = itemResult.releaseDate;
    }
    console.log(result);
    // await page.screenshot({ path: 'example.png' });
    // 5.关闭浏览器
    await browser.close();
    // 最终会将数据全部返回出去
    return result;
}

function timeout() {
    return new Promise(resolve => {
        setTimeout(resolve, 2000);
    })
}