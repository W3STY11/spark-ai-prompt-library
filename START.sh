#!/bin/bash

# SPARK Prompt Library Startup Script
# This script starts everything you need

echo "🚀 Starting SPARK Prompt Library..."
echo ""
echo "This will start:"
echo "  ✅ API Server (2,376 prompts)"
echo "  ✅ Browse Library"
echo "  ✅ Admin Dashboard"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running!"
    echo ""
    echo "Please start Docker Desktop first, then run this script again."
    exit 1
fi

# Start the application
docker-compose up

echo ""
echo "✅ SPARK Prompt Library stopped"
