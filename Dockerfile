FROM node:lts-trixie-slim
SHELL ["bash", "-c"]
WORKDIR /home/node
COPY --chown=node:staff package.json .
RUN npm i --omit=dev
COPY --chown=node:staff app app
USER node
ENV TZ=Asia/Tokyo
CMD ["npm", "start"]
