#!/bin/bash

# EduToon Deployment Script for aaPanel
# Run this script on your server after uploading the project

echo "🚀 EduToon Deployment Script"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Running without root. Some commands may fail.${NC}"
fi

# Set project directory
PROJECT_DIR="/www/wwwroot/edutoon"
cd $PROJECT_DIR || { echo -e "${RED}❌ Directory $PROJECT_DIR not found${NC}"; exit 1; }

echo -e "${GREEN}📁 Working directory: $PROJECT_DIR${NC}"

# Check Node.js
echo ""
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
else
    echo -e "${RED}❌ Node.js not installed. Install via aaPanel first.${NC}"
    exit 1
fi

# Check PM2
echo ""
echo "📦 Checking PM2..."
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found. Installing...${NC}"
    npm install -g pm2
fi

# Check .env file
echo ""
echo "📄 Checking environment file..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    if [ -f ".env.production" ]; then
        echo -e "${YELLOW}⚠️  Copying .env.production to .env${NC}"
        cp .env.production .env
        echo -e "${RED}⚠️  PENTING: Edit file .env dan sesuaikan password database!${NC}"
    else
        echo -e "${RED}❌ No .env file found. Create one first.${NC}"
        exit 1
    fi
fi

# Build Backend
echo ""
echo "🔨 Building Backend (NestJS)..."
npm install --production=false
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

# Build Frontend
echo ""
echo "🔨 Building Frontend (Next.js)..."
cd frontend

# Check frontend .env
if [ ! -f ".env.production" ] && [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Creating frontend .env.production${NC}"
    echo "NEXT_PUBLIC_API_URL=/api" > .env.production
fi

npm install --production=false
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

# Stop existing PM2 processes
echo ""
echo "🔄 Restarting PM2 processes..."
pm2 stop edutoon-backend edutoon-frontend 2>/dev/null
pm2 delete edutoon-backend edutoon-frontend 2>/dev/null

# Start with PM2
pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PM2 started successfully${NC}"
else
    echo -e "${RED}❌ PM2 start failed${NC}"
    exit 1
fi

# Save PM2 list
pm2 save

echo ""
echo "============================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📝 Next Steps:"
echo "1. Setup Nginx reverse proxy di aaPanel"
echo "2. Test: curl http://localhost:3000/api"
echo "3. Test: curl http://localhost:3333"
echo ""
echo "📖 Baca DEPLOY_AAPANEL.md untuk panduan lengkap"
