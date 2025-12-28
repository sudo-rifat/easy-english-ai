#!/bin/bash

echo ""
echo "===================================="
echo "  Easy English AI Analyzer"
echo "  Quick Start Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found!"
    echo "Please run this script from the project root."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: npm install failed!"
        exit 1
    fi
fi

echo ""
echo "✓ All set!"
echo ""
echo "Starting development server..."
echo ""
echo "🚀 Open your browser to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
