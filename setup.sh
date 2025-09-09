#!/bin/bash

# Campus Study Buddy - Complete Development Setup Script
# This script sets up the entire development environment from scratch
# Consolidates all setup functionality into a single script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 20 ]; then
            print_success "Node.js version: $(node -v) ✓"
            return 0
        else
            print_error "Node.js 20+ is required. Current version: $(node -v)"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to check npm version
check_npm_version() {
    if command_exists npm; then
        NPM_VERSION=$(npm -v | cut -d'.' -f1)
        if [ "$NPM_VERSION" -ge 8 ]; then
            print_success "npm version: $(npm -v) ✓"
            return 0
        else
            print_error "npm 8+ is required. Current version: $(npm -v)"
            return 1
        fi
    else
        print_error "npm is not installed"
        return 1
    fi
}

# Function to check Git
check_git() {
    if command_exists git; then
        print_success "Git version: $(git --version) ✓"
        return 0
    else
        print_error "Git is not installed"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    print_success "All dependencies installed successfully"
}

# Function to setup environment files
setup_environment() {
    print_header "Setting Up Environment Files"
    
    # Root .env
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cp env.example .env
        print_success ".env file created"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend/.env file..."
        cp backend/env.example backend/.env
        print_success "backend/.env file created"
    else
        print_warning "backend/.env file already exists, skipping..."
    fi
    
    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        print_status "Creating frontend/.env.local file..."
        cat > frontend/.env.local << EOF
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=sd2025law.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sd2025law
VITE_FIREBASE_STORAGE_BUCKET=sd2025law.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
EOF
        print_success "frontend/.env.local file created"
    else
        print_warning "frontend/.env.local file already exists, skipping..."
    fi
}

# Function to create necessary directories
create_directories() {
    print_header "Creating Project Directories"
    
    print_status "Creating backend test directories..."
    mkdir -p backend/src/__tests__/api
    mkdir -p backend/src/__tests__/integration
    mkdir -p backend/coverage
    
    print_status "Creating frontend component directories..."
    mkdir -p frontend/src/components/weather
    mkdir -p frontend/src/components/files
    mkdir -p frontend/src/components/bugs
    mkdir -p frontend/src/components/notifications
    
    print_status "Creating documentation directories..."
    mkdir -p docs
    mkdir -p scripts
    
    print_success "All directories created successfully"
}

# Function to setup Git hooks
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_header "Setting Up Git Hooks"
        
        print_status "Creating pre-commit hook..."
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running pre-commit checks..."

# Run backend linting
cd backend
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Backend linting failed"
    exit 1
fi

# Run frontend linting
cd ../frontend
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Frontend linting failed"
    exit 1
fi

echo "✅ Pre-commit checks passed"
EOF

        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configured"
    else
        print_warning "Not in a git repository, skipping Git hooks setup"
    fi
}

# Function to setup Firebase
setup_firebase() {
    print_header "Firebase Setup Instructions"
    
    echo -e "${CYAN}Please complete the following Firebase setup:${NC}"
    echo ""
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Select your project (sd2025law) or create a new one"
    echo "3. Enable the following services:"
    echo "   - Authentication (Email/Password and Google)"
    echo "   - Firestore Database"
    echo "   - Storage"
    echo "   - Cloud Messaging"
    echo ""
    echo "4. Get your Firebase configuration:"
    echo "   - Go to Project Settings → General"
    echo "   - Scroll to 'Your apps' section"
    echo "   - Copy the config values to frontend/.env.local"
    echo ""
    echo "5. Download service account key:"
    echo "   - Go to Project Settings → Service Accounts"
    echo "   - Click 'Generate New Private Key'"
    echo "   - Save as backend/service-account.json"
    echo ""
    echo "6. Get OpenWeatherMap API key:"
    echo "   - Go to https://openweathermap.org/api"
    echo "   - Sign up for free account"
    echo "   - Get API key and add to backend/.env"
    echo ""
    
    # Check if service account file exists
    if [ ! -f "backend/service-account.json" ]; then
        print_warning "Firebase service account file not found"
        print_status "Please download your Firebase service account key and save it as backend/service-account.json"
        print_status "Get it from: https://console.firebase.google.com/u/0/project/sd2025law/settings/serviceaccounts/adminsdk"
    else
        print_success "Firebase service account file found"
    fi
    
    read -p "Press Enter when you've completed the Firebase setup..."
}

# Function to run tests
run_tests() {
    print_header "Running Tests"
    
    print_status "Running backend tests..."
    if cd backend && npm test -- --passWithNoTests && cd ..; then
        print_success "Backend tests passed"
    else
        print_warning "Some backend tests failed, but continuing..."
    fi
    
    print_status "Running frontend linting..."
    if cd frontend && npm run lint && cd ..; then
        print_success "Frontend linting passed"
    else
        print_warning "Frontend linting issues found, but continuing..."
    fi
    
    print_status "Running root linting..."
    if npm run lint; then
        print_success "Root linting passed"
    else
        print_warning "Root linting issues found, but continuing..."
    fi
}

# Function to seed database
seed_database() {
    print_header "Database Seeding"
    
    read -p "Do you want to seed the database with test data? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Seeding database with test data..."
        if cd backend && npm run seed:db && cd ..; then
            print_success "Database seeded successfully"
        else
            print_warning "Database seeding failed, but continuing..."
        fi
    else
        print_warning "Skipping database seeding"
    fi
}

# Function to start development servers
start_development() {
    print_header "Starting Development Servers"
    
    print_status "Starting both frontend and backend servers..."
    print_status "Frontend will be available at: http://localhost:5173"
    print_status "Backend will be available at: http://localhost:8080"
    print_status "Health check: http://localhost:8080/health"
    print_status ""
    print_status "Press Ctrl+C to stop the servers"
    print_status ""
    
    # Start development servers
    npm run dev
}

# Function to show final instructions
show_final_instructions() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}🎉 Campus Study Buddy development environment is ready!${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "1. Update your environment files with actual API keys"
    echo "2. Add your Firebase service account key to backend/service-account.json"
    echo "3. Run 'npm run dev' to start the development servers"
    echo ""
    echo -e "${CYAN}Useful commands:${NC}"
    echo "- npm run dev          # Start both frontend and backend"
    echo "- npm run test         # Run all tests"
    echo "- npm run test:watch   # Run tests in watch mode"
    echo "- npm run lint         # Run linting"
    echo "- npm run seed:db      # Seed database with test data"
    echo "- npm run health:check # Check server health"
    echo ""
    echo -e "${CYAN}URLs:${NC}"
    echo "- Frontend: http://localhost:5173"
    echo "- Backend: http://localhost:8080"
    echo "- Health Check: http://localhost:8080/health"
    echo "- API Docs: http://localhost:8080/docs (when generated)"
    echo ""
    echo -e "${CYAN}Documentation:${NC}"
    echo "- Complete Guide: ./README.md"
    echo "- Database Schema: ./db/schema.md"
    echo ""
    echo -e "${CYAN}Useful links:${NC}"
    echo "- Firebase Console: https://console.firebase.google.com/u/0/project/sd2025law"
    echo "- OpenWeatherMap API: https://openweathermap.org/api"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Function to show help
show_help() {
    echo "Campus Study Buddy - Development Setup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -q, --quick    Quick setup (skip interactive prompts)"
    echo "  -t, --test     Run tests only"
    echo "  -s, --seed     Seed database only"
    echo "  -d, --dev      Start development servers only"
    echo "  --no-tests     Skip running tests"
    echo "  --no-seed      Skip database seeding"
    echo "  --no-git       Skip Git hooks setup"
    echo ""
    echo "Examples:"
    echo "  $0              # Full interactive setup"
    echo "  $0 --quick      # Quick setup with defaults"
    echo "  $0 --test       # Run tests only"
    echo "  $0 --seed       # Seed database only"
    echo "  $0 --dev        # Start development servers"
}

# Parse command line arguments
QUICK_MODE=false
RUN_TESTS=true
SEED_DB=true
SETUP_GIT=true
START_DEV=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -q|--quick)
            QUICK_MODE=true
            shift
            ;;
        -t|--test)
            run_tests
            exit 0
            ;;
        -s|--seed)
            seed_database
            exit 0
            ;;
        -d|--dev)
            start_development
            exit 0
            ;;
        --no-tests)
            RUN_TESTS=false
            shift
            ;;
        --no-seed)
            SEED_DB=false
            shift
            ;;
        --no-git)
            SETUP_GIT=false
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main setup function
main() {
    print_header "Campus Study Buddy - Complete Development Setup"
    
    # Check prerequisites
    print_header "Checking Prerequisites"
    if ! check_node_version || ! check_npm_version || ! check_git; then
        print_error "Prerequisites check failed. Please install the required software."
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Create directories
    create_directories
    
    # Setup Git hooks
    if [ "$SETUP_GIT" = true ]; then
        setup_git_hooks
    fi
    
    # Setup Firebase (instructions)
    if [ "$QUICK_MODE" = false ]; then
        setup_firebase
    else
        print_warning "Quick mode: Skipping Firebase setup instructions"
        print_status "Please configure Firebase manually using the README.md guide"
    fi
    
    # Run tests
    if [ "$RUN_TESTS" = true ]; then
        run_tests
    else
        print_warning "Skipping tests as requested"
    fi
    
    # Seed database
    if [ "$SEED_DB" = true ] && [ "$QUICK_MODE" = false ]; then
        seed_database
    elif [ "$SEED_DB" = true ] && [ "$QUICK_MODE" = true ]; then
        print_status "Quick mode: Skipping database seeding"
        print_status "Run 'npm run seed:db' later to seed the database"
    else
        print_warning "Skipping database seeding as requested"
    fi
    
    # Show final instructions
    show_final_instructions
    
    # Ask if user wants to start development servers
    if [ "$QUICK_MODE" = false ]; then
        echo ""
        read -p "Do you want to start the development servers now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            start_development
        else
            print_status "You can start the servers later with: npm run dev"
        fi
    else
        print_status "Quick mode: Use 'npm run dev' to start development servers"
    fi
}

# Run main function
main "$@"
