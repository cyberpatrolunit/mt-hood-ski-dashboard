#!/bin/bash
# Start Hood Meadows Dashboard Server

cd "$(dirname "$0")"
echo "Starting Hood Meadows Ski Dashboard..."
echo ""
echo "Local URL:  http://localhost:18791"
echo "Network URL: http://192.168.1.36:18791"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server.js
