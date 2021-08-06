FROM node:buster-slim
SHELL ["bash", "-c"]
WORKDIR /home/node
COPY package.json package.json
COPY app app
RUN chown -R node. .
USER node
RUN npm i --production
ENV TZ Asia/Tokyo
CMD ["npm", "start"]
