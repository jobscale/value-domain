FROM jobscale/node
RUN apt-get update && apt-get install -y curl
COPY . .
CMD ["bash", "-c", "curl -so app/env.js tetris/.env.js && . .nvm/nvm.sh && npm start $(curl ifconfig.io)"]
