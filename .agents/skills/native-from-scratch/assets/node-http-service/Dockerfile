# syntax=docker/dockerfile:1
# Base image pinned by digest (resolved 2026-10-14). Let Dependabot's "docker" ecosystem keep it current.
FROM node:24-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5

ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.ts ./

# The official Node.js images include an unprivileged "node" user with UID and GID 1000.
USER 1000:1000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

# Exec form so SIGTERM reaches Node.js directly and the server shuts down gracefully.
CMD ["node", "server.ts"]
