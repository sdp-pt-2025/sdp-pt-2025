# Campus Study Buddy - Complete Development Platform

> A comprehensive platform for university students to find study partners, create study groups, track progress, and manage study schedules with real-time weather integration and file management.

## 🚀 Quick Start

### One-Command Setup

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup-complete.bat
```

**Manual Setup:**
```bash
npm run install:all
npm run dev
```

**Quick Setup (Non-Interactive):**
```bash
./setup.sh --quick
```

**Setup Script Options:**
```bash
./setup.sh --help          # Show help and available options
./setup.sh --quick         # Quick setup with defaults
./setup.sh --test          # Run tests only
./setup.sh --seed          # Seed database only
./setup.sh --dev           # Start development servers only
./setup.sh --no-tests      # Skip running tests
./setup.sh --no-seed       # Skip database seeding
./setup.sh --no-git        # Skip Git hooks setup
```

## 📋 Prerequisites

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **npm 8+** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Firebase Project** - [Create here](https://console.firebase.google.com/)

## 🏗️ What This Platform Provides

### ✅ Complete Development Environment
- **Frontend**: React 19+ with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js 20+ with Express.js, Firebase Admin SDK
- **Database**: Firebase Firestore with comprehensive schema
- **Storage**: Firebase Storage for file management
- **Authentication**: Firebase Auth with Google OAuth
- **External APIs**: OpenWeatherMap integration

### ✅ Sprint 2 Features Implemented
- **Find Study Partners**: Match students based on shared modules/topics
- **Create Study Groups**: Group creation, joining, chat functionality
- **Progress Tracking**: Log completed topics and study hours
- **Session Planning**: Schedule study sessions with reminders
- **Weather Integration**: Real-time Wits campus weather
- **File Management**: PDF coursework file upload/download
- **Bug Tracking**: Integrated bug reporting system
- **Notifications**: Firebase Cloud Messaging integration

### ✅ Production-Ready Features
- **Health Checks**: Comprehensive monitoring endpoints
- **Error Handling**: Graceful error recovery and logging
- **Rate Limiting**: Configurable request throttling
- **Security**: CORS, Helmet, input validation
- **Performance**: Caching, compression, optimization
- **Testing**: 50%+ code coverage with unit and integration tests

## 🎯 Success Criteria

Your development environment is ready when:
- [ ] `npm run dev` starts both servers without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend health check passes at http://localhost:8080/health
- [ ] All tests pass with `npm test`
- [ ] Database seeding works with `npm run seed:db`
- [ ] Weather API integration shows real data
- [ ] File upload/download works in development
- [ ] Authentication flow works end-to-end

## 🔧 Available Commands

### Development
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend
```

### Testing
```bash
npm test                 # Run all tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Code Quality
```bash
npm run lint             # Run linting
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm run format:check     # Check code formatting
```

### Database
```bash
npm run seed:db          # Seed database with test data
npm run seed:test        # Seed test database
```

### Health & Monitoring
```bash
npm run health:check     # Check server health
curl http://localhost:8080/health/detailed  # Detailed health status
```

## 🌐 Development URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Detailed Health**: http://localhost:8080/health/detailed
- **API Documentation**: http://localhost:8080/docs (when generated)

## 📁 Project Structure

```
campus-study-buddy/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── weather/      # Weather widget
│   │   │   ├── files/        # File management
│   │   │   ├── bugs/         # Bug tracking
│   │   │   └── notifications/ # Notifications panel
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── firebase/        # Firebase configuration
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── weather.js   # Weather API integration
│   │   │   ├── files.js     # File management API
│   │   │   ├── notifications.js # Notifications API
│   │   │   ├── bugs.js      # Bug tracking API
│   │   │   ├── groups.js    # Study groups API
│   │   │   ├── partners.js  # Partner matching API
│   │   │   ├── progress.js  # Progress tracking API
│   │   │   └── schedule.js  # Session scheduling API
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.js      # Authentication middleware
│   │   │   └── errorHandler.js # Error handling
│   │   ├── scripts/         # Database seeding scripts
│   │   └── __tests__/       # Test files
│   ├── service-account.json # Firebase service account key
│   └── package.json
├── db/                      # Database documentation
│   └── schema.md           # Complete database schema
├── scripts/                 # Development scripts
├── docs/                    # Documentation
├── tests/                   # End-to-end tests
├── .env                     # Environment variables
├── package.json             # Root package.json
└── README.md
```

## 🔧 Environment Configuration

### Required Environment Variables

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=8080

# Firebase Configuration
FIREBASE_PROJECT_ID=sd2025law
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# External APIs
OPENWEATHER_API_KEY=your_openweather_api_key_here
WEATHER_CACHE_DURATION=300000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5174

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Notification Configuration
FCM_SERVER_KEY=your_fcm_server_key_here
```

#### Frontend (.env.local)
```env
# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=sd2025law.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sd2025law
VITE_FIREBASE_STORAGE_BUCKET=sd2025law.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### Getting API Keys

#### 1. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (sd2025law)
3. Go to **Project Settings** → **General**
4. Scroll down to **Your apps** section
5. Copy the configuration values to your `.env.local` file

#### 2. Firebase Service Account Key
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Save it as `backend/service-account.json`

#### 3. OpenWeatherMap API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your backend `.env` file

## 🗄️ Database Schema

The project includes a comprehensive Firebase Firestore schema with 11 collections:

1. **users** - User profiles and preferences
2. **study_groups** - Group information and membership
3. **group_messages** - Chat messages within groups
4. **study_sessions** - Individual study session records
5. **progress_tracking** - User progress on modules and topics
6. **notifications** - User notifications and messages
7. **scheduled_notifications** - Scheduled reminders
8. **coursework_files** - PDF file metadata
9. **bugs** - Bug reports and issue tracking
10. **bug_activities** - Activity log for bug reports
11. **user_feedback** - User feedback and suggestions

### Database Setup
```bash
# Seed database with sample data
npm run seed:db

# Seed test database
npm run seed:test
```

## 🧪 Testing Strategy

### Test Coverage Requirements
- **Minimum 50% code coverage** for all modules
- **Unit tests** for all utility functions and middleware
- **Integration tests** for all API endpoints
- **Mock services** for external dependencies

### Test Structure
```
backend/src/__tests__/
├── unit/                    # Unit tests
│   ├── routes/             # Route unit tests
│   ├── middleware/         # Middleware tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
│   ├── api.integration.test.js
│   └── database.integration.test.js
└── setup.js                # Test setup configuration
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- weather.test.js
```

## 🔐 Security Features

### Authentication & Authorization
- Firebase ID token verification
- Role-based access control
- Secure session management
- JWT token validation

### Data Protection
- Input validation and sanitization
- File upload security (type/size validation)
- Rate limiting (100 requests/15 minutes)
- CORS configuration
- Environment variable protection

### Privacy Compliance
- User data minimization
- Secure file storage
- Audit logging
- Data retention policies

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed service status
- `GET /health/database` - Database connectivity
- `GET /health/external` - External API status
- `GET /health/metrics` - Performance metrics

### Monitoring Features
- Real-time service status
- Performance metrics
- Error tracking
- Request logging
- Database query monitoring

## 🐳 Docker Support

### Development with Docker
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Build and start
docker-compose -f docker-compose.dev.yml up --build

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Services Included
- **Backend API** - Node.js application
- **Frontend** - React development server
- **Redis** - Caching and sessions
- **Nginx** - Reverse proxy (optional)
- **Prometheus** - Metrics collection (optional)
- **Grafana** - Monitoring dashboards (optional)

## 🔄 CI/CD Integration

### GitHub Actions
The project includes GitHub Actions workflow for:
- Automated testing on push/PR
- Code quality checks
- Build verification
- Deployment preparation

### Pre-commit Hooks
- Automatic linting
- Code formatting
- Test execution
- Security scanning

## 🐛 Troubleshooting

### Common Issues

#### 1. Firebase Connection Issues
```bash
# Check if service account key exists
ls -la backend/service-account.json

# Verify Firebase project ID
grep FIREBASE_PROJECT_ID backend/.env
```

#### 2. Port Already in Use
```bash
# Kill process on port 8080 (Linux/macOS)
lsof -ti:8080 | xargs kill -9

# Kill process on port 5173 (Linux/macOS)
lsof -ti:5173 | xargs kill -9

# Windows: Use Task Manager or
taskkill /f /im node.exe
```

#### 3. Module Not Found Errors
```bash
# Clear node_modules and reinstall
npm run clean
npm run install:all
```

#### 4. Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- weather.test.js

# Check test coverage
npm run test:coverage
```

### Getting Help
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the [API Documentation](http://localhost:8080/docs)
3. Check the [Database Schema](db/schema.md)
4. Run health checks: `npm run health:check`

## 🚀 Deployment

### Environment Setup
1. **Backend (Render.com)**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Copy from `backend/.env`

2. **Frontend (Vercel)**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Copy from `frontend/.env.local`

### Production Checklist
- [ ] Firebase project configured
- [ ] Environment variables set
- [ ] Service account key uploaded
- [ ] OpenWeatherMap API key configured
- [ ] Database indexes created
- [ ] Security rules deployed
- [ ] Domain configured
- [ ] SSL certificates active

## 📚 Project Management & Development Standards

### Git Workflow
We use **GitHub Flow** with structured conventions:

#### Commit Message Standards
Following **Conventional Commits** standard:

| Type       | Purpose                                         | Example                                     |
|------------|-------------------------------------------------|---------------------------------------------|
| **feat**   | Add a new feature                               | `feat: implement user authentication`      |
| **fix**    | Fix a bug                                      | `fix: correct validation logic for email input` |
| **docs**   | Documentation updates                           | `docs: update README with setup instructions` |
| **style**  | Formatting changes (no logic changes)          | `style: apply consistent code indentation` |
| **refactor** | Code improvements without changing behavior  | `refactor: simplify API request handling`  |
| **perf**   | Performance improvements                        | `perf: optimize image loading`             |
| **test**   | Add or update tests                             | `test: add unit tests for login module`    |
| **chore**  | Maintenance tasks                               | `chore: update project dependencies`       |

#### Branching Strategy
- **Always existing branches**: `main`, `release`, `stable`
- **Feature/fix branches**: `<type>/<developer>` or `sprint-<i>/ticket-<j>`
- **Versioning**: Semantic Versioning (SemVer) `x.y.z`

### Agile Methodology
- **Sprint-based development** with 2-week iterations
- **GitHub Projects** for task management
- **Continuous integration** and deployment
- **Regular stakeholder reviews** and feedback

## 🎯 Next Steps

1. **Explore the Codebase**: Start with the dashboard and API endpoints
2. **Run Tests**: Ensure all tests pass
3. **Make Changes**: Try modifying components and routes
4. **Add Features**: Implement new functionality
5. **Deploy**: Follow deployment guides for production

## 📞 Support

### Getting Help
- **Bug Reports**: Use the integrated bug tracker
- **Feature Requests**: Submit through the feedback system
- **Documentation**: Check the comprehensive guides
- **Community**: Join the user community

### Contact Information
- **Project Repository**: [GitHub Repository]
- **Database Schema**: `./db/schema.md`
- **API Documentation**: Available in Swagger UI

---

## 🎉 Conclusion

This development setup provides a complete, production-ready environment for the Campus Study Buddy platform. With comprehensive testing, monitoring, and documentation, you can confidently develop, test, and deploy features.

**Ready to start coding! 🚀**

### Quick Commands Reference
```bash
# Start development
npm run dev

# Run tests
npm test

# Check health
curl http://localhost:8080/health

# Seed database
npm run seed:db

# Generate docs
npm run docs:generate
```
