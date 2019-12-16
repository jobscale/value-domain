FROM node
WORKDIR /home/node
USER node
COPY package.json package.json
COPY app app
RUN npm i --production
CMD ["bash", "-c", "([[ -f app/env.js ]] || curl -kso app/env.js https://tetris/.env.js) && npm start"]
