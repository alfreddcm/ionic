# Expense Recorder - Ionic + CodeIgniter Full-Stack Application

This is a full-stack expense tracking application combining Ionic Framework (Angular) for the mobile frontend with CodeIgniter 4 for the backend API.

## 🚀 Quick Setup (Portable Installation)

This project is designed to work seamlessly on any computer after transferring. Just follow these steps:

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PHP** (v7.4 or higher) - [Download](https://www.php.net/downloads)
- **Composer** - [Download](https://getcomposer.org/)
- **MySQL/MariaDB** - [Download](https://www.mysql.com/downloads/)

### One-Command Setup

1. **Clone or copy this project** to your computer
2. **Run the automated setup**:
   ```bash
   npm install
   ```

That's it! The setup script will automatically:
- ✅ Create environment configuration files from templates
- ✅ Install frontend (Ionic/Angular) dependencies
- ✅ Install backend (CodeIgniter/PHP) dependencies
- ✅ Configure the project for your local environment

### Manual Setup (If Automated Setup Fails)

If the automated setup doesn't work, follow these manual steps:

**Step 1: Setup Environment Files**
```bash
# Backend
cd backend
copy .env.example .env
composer install

# Frontend
cd ../frontend
copy .env.example .env
npm install
```

**Step 2: Configure Database**
1. Create a database named `expense_recorder` in MySQL
2. Import the database schema:
   ```bash
   mysql -u root -p expense_recorder < expense_tracker.sql
   ```
3. Edit `backend/.env` and update database credentials:
   ```env
   database.default.hostname = localhost
   database.default.database = expense_recorder
   database.default.username = root
   database.default.password = your_password
   ```

**Step 3: Configure API URL (if using different port)**
If your backend runs on a different port, update `frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // Change port if needed
};
```

## 🎮 Running the Application

### Option 1: Start Both Servers Together
```bash
npm start
```

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
npm run start:backend
# or manually: cd backend && php spark serve
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
# or manually: cd frontend && npm start
```

### Access the Application
- **Frontend App**: http://localhost:8100
- **Backend API**: http://localhost:8080

## 📁 Project Structure

```
├── frontend/          # Ionic Angular mobile app
│   ├── src/
│   │   ├── app/              # Application modules and components
│   │   ├── environments/     # Environment configurations (dev/prod)
│   │   └── ...
│   ├── .env.example          # Frontend environment template
│   └── package.json
├── backend/           # CodeIgniter 4 PHP API
│   ├── app/
│   │   ├── Controllers/      # API controllers
│   │   ├── Models/          # Database models
│   │   ├── Config/          # Configuration files
│   │   └── ...
│   ├── .env.example          # Backend environment template
│   ├── composer.json
│   └── spark                # CodeIgniter CLI tool
├── scripts/
│   └── setup.js             # Automated setup script
├── expense_tracker.sql      # Database schema
├── package.json             # Root package configuration
└── README.md
```

## 🔧 Available NPM Scripts

Run these commands from the **root directory**:

- `npm install` - Complete automated setup
- `npm start` - Start both frontend and backend servers
- `npm run start:frontend` - Start only the Ionic development server
- `npm run start:backend` - Start only the CodeIgniter API server
- `npm run install:frontend` - Install frontend dependencies only
- `npm run install:backend` - Install backend dependencies only
- `npm run build:frontend` - Build frontend for production

## ⚙️ Configuration Files

### Backend Configuration (`backend/.env`)
```env
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080/'

database.default.hostname = localhost
database.default.database = expense_recorder
database.default.username = root
database.default.password = 
database.default.DBDriver = MySQLi
database.default.port = 3306
```

### Frontend Configuration (`frontend/src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🌐 API Endpoints

The backend provides these REST API endpoints:

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Expenses:**
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/today` - Get today's expenses
- `GET /api/expenses/monthly` - Get monthly expenses
- `GET /api/expenses/summary` - Get expense summary
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

**Budget:**
- `GET /api/budgets` - Get budget information
- `POST /api/budgets` - Create/update budget
- `POST /api/budgets/update-spent` - Update spent amount

**Categories:**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category

## 🐛 Troubleshooting

### "Cannot connect to backend" Error

**Solution:**
1. Ensure backend server is running: `npm run start:backend`
2. Check database connection in `backend/.env`
3. Verify database is created and imported
4. Check API URL in `frontend/src/environments/environment.ts`

### Port Already in Use

**Backend (8080):**
```bash
# Find and kill process on Windows
netstat -ano | findstr :8080
taskkill /PID <process_id> /F

# Or change port in backend/.env
app.baseURL = 'http://localhost:8081/'
```

**Frontend (8100):**
```bash
cd frontend
ng serve --port 8101
# Update API calls if needed
```

### Database Connection Failed

1. Verify MySQL/MariaDB is running
2. Check credentials in `backend/.env`
3. Ensure database `expense_recorder` exists
4. Import schema: `mysql -u root -p expense_recorder < expense_tracker.sql`

### Module Not Found Errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# For frontend specifically
cd frontend
rm -rf node_modules package-lock.json
npm install

# For backend specifically
cd backend
rm -rf vendor composer.lock
composer install
```

### Composer/PHP Issues

**Error: "composer not found"**
- Install Composer from https://getcomposer.org/
- Add Composer to system PATH

**Error: "PHP extensions missing"**
- Enable required extensions in `php.ini`:
  - extension=intl
  - extension=mysqli
  - extension=mbstring

## 📱 Building for Mobile

### Android
```bash
cd frontend
ionic capacitor add android
ionic capacitor build android
ionic capacitor run android
```

### iOS (Mac only)
```bash
cd frontend
ionic capacitor add ios
ionic capacitor build ios
ionic capacitor run ios
```

## 🔒 Security Notes for Production

Before deploying to production:

1. **Update environment files:**
   - Set `CI_ENVIRONMENT = production` in backend/.env
   - Set `production: true` in environment.prod.ts

2. **Secure database:**
   - Use strong passwords
   - Limit user permissions
   - Enable SSL connections

3. **Update CORS settings:**
   - Configure allowed origins in backend
   - Remove wildcard (*) origins

4. **Use HTTPS:**
   - Update apiUrl to use https://
   - Configure SSL certificates

## 🎯 Transferring to Another Computer

To transfer this project to another computer:

1. **Copy the entire project folder** (or use Git)
2. **Run on new computer:**
   ```bash
   npm install
   ```
3. **Update database settings** in `backend/.env` if database credentials differ
4. **Import database schema** if database doesn't exist on new machine
5. **Start servers:**
   ```bash
   npm start
   ```

That's it! The project is fully portable and self-contained.

## 📝 Development Workflow

1. Make changes to frontend (Angular) or backend (PHP)
2. Changes auto-reload in development mode
3. Test API endpoints using the Ionic app or tools like Postman
4. Commit changes to version control
5. Deploy when ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add feature'`
6. Push: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.