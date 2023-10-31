const { logger } = require('@jobscale/logger');

const CIA = 'CiB7ImRvbWFpbiI6ImpzeC5qcCIsInVybCI6Imh0dHBzOi8vZHluLnZhbHVlLWRvbWFpbi5jb20vY2dpLWJpbi9keW4uZmNnIiwidG9rZW4iOiJvbW9pY29taSIsImhvc3RzIjpbIioiLCJhc2lhIl19';

class App {
  async allowInsecure(use) {
    if (use === false) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  fetchEnv() {
    const Host = 'https://partner.credentials.svc.cluster.local';
    const Cookie = 'X-AUTH=X0X0X0X0X0X0X0X';
    const request = [
      `${Host}/value-domain.env.json`,
      { method: 'GET', headers: { Cookie } },
    ];
    return this.allowInsecure()
    .then(() => fetch(...request))
    .then(res => this.allowInsecure(false) && res)
    .then(res => res.json())
    .catch(() => JSON.parse(Buffer.from(CIA, 'base64').toString()));
  }

  fetchIP() {
    return fetch('https://inet-ip.info/ip')
    .then(res => res.text())
    .then(res => res.split('\n')[0]);
  }

  waiter(milliseconds) {
    const prom = {};
    prom.pending = new Promise((...args) => { [prom.resolve, prom.reject] = args; });
    setTimeout(prom.resolve, milliseconds);
    return prom.pending;
  }

  async setAddress(ip, env) {
    logger.info('Dynamic DNS polling.');
    const { domain, url, token } = env;
    for (const host of env.hosts) {
      await this.dynamic({
        domain, url, token, host, ip, retry: 10,
      })
      .catch(e => logger.error({ message: e.toString() }));
    }
    return 'ok';
  }

  dynamic({ domain, url, token, host, ip, retry }) {
    const path = `${url}?d=${domain}&p=${token}&h=${host}&i=${ip}`;
    return fetch(path, { method: 'GET' })
    .then(res => res.text())
    .then(text => {
      const status = text.replace(/[\s]+/g, ' ').trim();
      return { updated: `${ip} - ${status} - ${host}.${domain}`, status };
    })
    .then(res => {
      logger.info(JSON.stringify(res));
      if (res.status === 'status=0 OK' || !retry) return res;
      return this.waiter(2200)
      .then(() => this.dynamic({
        domain, url, token, host, ip, retry: retry - 1,
      }));
    });
  }

  main() {
    return Promise.all([this.fetchIP(), this.fetchEnv()])
    .then(data => this.setAddress(...data));
  }

  start() {
    const ts = new Date();
    logger.info({ ts: ts.getTime(), now: ts.toISOString() });
    this.main()
    .catch(e => logger.error({ message: e.toString() }));
  }
}

new App().start();
