# syntax=docker/dockerfile:1
ARG NODE_VERSION=20
# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/
FROM ghcr.io/puppeteer/puppeteer:22.11.1
WORKDIR /app/
COPY . .
ENV PUPPETEER_SKIP_CHROMINUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/user/bin/google-chrome-stable \
    NODE_ENV=production

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

FROM node:${NODE_VERSION}-alpine


RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci --omit=dev


# Run the application as a non-root user.

WORKDIR /app/
# Copy the rest of the source files into the image.
COPY . .



# Expose the port that the application listens on.
EXPOSE 8081

# Run the application.
CMD npm start
