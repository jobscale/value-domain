## value-domain dynamic DNS
### startup

```bash
echo 'module.exports = {
  domain: 'example.com',
  token: 'secret',
  hosts: ['@', '*'],
};' > app/.env.js
npm i
npm run lint
npm start
```
