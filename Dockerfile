FROM jobscale/node
RUN apt-get update && apt-get install -y curl
COPY . .
RUN . .nvm/nvm.sh && npm i
CMD ["bash", "-c", "curl -So app/env.js tetris/.env.js && . .nvm/nvm.sh && npm start $(curl ifconfig.io)"]
