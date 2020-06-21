// 引入express模块

const express = require('express');
const reply = require('../reply');
const sha1 = require('sha1');
// 引入wechat模块
const Wechat = require('../wechat/wechat');
// 引入config文件
const { url } = require('../config');
// 引入Theaters
const Theaters = require('../model/Theaters');
// 获取Router
const Router = express.Router;
// 创建路由器对象
const router = new Router();

// 创建实力对象
const wechatApi = new Wechat();
// 页面路由
router.get('/search', async (req, res) => {
    /*
    生成js-sdk使用的签名:
    1. 组合参与签名的四个参数：jsapi_ticket(临时票据)、concestr(随机字符串)、timestamp(时间戳)、url(当前服务器地址)
    2. 将其进行字典序排序，以'&'拼接在一起
    3. 进行sha1加密,最终生成signature
    */
    // 随机字符串
    const noncestr = Math.random().toString().split('.')[1];
    // 获取时间戳
    const timestamp = Date.now();
    // 获取票据
    const { ticket } = await wechatApi.fetchJsapiTicket();
    // 1. 组合参与签名的四个参数：jsapi_ticket(临时票据)、concestr(随机字符串)、timestamp(时间戳)、url(当前服务器地址)
    const arr = [
        `jsapi_ticket=${ticket}`,
        `noncestr=${noncestr}`,
        `timestamp=${timestamp}`,
        `url=${url}/search`
    ]
    // 2. 将其进行字典序排序，以'&'拼接在一起
    const str = arr.sort().join('&');
    console.log(str);
    // 3. 进行sha1加密,最终生成signature
    const signature = sha1(str);

    // 渲染页面，将渲染号的页面返回给用户

    res.render('search', {
        signature,
        noncestr,
        timestamp
    });
})

// 详情页面的路由
router.get('/detail/:id', async (req, res) => {
    // 获取占位符id的值
    const { id } = req.params;
    // 判断id值是否存在
    if (id) {
        // 去数据库中找到对应id值的所有数据
        const data = await Theaters.find({ doubanId: id }, { _id: 0, __v: 0, createTime: 0 });
        console.log(data);
        // 渲染到页面上
        res.render('detail', { data });
    } else {
        res.end('error');
    }

})
router.use(reply());
// 暴露出去

module.exports = router;