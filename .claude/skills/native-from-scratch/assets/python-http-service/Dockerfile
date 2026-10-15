# syntax=docker/dockerfile:1
# Base image pinned by digest (resolved 2026-10-14). Let Dependabot's "docker" ecosystem keep it current.
# http.server suits internal services; put it behind a reverse proxy for internet-facing traffic.
FROM python:3.14-slim@sha256:a2b82f3c48559aa0a8446d9af49826b6e2b2016f4cd2afabfe6013ec53729170

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8000
WORKDIR /app

RUN groupadd --gid 10001 app && useradd --create-home --uid 10001 --gid 10001 app
COPY app.py ./

USER 10001:10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["python", "-c", "import sys, urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2).status == 200 else 1)"]

# Exec form so SIGTERM reaches Python directly and the server shuts down gracefully.
CMD ["python", "app.py"]
