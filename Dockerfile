FROM node:8-alpine as build-deps

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build


FROM nginx:1.12-alpine

COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


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
