# guide from: https://dev.to/peterj/run-a-react-app-in-a-docker-container-kjn
# docker build -t scrum-board .
# docker run -it -p 3000:80 scrum-board

FROM mhart/alpine-node:11 AS builder
WORKDIR /app
COPY . .
RUN yarn run build

FROM mhart/alpine-node
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "80", "-s", "."]


### LOADS OF EXPERIMENTS BELOW

## build step
#FROM node:8-alpine as builder
#WORKDIR /usr/src/app
#COPY package.json ./
#RUN npm install
#COPY . ./
#RUN npm run build
#
## production environment
#FROM nginx:1.13.9-alpine
#RUN rm -rf /etc/nginx/conf.d
#COPY conf /etc/nginx
#COPY --from=builder /usr/src/app/build /usr/share/nginx/html
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]


#ENV PATH /usr/src/app/node_modules/.bin:$PATH

#COPY ./public ./public
#COPY package.json ./
#RUN npm install
#RUN npm install react-scripts@1.1.1 -g --silent

# start app
#CMD ["npm", "start"]


#WORKDIR /usr/src/app
#COPY package.json yarn.lock ./
#RUN yarn
#COPY . ./
#RUN yarn build
#
#FROM nginx:mainline-alpine
#
#COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
#
#FROM node:alpine
#
#RUN apk add git --update-cache && \
#    npm install -g pm2
#
#RUN mkdir -p /app
#
#WORKDIR /app
#ADD . .
#
#RUN npm install
#
#EXPOSE 3000
#
#CMD ["npm", "start"]
