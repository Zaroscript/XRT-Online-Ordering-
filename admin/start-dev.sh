#!/bin/bash
# Development server startup script with error handling

echo "🧹 Cleaning Next.js cache..."
rm -rf .next/cache/webpack

echo "🚀 Starting Next.js development server..."

# Suppress unhandled rejection warnings for cache errors
NODE_OPTIONS="--unhandled-rejections=warn" npm run dev


