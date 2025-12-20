#!/bin/bash
# Script to kill process using port 3001

PORT=3001
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "✅ Port $PORT is free"
else
    echo "🔪 Killing process $PID using port $PORT..."
    kill $PID
    sleep 2
    if lsof -ti:$PORT > /dev/null 2>&1; then
        echo "⚠️  Process still running, forcing kill..."
        kill -9 $PID
    fi
    echo "✅ Port $PORT is now free"
fi

