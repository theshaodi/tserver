/*
 处理用户发送的消息类型和内容，决定法案会不同的内容给用户
*/
const Theaters = require('../model/Theaters');
const { url } = require('../config');
module.exports = async (message) => {

    let options = {
        toUserName: message.ToUserName,
        fromUserName: message.FromUserName,
        createTime: Date.now(),
        msgType: 'text'
    }
    let content = '你好';
    if (message.MsgType === 'text') {
        if (message.Content === '热门') {
            const data = await Theaters.find({}, { title: 1, summary: 1, images: 1, doubanId: 1, _id: 0 });
            // 将回复内容初始化为空数组
            content = [];
            options.msgType = 'news';
            options.articleCount = data.length;
            // 通过遍历将数据添加进去
            for (var i = 0; i < data.length; i++) {
                let item = data[i];
                content.push({
                    title: item.title,
                    description: item.summary,
                    picUrl: item.images,
                    url: `https://movie.douban.com/subject/${item.doubanId}/`
                })
            }
        }
        if (message.Content === '1') {
            content = '大吉大利，今晚吃鸡';
        } else if (message.Content === '2') {
            content = '落地成盒'
        } else if (message.Content.match('爱')) {
            content = '我啊爱你~';
        }
    } else if (message.MsgType === 'image') {
        options.msgType = 'image';
        options.mediaId = message.MediaId;
        console.log(message.PicUrl);
    } else if (message.MsgType === 'voice') {
        options.msgType = 'voice';
        options.mediaId = message.MediaId;
        console.log(message.Recognition);
    } else if (message.MsgType === 'location') {
        content = `纬度: ${message.Location_X} 经度: ${message.Location_Y} 缩放大小: ${message.Scale} 位置信息: ${message.Label}`;
    } else if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            // 用户订阅事件
            content = '欢迎您的关注测试 \n' +
                '回复 首页 能看到硅谷电影预告片页面 \n' +
                '回复 热门 能看到最新最热门的电影 \n' +
                '回复 文本 能查看指定的电影信息 \n' +
                '回复 语音 能查看指定的电影信息 \n' +
                '也可以点击下面菜单按钮，来了解硅谷电影公众号';
            if (message.EventKey) {
                content = '用户扫描带参数的二维码关注事件';
            }
        } else if (message.Event === 'unsubscribe') {
            console.log("用户取消关注");
        } else if (message.Event === 'SCAN') {
            content = '用户已经关注过，再次扫描带参数的二维码关注事件';
        } else if (message.Event === 'LOCATION') {
            content = `纬度: ${message.Latitude} 经度: ${message.Longitude} 精度: ${message.Precision}`
        } else if (message.Event === 'CLICK') {
            // 用户订阅事件
            content = '你可以按照一下提示来进行操作 \n' +
                '回复 首页 能看到硅谷电影预告片页面 \n' +
                '回复 热门 能看到最新最热门的电影 \n' +
                '回复 文本 能查看指定的电影信息 \n' +
                '回复 语音 能查看指定的电影信息 \n' +
                '也可以点击下面菜单按钮，来了解硅谷电影公众号';
        }
    }
    options.content = content;

    return options;
}