FROM node:8-alpine as build-deps

WORKDIR /app
COPY . .
RUN yarn run build
COPY --from=build-deps /app/build .

FROM nginx:mainline-alpine
COPY --from=build-deps /app/build /usr/share/nginx/html