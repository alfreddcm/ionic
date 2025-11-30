# 📊 Project Structure & Configuration Flow

## 🏗️ Directory Structure

```
inoic/
│
├── 📄 package.json              → Root config with setup scripts
├── 📄 setup.bat                 → Windows quick setup
├── 📄 setup.sh                  → Mac/Linux quick setup
│
├── 📚 Documentation/
│   ├── README.md                → Full documentation
│   ├── QUICKSTART.md            → Quick start (3 steps)
│   ├── SETUP.md                 → Detailed setup guide
│   ├── POST-INSTALL.md          → After npm install steps
│   └── PORTABILITY-IMPROVEMENTS.md → This summary
│
├── 🔧 scripts/
│   ├── setup.js                 → Auto-setup script (runs on npm install)
│   └── validate.js              → Configuration validator (npm run validate)
│
├── 🎨 frontend/                 → Ionic Angular App
│   ├── .env.example             → Frontend config template
│   ├── .env                     → [Created by setup] Frontend config
│   ├── package.json             → Frontend dependencies
│   │
│   └── src/
│       ├── environments/
│       │   ├── environment.ts   → ✅ Dev config with apiUrl
│       │   └── environment.prod.ts → ✅ Prod config with apiUrl
│       │
│       └── app/
│           └── services/
│               └── api.service.ts → ✅ Uses environment.apiUrl
│
└── ⚙️ backend/                  → CodeIgniter 4 API
    ├── .env.example             → Backend config template
    ├── .env                     → [Created by setup] Backend config
    ├── composer.json            → Backend dependencies
    │
    └── app/
        ├── Config/
        │   └── Database.php     → Reads from .env
        │
        └── Controllers/         → API endpoints
```

## 🔄 Configuration Flow

### Before (Hardcoded):
```
api.service.ts
  ↓
  baseUrl = 'http://localhost:8080/api'  ❌ Hardcoded!
  ↓
  Backend API
```

### After (Environment-based):
```
environment.ts
  ↓
  apiUrl = 'http://localhost:8080/api'  ✅ Configurable!
  ↓
api.service.ts
  ↓
  baseUrl = environment.apiUrl
  ↓
  Backend API
```

## 🚀 Setup Process Flow

### First Time Setup:
```
1. User runs: npm install
   ↓
2. Triggers: npm run setup
   ↓
3. Runs: scripts/setup.js
   ↓
4. Creates:
   - backend/.env (from .env.example)
   - frontend/.env (from .env.example)
   ↓
5. Installs:
   - Frontend dependencies (npm install)
   - Backend dependencies (composer install)
   ↓
6. Shows: Next steps (database setup)
```

### Validation:
```
User runs: npm run validate
   ↓
Runs: scripts/validate.js
   ↓
Checks:
   ✓ Node.js version
   ✓ Required files exist
   ✓ .env files created
   ✓ Dependencies installed
   ✓ Environment configured
   ↓
Reports: ✅ Ready or ⚠️ Issues
```

### Starting Application:
```
User runs: npm start
   ↓
Starts: Both servers concurrently
   ├─→ Backend: php spark serve (port 8080)
   └─→ Frontend: npm start (port 8100)
```

## 📝 Environment Variables

### Backend (.env):
```env
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080/'

database.default.hostname = localhost
database.default.database = expense_recorder
database.default.username = root
database.default.password = [USER_SETS_THIS]
database.default.port = 3306
```

### Frontend (environment.ts):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🔀 Transfer Process

### Computer A → Computer B:
```
Computer A:
  Copy entire folder
  OR
  Git push (excludes .env files)
     ↓
Computer B:
  1. npm install
     ↓
  2. Configure backend/.env
     ↓
  3. Create & import database
     ↓
  4. npm start
     ↓
  ✅ Working!
```

## 🎯 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `package.json` | Root config with all npm scripts |
| `scripts/setup.js` | Automated setup on first run |
| `scripts/validate.js` | Validates configuration |
| `backend/.env.example` | Template for database config |
| `frontend/.env.example` | Template for API config |
| `environment.ts` | Frontend environment settings |
| `api.service.ts` | Uses environment for API URL |

## 🛠️ NPM Scripts

```
npm install        → Complete setup
npm start          → Start both servers
npm run validate   → Check configuration
npm run start:backend   → Backend only
npm run start:frontend  → Frontend only
npm run install:all     → Reinstall dependencies
```

## 🎨 Visual Setup Flow

```
┌─────────────────────────────────────────┐
│  New Computer / Fresh Install           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  npm install                            │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────────────┐
        │  scripts/setup.js│
        └─────────────────┘
                  ↓
    ┌──────────────────────────┐
    │  Creates .env files       │
    │  Installs dependencies    │
    └──────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  User configures database in .env       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  npm run validate (optional)            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  npm start                              │
└─────────────────────────────────────────┘
                  ↓
    ┌──────────────────────────┐
    │  Backend → :8080          │
    │  Frontend → :8100         │
    └──────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  ✅ Application Running!                │
└─────────────────────────────────────────┘
```

## 📋 Checklist for Developers

### First Time Setup:
- [ ] Clone/copy project
- [ ] Run `npm install`
- [ ] Create database
- [ ] Import schema
- [ ] Configure `backend/.env`
- [ ] Run `npm run validate`
- [ ] Run `npm start`

### Daily Development:
- [ ] `npm start` to begin
- [ ] Make changes
- [ ] Test changes
- [ ] Commit (without .env files)

### Transferring:
- [ ] Copy project folder
- [ ] `npm install` on new machine
- [ ] Configure database
- [ ] `npm start`

---

**Everything is automated and portable! 🎉**
