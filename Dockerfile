FROM jobscale/node
RUN apt-get update && apt-get install -y curl
COPY . .
RUN . .nvm/nvm.sh && npm i
CMD ["bash", "-c", "curl -so app/env.js tetris/.env.js && (echo "module.exports = { net: '$(curl ifconfig.io)' };" > app/net.js) && . .nvm/nvm.sh && npm start $(curl ifconfig.io)"]
