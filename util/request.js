const axios = require('axios');
const StringHelper = require('./StringHelper');
const hostMap = require('../bin/config').hostMap;

class Request {
  constructor({ req, res }) {
    const { platform } = req.query;
    this.domain = hostMap[platform];
    this.req = req;
    this.res = res;
  }

  updateDomain(platform) {
    this.domain = hostMap[platform];
  }

  request = async (obj) => {
    try {
      if (typeof obj === 'string') {
        obj = {
          url: obj,
          data: {},
        }
      }
      obj.method = obj.method || 'get';

      let { url, data, trueUrl, domain } = obj;

      url = `${domain || this.domain}/${url}`;

      trueUrl && (url = trueUrl);

      delete this.req.headers['content-type'];
      delete this.req.headers['Content-Type'];
      if (obj.method === 'get') {
        obj.url = StringHelper.changeUrlQuery(data, url);
        delete obj.data;
      } else {
        obj.url = url;
      }

      obj.headers = this.req.headers;

      console.log('\nrequest url: ', obj.url);

      const res = await axios(obj);

      return res.data;
    } catch (err) {
      if (err.message.indexOf('timeout') > -1) {
        return {};
      }
      this.res.send(err.message);
    }
  }
}

module.exports = Request;