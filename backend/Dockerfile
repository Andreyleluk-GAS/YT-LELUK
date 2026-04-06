FROM node:20-bookworm-slim

# Install simple curl and python3 (yt-dlp requires python3) and FFmpeg for formatting
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    ffmpeg \
    curl \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3 /usr/bin/python

# Install Xray-core
RUN wget https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip \
    && unzip Xray-linux-64.zip -d /tmp/xray \
    && mv /tmp/xray/xray /usr/local/bin/xray \
    && chmod +x /usr/local/bin/xray \
    && rm -rf /tmp/xray Xray-linux-64.zip

# Update to latest yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
