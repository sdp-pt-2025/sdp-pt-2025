# Campus Study Buddy API Server

Express.js API server for the Campus Study Buddy platform, built with Node.js 20+ and ESM modules.

## 🚀 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18+
- **Authentication**: Firebase Admin SDK
- **Modules**: ES6+ (ESM)
- **Development**: Nodemon for hot reloading
- **Security**: Helmet, CORS
- **Validation**: express-validator
- **Documentation**: OpenAPI 3.0 specification
- **Testing**: Node.js built-in test runner

## 📋 Prerequisites

- Node.js 20.0.0 or higher
- npm or yarn package manager
- Firebase project with Authentication enabled

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Firebase Configuration

#### Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Rename it to `service-account.json` and place it in the `/server` directory

#### Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your Firebase project details:

```env
PORT=8080
NODE_ENV=development
FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### 3. Run the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:8080`

## 🔐 Authentication

The API uses Firebase ID tokens for authentication. All protected routes require the `Authorization: Bearer <token>` header.

### Getting Firebase ID Token (Frontend)

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  // Use this token in Authorization header
}
```

### Example API Call

```javascript
const response = await fetch('/api/partners?module=COMS3011', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 📚 API Endpoints

### Health Check
- `GET /health` - API health status

### Study Partners (Advanced Search)
- `GET /api/partners` - List study partners with advanced filtering
  - **Query Parameters:**
    - `module`: Single module filter (e.g., `?module=COMS3011`)
    - `notModule`: Anti-search - exclude partners taking this module (e.g., `?notModule=COMS3011`)
    - `modules`: Multiple modules, any match (e.g., `?modules=COMS3011,MATH2001`)
    - `modulesAll`: Multiple modules, must match all (e.g., `?modulesAll=COMS3011,MATH2001`)
    - `page`: Page number for pagination (default: 1)
    - `limit`: Items per page (default: 10, max: 100)
- `GET /api/partners/:id` - Get specific partner details

### Study Groups
- `GET /api/groups` - List study groups
- `GET /api/groups/:id` - Get specific group details
- `POST /api/groups` - Create new study group
- `POST /api/groups/:id/join` - Join existing group
- `POST /api/groups/:id/message` - Send message to group
- `GET /api/groups/:id/messages` - Get group messages

### Study Progress
- `GET /api/progress` - Get current user's progress summary
- `POST /api/progress` - Create progress entry
- `GET /api/progress/:userId` - Get user's detailed progress

### Schedule (Mock Implementation)
- `GET /api/schedule` - List calendar events
- `POST /api/schedule` - Create calendar event
- `GET /api/schedule/:id` - Get specific event details

> **Note**: Schedule endpoints are currently mocked. Real Google Calendar integration will be added in Sprint 2.

## 🔍 Advanced Search Features

### Anti-Search (Exclusion)
The partners endpoint supports "anti-search" to find users who are NOT taking specific modules:

```bash
# Find partners NOT taking COMS3011
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8080/api/partners?notModule=COMS3011"

# Find partners taking MATH2001 but NOT COMS3011
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8080/api/partners?module=MATH2001&notModule=COMS3011"
```

### Multiple Module Filters
```bash
# Find partners taking ANY of these modules
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8080/api/partners?modules=COMS3011,MATH2001,PHYS1001"

# Find partners taking ALL of these modules
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8080/api/partners?modulesAll=COMS3011,MATH2001"
```

### Pagination
```bash
# Get first page with 5 results
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8080/api/partners?page=1&limit=5"

# Get second page with 10 results
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8080/api/partners?page=2&limit=10"
```

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:8080/health
```

### Protected Endpoints (with Firebase ID token)
```bash
# Get study partners for COMS3011
curl -H "Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>" \
  "http://localhost:8080/api/partners?module=COMS3011"

# Anti-search: find partners NOT taking COMS3011
curl -H "Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>" \
  "http://localhost:8080/api/partners?notModule=COMS3011"

# Create a study group
curl -X POST -H "Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"COMS3011 Study Group","module":"COMS3011","description":"Advanced Software Engineering"}' \
  "http://localhost:8080/api/groups"

# Create a progress entry
curl -X POST -H "Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"module":"COMS3011","topic":"Design Patterns","hours":2.5,"confidence":4}' \
  "http://localhost:8080/api/progress"

# Create a calendar event
curl -X POST -H "Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Study Session","startISO":"2024-01-25T14:00:00Z","endISO":"2024-01-25T16:00:00Z"}' \
  "http://localhost:8080/api/schedule"
```

## 🚀 Deployment to Render

### Build Configuration

**Build Command**: `npm install`
**Start Command**: `npm start`

### Environment Variables

Set these in your Render dashboard:

```env
NODE_ENV=production
PORT=10000
FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### Service Account File

1. Upload your `service-account.json` file to Render
2. Set the path in `GOOGLE_APPLICATION_CREDENTIALS`

### Health Check URL

Set the health check URL to: `/health`

## 📁 Project Structure

```
server/
├── src/
│   ├── index.js              # Main server entry point
│   ├── middleware/
│   │   ├── auth.js           # Firebase authentication middleware
│   │   └── validation.js     # Input validation middleware
│   ├── routes/
│   │   ├── health.js         # Health check endpoint
│   │   ├── partners.js       # Study partners API with advanced search
│   │   ├── groups.js         # Study groups API
│   │   ├── progress.js       # Study progress API
│   │   └── schedule.js       # Calendar/schedule API (mock)
│   └── utils/
│       ├── search.js         # Search utility functions
│       └── search.test.js    # Unit tests for search functions
├── package.json              # Dependencies and scripts
├── env.example              # Environment variables template
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── openapi.yaml             # API documentation
└── README.md                # This file
```

## 🔧 Development Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
The test suite covers:
- Search utility functions (parseModules, matchesModuleFilters, applyPagination)
- Anti-search functionality
- Pagination logic
- Edge cases and error handling

## 🐛 Troubleshooting

### Firebase Admin Initialization Issues

- Ensure `service-account.json` is in the correct location
- Verify `FIREBASE_PROJECT_ID` matches your Firebase project
- Check that the service account has the necessary permissions

### CORS Issues

- The API is configured to accept requests from `localhost:3000` and `localhost:5173`
- For production, update the CORS origin in `src/index.js`

### Port Already in Use

- Change the `PORT` in your `.env` file
- Or kill the process using the port: `lsof -ti:8080 | xargs kill -9`

### Validation Errors

- Check the request body against the validation schemas
- Ensure all required fields are present
- Verify data types and length constraints

## 📖 API Documentation

Full API documentation is available in `openapi.yaml`. You can view it using tools like:

- [Swagger Editor](https://editor.swagger.io/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Postman](https://www.postman.com/) (import the OpenAPI spec)

## 🎯 Sprint 1 Features

✅ **Completed**
- Firebase authentication (client + server)
- Advanced study partners search with anti-search
- Study groups management (create, join, message)
- Progress tracking API
- Schedule API (mock implementation)
- Health check endpoint
- CORS configuration
- Comprehensive input validation
- Error handling middleware
- OpenAPI documentation
- Unit tests for search functions
- Development environment setup

🔄 **Next Sprint (Sprint 2)**
- Google Calendar OAuth integration
- Real-time messaging (WebSocket)
- File sharing in study groups
- Advanced search and filtering
- User profiles and preferences
- Database persistence (Prisma + SQLite)

## 🤝 Contributing

1. Follow the established code structure
2. Use ESM imports/exports
3. Follow ESLint and Prettier configurations
4. Add unit tests for new functionality
5. Update the OpenAPI specification for new endpoints
6. Test your changes locally before committing

## 📄 License

This project is part of the Campus Study Buddy platform.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting sections in this README
2. Review the OpenAPI specification
3. Check Firebase console for authentication issues
4. Verify environment variables are set correctly
5. Run tests to ensure functionality is working
