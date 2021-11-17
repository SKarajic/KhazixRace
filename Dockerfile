FROM node:16

WORKDIR /app
COPY . .

RUN yarn install
RUN yarn build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT [ "yarn" ]
CMD [ "start" ]
