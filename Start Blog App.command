#!/bin/bash
cd ~/Blog-AyDesign

# Pull latest posts written by Claude
git pull --quiet

# Start the server in background
npm run app &
SERVER_PID=$!

# Wait until server is ready (up to 10s)
for i in {1..10}; do
  sleep 1
  if curl -s http://localhost:3333 > /dev/null 2>&1; then
    break
  fi
done

# Open in browser
open http://localhost:3333

# Keep terminal open until server is stopped with Ctrl+C
wait $SERVER_PID
