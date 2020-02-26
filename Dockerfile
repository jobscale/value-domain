FROM node
SHELL ["bash", "-c"]
WORKDIR /home/node
COPY package.json package.json
COPY app app
RUN chown -R node. app
USER node
RUN npm i --production
CMD ["npm", "start"]
