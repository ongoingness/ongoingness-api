# Download Docker image, Node.js running on Alpine
FROM node:alpine

#Install depencies to install gifify
RUN apk add ffmpeg imagemagick curl autoconf automake make gcc gawk clang libc-dev libass-dev fontconfig ffmpeg-libs

#Install gifsicle
RUN curl -LJO https://github.com/kohler/gifsicle/archive/v1.92.zip
RUN unzip gifsicle-1.92.zip 
RUN cd gifsicle-1.92 && ./bootstrap.sh && ./configure && make install

#Install a static and working version of ffmepg
RUN wget https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz
RUN tar xvf ffmpeg-git-amd64-static.tar.xz
RUN mv /ffmpeg-git-20190527-amd64-static/ffmpeg /usr/local/bin/ffmpeg

# Make an app directory to hold the server files.
RUN mkdir /app

# Set the working directory to app.
WORKDIR /app

COPY ./package.json /app/package.json

# Install npm packages.
RUN npm install

# Install nodemon
RUN npm install -g npx nodemon typescript apidoc gifify 

COPY App.ts /app/App.ts
COPY tsconfig.json /app/tsconfig.json
COPY web /app/web
COPY test /app/test
COPY test.jpg /app/test.jpg
COPY test.mp4 /app/test.mp4
RUN mkdir -p uploads
RUN mkdir -p /app/static/apidoc

# Create docs
RUN apidoc -i /app/web -o /app/static

RUN npm run build

# Expose port 80
EXPOSE 80

# Start the server.
CMD nodemon -L dist/App.js
