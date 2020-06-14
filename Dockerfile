FROM node:8-alpine as build-deps

WORKDIR /app
COPY . .
RUN yarn
RUN yarn run build

FROM nginx:mainline-alpine
COPY client.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-deps /app/build /usr/share/nginx/html
