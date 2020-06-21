const db = require('../db');
const theatersCrawler = require('./crawler/theatersCrawler');
const saveTheaters = require('./save/saveTheaters');

(async () => {
    // 连接数据库
    await db;
    // 爬去数据
    const data = await theatersCrawler();
    // 将爬去的数据保存在数据库中
    await saveTheaters(data);
})()