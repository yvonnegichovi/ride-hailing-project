#!/bin/bash

echo "Setting up Ride Hailing Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

echo "Node.js version: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "Warning: PostgreSQL client not found. Please ensure PostgreSQL is installed."
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "Warning: Redis client not found. Please ensure Redis is installed."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update .env file with your configuration."
fi

# Create database (optional, requires PostgreSQL)
read -p "Do you want to create the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
    echo "Creating database: $DB_NAME"
    createdb $DB_NAME 2>/dev/null || echo "Database may already exist or you need to create it manually."
fi

# Run migrations
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running migrations..."
    npm run migrate
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Ensure PostgreSQL and Redis are running"
echo "3. Run 'npm run dev' to start the development server"
echo ""
