# ---- deps stage: install prod dependencies (with build tools in case a ----
# ---- native module needs to compile from source instead of using a    ----
# ---- prebuilt binary) -------------------------------------------------
FROM node:22-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- final stage: slim runtime image, no build tools, non-root user ----
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/app/data/app.db

RUN groupadd -r appuser && useradd -r -g appuser appuser

# The image only ever runs `node src/server.js` — npm/npx/corepack are build-time
# tooling, not a runtime dependency. Removing them shrinks the attack surface
# (this is what caught CVE-2026-33671 via Trivy in this project's pipeline).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

RUN mkdir -p /app/data && chown -R appuser:appuser /app

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3000)+'/health',res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "src/server.js"]
