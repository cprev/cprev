FROM node:12

USER root

WORKDIR /app

# TODO: if you have a postinstall script, you may need to copy that here too
COPY assets assets
COPY package.json .
COPY package-lock.json .

RUN npm i --production

COPY . .


ENV FORCE_COLOR=1

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

# default args go here, overridden by docker run cli
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["/app/cmd.sh"]


