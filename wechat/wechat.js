
/*
access_token:

特点:
  1. 唯一的
  2. 有效期为2小时，提前5分钟请求
  3. 接口权限，每天2000次

  请求地址:
  GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
  设计思路:
  1. 首次本地没有，发送请求获取accesstoken，保存下来（本地文件）
  2. 第二次或以后:
     -  先去本地读取文件，判断它是否过期
       -  过期了
         - 重新请求获取
       - 没有国旗直接使用

   整理思路:
     读取本地文件 (readAccessToken)
        - 本地有文件
           - 判断它是否过期(isVaalidAccessToken)
             - 过期了
                - 重新请求获取access_token(getAccessToken)，保存下来 覆盖之前的文件（保证文件是唯一的)(saveAccessToken)
             - 没有过期
                - 直接使用
        - 本地没有文件
          - 发送请求获取access_token, 保存下来(本地文件),直接使用(saveAccessToken)
*/

const { appID, appsecret } = require('../config');

const rp = require('request-promise-native');


const menu = require('./menu');
const api = require('../utils/api');
const { writeFileAsync, readFileAsync } = require('../utils/tool');

class Wechat {

  constructor() { }

  getAccessToken() {
    const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`;

    // 发送请求

    /*
    request
    request-promise-native 返回值是一个promise对象
    */
    return new Promise((resolve, reject) => {


      rp({ method: 'GET', url, json: true })
        .then(res => {
          res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
          resolve(res);
        })
        .catch(err => {
          reject('getAccessToken方法除了问题' + err);
        })

    })
  }

  /**
   *  用来保存access_token
   * @param {要保存的凭据} accessToken 
   */
  saveAccessToken(accessToken) {
    return writeFileAsync(accessToken, 'accessToken.txt');
  }

  readAccessToken() {
    return readFileAsync('accessToken.txt');
  }

  isValidAccessToken(data) {
    // 检测传入的餐素是否有效
    if (!data && !data.access_token && !data.expires_in) {
      return false;
    }
    return data.expires_in > Date.now();
  }

  fetchAccessToken() {
    // 优化措施
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    return this.readAccessToken()
      .then(async res => {
        // 本地有文件
        if (this.isValidAccessToken(res)) {
          return Promise.resolve(res);
        } else {
          const res = await this.getAccessToken();
          await this.saveAccessToken(res);
          // 将请求回来的access_token返回出去
          return Promise.resolve(res);
        }

      })
      .catch(async err => {
        const res = await this.getAccessToken();
        await this.saveAccessToken(res);
        // 将请求回来的access_token返回出去
        return Promise.resolve(res);
      })
      .then(res => {
        // 将access_token挂在this上
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        // 是this.readAccessToken()最终的返回值
        return Promise.resolve(res);
      });
  }

  /**
   * 用来获取jsapi_ticket
   */
  getJsapiTicket() {
    return new Promise(async (resolve, reject) => {
      // 获取access_token
      const data = await this.fetchAccessToken();


      const url = `${api.ticket}&access_token=${data.access_token}`;

      // 发送请求

      /*
      request
      request-promise-native 返回值是一个promise对象
      */


      rp({ method: 'GET', url, json: true })
        .then(res => {
          resolve({ ticket: res.ticket, expires_in: Date.now() + (res.expires_in - 300) * 1000 });
        })
        .catch(err => {
          reject('getJsapiTicket方法除了问题' + err);
        })

    })
  }

  /**
   *  用来保存ticket
   * @param {要保存的凭据} ticket 
   */
  saveJsapiTicket(ticket) {
    return writeFileAsync(ticket, 'ticket.txt');
  }

  readJsapiTicket() {
    return readFileAsync('ticket.txt');
  }

  isValidJsapiTicket(data) {
    // 检测传入的餐素是否有效
    if (!data && !data.access_token && !data.expires_in) {
      return false;
    }
    return data.expires_in > Date.now();
  }

  fetchJsapiTicket() {
    // 优化措施
    if (this.ticket && this.ticket_expires_in && this.isValidJsapiTicket(this)) {
      return Promise.resolve({
        access_token: this.ticket,
        expires_in: this.expires_in
      })
    }
    return this.readJsapiTicket()
      .then(async res => {
        // 本地有文件
        if (this.isValidJsapiTicket(res)) {
          return Promise.resolve(res);
        } else {
          const res = await this.getJsapiTicket();
          await this.saveJsapiTicket(res);
          return Promise.resolve(res);
        }

      })
      .catch(async err => {
        const res = await this.getJsapiTicket();
        await this.saveJsapiTicket(res);
        return Promise.resolve(res);
      })
      .then(res => {
        // 将access_token挂在this上
        this.ticket = res.ticket;
        this.ticket_expires_in = res.expires_in;
        return Promise.resolve(res);
      });
  }

  createMenu(menu) {
    return new Promise(async (resolve, reject) => {
      try {

        // 获取access_token
        const data = await this.fetchAccessToken();
        // 定义请求地址
        const url = `${api.menu.create}access_token=${data.access_token}`
        const result = await rp({ method: 'POST', url, json: true, body: menu });
        resolve(result);
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * 用来删除自定义菜单
   */
  deleteMenu() {
    return new Promise(async (resolve, reject) => {
      try {

        const data = await this.fetchAccessToken();
        // 定义请求地址
        const url = `${api.menu.delete}access_token=${data.access_token}`;
        // 发送请求
        const result = await rp({ method: 'GET', url, json: true });
        resolve(result);
      } catch (e) {
        reject('deleteMenu方法出了问题');
      }
    })
  }
}

// (async () => {

//   const w = new Wechat();
//   // 删除之前定义的菜单
//   // let result = await w.deleteMenu();
//   // console.log(result);
//   // result = await w.createMenu(menu);
//   // console.log(result);
//   const data = await w.fetchJsapiTicket();
//   console.log(data);
//   const data1 = await w.fetchAccessToken();
//   console.log(data1);
// })()

module.exports = Wechat;