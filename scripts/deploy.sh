#!/usr/bin/env bash
# Deploys the latest image from Docker Hub to the EC2 host via SSH.
# Usage: ./scripts/deploy.sh <ssh-user>@<host> <path-to-pem>
set -euo pipefail

TARGET="${1:?usage: deploy.sh <user>@<host> <path-to-pem>}"
PEM="${2:?usage: deploy.sh <user>@<host> <path-to-pem>}"
IMAGE="jruiz002/user-management-api:latest"

ssh -i "$PEM" "$TARGET" bash -s <<EOF
  set -euo pipefail
  docker pull $IMAGE
  docker volume create uma-data >/dev/null
  docker stop uma >/dev/null 2>&1 || true
  docker rm uma >/dev/null 2>&1 || true
  docker run -d --name uma --restart unless-stopped \
    -p 80:3000 \
    -v uma-data:/app/data \
    $IMAGE
  docker image prune -f >/dev/null
  echo "deployed: \$(docker inspect -f '{{.Config.Image}}' uma)"
EOF
