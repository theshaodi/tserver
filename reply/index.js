const sha1 = require('sha1');
const config = require('../config')
const { getUserDataAsync, parseXMLAsync, formatMessage } = require('../utils/tool');
const template = require('./template');
const reply = require('./reply');
// 验证服务器有效性的模块
module.exports = () => {

    return async (req, res, next) => {
        const { signature, echostr, timestamp, nonce } = req.query;
        const { token } = config;
        const sha1Str = sha1([timestamp, nonce, token].sort().join(''));

        if (req.method === 'GET') {
            if (sha1Str === signature) {
                // 如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
                res.send(echostr);
            } else {
                // 如果不一样，说明不是微信服务器发送的消息,返回error
                res.end('error');
            }
        } else if (req.method === 'POST') {
            // 微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
            // 验证消息来自于微信服务器
            if (sha1Str !== signature) {
                res.end('error')
            }
            // 接受请求体中的流式数据
            const xmlData = await getUserDataAsync(req);

            /*
            <xml><ToUserName><![CDATA[gh_2a778af46555]]></ToUserName> // 开发者id
                <FromUserName><![CDATA[oIUb2t1n40bhpDHFRA0USFxTxfeM]]></FromUserName>  //用户openid
                <CreateTime>1591532285</CreateTime> // 发送的时间戳
                <MsgType><![CDATA[text]]></MsgType> // 发送消息的类型
                <Content><![CDATA[m]]></Content> // 发送内容
                <MsgId>22785263831570594</MsgId>  // 消息id 微信服务器会默认保存3天用户发送的数据
            </xml>
            */
            // 将xml数据解析为js对象

            const jsData = await parseXMLAsync(xmlData);
            // 格式化数据
            const message = await formatMessage(jsData);



            /*
            一旦遇到一下情况，微信都会在公众号会话中，向用户下发系统提示'该公众号暂时无法提供服务，请稍后再试试"
            1. 开发者5秒内未回复任何内容
            2. 开发者恢复了异常数据，比如JSON数据、字符串、xml数据中有多余的空格*****等
            */
            console.log(message);
            // 将reply函数改装成了async函数,此时返回值就编程了promise对象
            const options = await reply(message);
            const replyMessage = template(options);
            console.log(replyMessage);
            // 如果开发者服务器没有返回相应给微信服务器，微信服务器会发送三次请求过来
            res.send(replyMessage);
        } else {
            res.end('error');
        }


    }
}