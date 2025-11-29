## value-domain dynamic DNS

## run with container
```
git clone https://github.com/jobscale/value-domain.git
cd value-domain
```

## setup and test
```bash
echo "export default {
  domain: 'example.com',
  token: 'secret',
  hosts: ['@', '*'],
};" > app/.env.js
npm i
npm run lint --if-present
npm start
```

## build and run
```
main() {
  docker build . -t local/value-domain
  docker run --rm -it local/value-domain
} && main
```

### create cronjob
```
kubectl create cronjob value-domain --image local/value-domain --schedule '0/7 * * * *'
kubectl create job --from=cronjob/value-domain value-domain-manual-$(date +'%s')
```
