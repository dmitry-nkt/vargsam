#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ -f .pid ] && kill -0 "$(cat .pid)" 2>/dev/null; then
  kill "$(cat .pid)"
  sleep 1
fi

nohup env \
  PORT="${PORT:-8787}" \
  ALLOW_ORIGIN="${ALLOW_ORIGIN:-*}" \
  SMTP_HOST="${SMTP_HOST}" \
  SMTP_PORT="${SMTP_PORT:-465}" \
  SMTP_SECURE="${SMTP_SECURE:-true}" \
  SMTP_USER="${SMTP_USER}" \
  SMTP_PASS="${SMTP_PASS}" \
  MAIL_FROM="${MAIL_FROM:-$SMTP_USER}" \
  MAIL_TO="${MAIL_TO}" \
  LEADS_SUBJECT="${LEADS_SUBJECT:-Новая заявка с сайта}" \
  node server.mjs > service.log 2>&1 &

echo $! > .pid
echo "Leads API restarted. PID: $(cat .pid)"
