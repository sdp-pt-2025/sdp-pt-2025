# Campus Study Buddy 🎓

A comprehensive platform for university students to find study partners, form study groups, track progress, and manage study schedules.

## 🏗️ Project Structure

```
campus-study-buddy/
├── frontend/           # React app (Create React App)
├── server/            # Express.js API server
├── package.json       # Root package.json with convenience scripts
└── README.md          # This file
```

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19+ (Create React App)
- **Authentication**: Firebase Auth (client-side)
- **Styling**: CSS3 with modern design patterns

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18+
- **Authentication**: Firebase Admin SDK
- **Modules**: ES6+ (ESM)
- **Security**: Helmet, CORS, JWT verification

### Development Tools
- **Package Manager**: npm
- **Process Manager**: concurrently (runs both frontend and backend)
- **Hot Reloading**: nodemon (backend), CRA dev server (frontend)
- **Code Quality**: ESLint, Prettier
- **Documentation**: OpenAPI 3.0 specification

## 📋 Prerequisites

- **Node.js**: 20.0.0 or higher
- **npm**: 8.0.0 or higher
- **Firebase Project**: With Authentication enabled

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Firebase Setup

#### Get Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Rename it to `service-account.json` and place it in `/server`

#### Configure Environment
```bash
cd server
cp env.example .env
```

Edit `server/.env`:
```env
PORT=8080
NODE_ENV=development
FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### 3. Run the Application

```bash
# Start both frontend and backend simultaneously
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

## 🔧 Available Scripts

### Root Level
```bash
npm run dev          # Start both frontend and backend
npm run dev:web      # Start only frontend
npm run dev:api      # Start only backend
npm run install:all  # Install all dependencies
npm run build        # Build frontend for production
npm run test         # Run tests (when implemented)
```

### Frontend (`/frontend`)
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint code
```

### Backend (`/server`)
```bash
npm run dev          # Start with nodemon (hot reload)
npm start            # Start production server
npm test             # Run tests (when implemented)
```

## 🔐 Authentication Flow

1. **Frontend**: User logs in via Firebase Auth
2. **Frontend**: Gets Firebase ID token using `user.getIdToken()`
3. **Frontend**: Sends API requests with `Authorization: Bearer <token>` header
4. **Backend**: Verifies token using Firebase Admin SDK
5. **Backend**: Processes request with authenticated user context

## 📚 API Endpoints

### Public
- `GET /health` - Health check

### Protected (Require Firebase ID token)
- `GET /api/partners` - List study partners
- `POST /api/groups` - Create study group
- `POST /api/groups/:id/join` - Join study group
- `POST /api/groups/:id/message` - Send message to group
- `GET /api/groups/:id/messages` - Get group messages
- `POST /api/progress` - Create progress entry
- `GET /api/progress/:userId` - Get user progress
- `POST /api/schedule` - Create calendar event (mock)
- `GET /api/schedule` - List calendar events (mock)

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:8080/health
```

### Protected Endpoints
```bash
# Get study partners (replace <TOKEN> with actual Firebase ID token)
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8080/api/partners?module=COMS3011"

# Create study group
curl -X POST -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Group","module":"COMS3011"}' \
  "http://localhost:8080/api/groups"
```

## 🌐 Frontend Integration

The frontend includes an example component (`ApiExample.js`) demonstrating:
- Firebase authentication
- Getting ID tokens
- Making authenticated API calls
- Error handling and loading states

### Key Integration Points
```javascript
// Get Firebase ID token
const token = await user.getIdToken();

// Make authenticated API call
const response = await fetch('/api/partners', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🚀 Deployment

### Frontend (Static Hosting)
- Build: `npm run build`
- Deploy the `build/` folder to any static hosting service

### Backend (Render/Heroku)
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Copy from `server/.env.example`

## 📖 Documentation

- **API Documentation**: `server/openapi.yaml` (OpenAPI 3.0)
- **Server README**: `server/README.md` (detailed backend setup)
- **Frontend Examples**: `frontend/src/components/ApiExample.js`

## 🎯 Sprint 1 Features

✅ **Completed**
- Firebase authentication (client + server)
- Study partners API with filtering
- Study groups management (create, join, message)
- Progress tracking API
- Schedule API (mock implementation)
- Health check endpoint
- CORS configuration
- Comprehensive error handling
- OpenAPI documentation
- Development environment setup

🔄 **Next Sprint**
- Google Calendar OAuth integration
- Real-time messaging (WebSocket)
- File sharing in study groups
- Advanced search and filtering
- User profiles and preferences

## 🤝 Contributing

1. Follow the established code structure
2. Use ESM imports/exports
3. Follow ESLint and Prettier configurations
4. Update OpenAPI specification for new endpoints
5. Test locally before committing

## 📄 License

This project is part of the Campus Study Buddy platform.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting sections in READMEs
2. Review the OpenAPI specification
3. Check Firebase console for authentication issues
4. Verify environment variables are set correctly
