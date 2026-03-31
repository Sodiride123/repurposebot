#!/bin/bash
# Script 2: Start/restart the app via supervisord
# Usage: bash /workspace/repurposebot/start.sh

set -e

PROG="3001_repurposebot"
CONF_SRC="/workspace/repurposebot/_superninja_startup.conf"
CONF_DST="/etc/supervisor/conf.d/_superninja_startup.conf"

# Ensure config is installed
cp "$CONF_SRC" "$CONF_DST"
supervisorctl reread > /dev/null 2>&1
supervisorctl update > /dev/null 2>&1

# Check current state and act accordingly
STATUS=$(supervisorctl status "$PROG" 2>/dev/null | awk '{print $2}') || true

case "$STATUS" in
  RUNNING)
    echo "App already running. Restarting..."
    supervisorctl restart "$PROG"
    ;;
  STOPPED|EXITED)
    echo "Starting app..."
    supervisorctl start "$PROG"
    ;;
  FATAL|BACKOFF)
    echo "App in $STATUS state. Clearing and restarting..."
    supervisorctl stop "$PROG" 2>/dev/null || true
    sleep 1
    supervisorctl start "$PROG"
    ;;
  *)
    echo "Starting app..."
    supervisorctl start "$PROG" 2>/dev/null || true
    ;;
esac

# Verify
sleep 2
supervisorctl status "$PROG"

echo ""
echo "App: http://localhost:3001"
echo ""
echo "--- Manage with supervisord ---"
echo "  Status:  supervisorctl status $PROG"
echo "  Start:   supervisorctl start $PROG"
echo "  Stop:    supervisorctl stop $PROG"
echo "  Restart: supervisorctl restart $PROG"
echo "  Logs:    tail -f /var/log/supervisor/${PROG}.out.log"
