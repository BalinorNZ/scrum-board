FROM node:14-alpine as build-deps

WORKDIR /app
COPY . .
RUN yarn install
RUN yarn run build

FROM nginx:mainline-alpine
COPY client.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-deps /app/build /usr/share/nginx/html
