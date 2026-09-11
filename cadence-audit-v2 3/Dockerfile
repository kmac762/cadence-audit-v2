FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium ca-certificates fonts-liberation dumb-init gosu \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --chown=node:node . /app
ENV NODE_ENV=production \
    CHROMIUM_PATH=/usr/bin/chromium \
    DATA_DIR=/var/data \
    ENABLE_RENDERING=1
RUN chmod 755 /app/scripts/container-entrypoint.sh \
    && node scripts/check-release.mjs \
    && npm test
EXPOSE 10000
ENTRYPOINT ["/usr/bin/dumb-init", "--", "/app/scripts/container-entrypoint.sh"]
CMD ["node", "src/server.mjs"]
