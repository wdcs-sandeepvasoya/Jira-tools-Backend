#!/bin/bash

echo "🚀 Setting up Jira Tools Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local with your configuration before continuing."
    echo "   Required variables:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - JIRA_BASE_URL"
    echo "   - JIRA_EMAIL"
    echo "   - JIRA_API_TOKEN"
    echo ""
    echo "   After editing .env.local, run:"
    echo "   npm run db:generate"
    echo "   npm run db:push"
    echo "   npm run dev"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Run: npm run db:generate"
echo "3. Run: npm run db:push"
echo "4. Run: npm run dev"
echo "5. Open http://localhost:3000"
