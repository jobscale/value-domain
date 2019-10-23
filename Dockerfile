FROM jobscale/node
COPY node_modules node_modules
COPY package.json package.json
COPY app app
CMD ["bash", "-c", "curl -so app/env.js tetris/.env.js && . .nvm/nvm.sh && npm start"]
