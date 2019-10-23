## value-domain dynamic DNS

### run with container
```
git clone https://github.com/jobscale/value-domain.git
cd value-domain
```

```bash
echo "module.exports = {
  domain: 'example.com',
  token: 'secret',
  hosts: ['@', '*'],
};" > app/.env.js
npm i
npm run lint
npm start
```

```
main() {
  docker build . -t local/value-domain:0.0.1
  docker run --name value-domain --rm -it local/value-domain:0.0.1
} && main
```
