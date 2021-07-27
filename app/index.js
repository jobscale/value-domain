global.fetch = require('node-fetch');

global.logger = console;
const Cookie = 'X-AUTH=X0X0X0X0X0X0X0X';
const Host = 'https://partner.credentials.svc.cluster.local';

class App {
  constructor() {
    this.url = 'https://dyn.value-domain.com/cgi-bin/dyn.fcg';
  }

  fetchEnv() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const pattern = [/=/g, '', 'base64'];
    return fetch(`${Host}/env.json`, {
      method: 'GET',
      headers: { Cookie },
    })
    .then(res => res.json())
    .then(res => JSON.parse(
      Buffer.from(res.env.replace(...pattern), pattern[2]).toString(),
    ).valueDomain);
  }

  fetchIP() {
    return fetch('https://inet-ip.info/ip')
    .then(res => res.text())
    .then(res => res.split('\n')[0]);
  }

  getData() {
    return Promise.all([
      this.fetchIP(),
      this.fetchEnv(),
    ]);
  }

  waiter(milliseconds) {
    const prom = {};
    prom.pending = new Promise((...args) => [prom.resolve, prom.reject] = args);
    setTimeout(prom.resolve, milliseconds);
    return prom.pending;
  }

  async setAddress(ip, env) {
    logger.info('Dynamic DNS polling.');
    const { domain, token } = env;
    for (const host of env.hosts) {
      const params = { domain, token, host, ip, retry: 10 };
      await this.waiter(1200)
      .then(() => this.dynamic(params))
      .catch(e => logger.error({ message: e.toString() }));
    }
    return 'OK';
  }

  dynamic({ domain, token, host, ip, retry }) {
    const url = `${this.url}?d=${domain}&p=${token}&h=${host}&i=${ip}`;
    return fetch(url, { method: 'GET' })
    .then(res => res.text())
    .then(res => res.replace(/[\s]+/g, ' ').trim())
    .then(status => ({ updated: `${ip} - ${status} - ${host}.${domain}`, status }))
    .then(res => {
      logger.info(JSON.stringify(res));
      if (res.status === 'status=0 OK' || !retry) return res;
      return this.dynamic({ domain, token, host, ip, retry: retry - 1 });
    });
  }

  main() {
    return this.getData()
    .then(data => this.setAddress(...data));
  }

  start() {
    this.main()
    .catch(e => logger.error({ message: e.toString() }));
  }
}

new App().start();
