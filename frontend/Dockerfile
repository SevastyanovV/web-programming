FROM node:18.12.1-alpine as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json yarn.lock ./
RUN yarn install --only=prod
COPY . /app
ARG REACT_APP_BASE_URL
ARG REACT_APP_BASE_URL_WS
RUN echo "REACT_APP_BASE_URL=${REACT_APP_BASE_URL}" > .env && \
    echo "REACT_APP_BASE_URL_WS=${REACT_APP_BASE_URL_WS}" >> .env
RUN yarn run build:prod


FROM nginx:stable-alpine
COPY --from=build-step /app/build /usr/share/nginx/html
COPY ./nginx.default.conf /etc/nginx/conf.d/default.conf
