FROM node:20-bookworm-slim

# Install simple curl and python3 (yt-dlp requires python3) and FFmpeg for formatting
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    unzip \
    wget \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Xray-core
RUN wget https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip \
    && unzip Xray-linux-64.zip -d /usr/local/bin/xray \
    && rm Xray-linux-64.zip

# Update to latest yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=8080
EXPOSE $PORT

CMD ["npm", "start"]
