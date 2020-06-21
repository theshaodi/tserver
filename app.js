const express = require('express');
const router = require('./router');
const app = express();
const db = require('./db');


// 配置模版资源目录
app.set('views', './views');
// 配置模版引擎
app.set('view engine', 'ejs');

// 应用路由器
app.use(router);

app.use(express.static('public'));



// 1.将参与微信加密签名的三个参数(timestamp、nonce、token)按照字典序排序并组合在一起形成一个数组
// 2. 将数组里所有参数拼接成一个字符串，进行sha1加密
// 3.加密完成就生成了一个signature，和微信发送过来的进行对比.
// 如果一样，说明消息来自于微信服务器，返回echosr给微信服务器
// 如果不一样，说明不是微信服务器发送的消息，返回error

app.listen(3000, async () => {
    await db;
    console.log('服务器启动成功了~');
});