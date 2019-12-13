FROM node
WORKDIR /home/node
USER node
COPY node_modules node_modules
COPY package.json package.json
COPY app app
CMD ["bash", "-c", "([[ -f app/env.js ]] || curl -kso app/env.js https://tetris/.env.js) && npm start"]
