FROM node
WORKDIR /home/node
USER node
COPY node_modules node_modules
COPY package.json package.json
COPY app app
# ENTRYPOINT /usr/local/bin/npm
CMD ["bash", "-c", "([[ -f app/env.js ]] || curl -so app/env.js tetris/.env.js) && npm start"]
