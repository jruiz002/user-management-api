#!/usr/bin/env bash
# Runs ON the deploy target itself (the self-hosted GitHub Actions runner on EC2).
# No SSH involved — this is the Continuous Deployment step.
set -euo pipefail

IMAGE="jruiz002/user-management-api:latest"

docker pull "$IMAGE"
docker volume create uma-data >/dev/null
docker stop uma >/dev/null 2>&1 || true
docker rm uma >/dev/null 2>&1 || true
docker run -d --name uma --restart unless-stopped \
  -p 80:3000 \
  -v uma-data:/app/data \
  "$IMAGE"
docker image prune -f >/dev/null
echo "deployed: $(docker inspect -f '{{.Config.Image}}@{{.Image}}' uma)"
