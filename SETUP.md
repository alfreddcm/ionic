# 🚀 SETUP GUIDE - Expense Recorder

## Quick Setup Checklist

- [ ] Prerequisites installed (Node.js, PHP, Composer, MySQL)
- [ ] Project copied/cloned to your computer
- [ ] Run `npm install` in root directory
- [ ] Database created and imported
- [ ] Backend .env configured with database credentials
- [ ] Both servers started successfully
- [ ] Application accessible in browser

---

## Step-by-Step Setup Instructions

### 1️⃣ Prerequisites

Install these tools before proceeding:

#### Windows
- **Node.js**: Download from https://nodejs.org/ (LTS version)
- **PHP**: Download from https://windows.php.net/download/
- **Composer**: Download from https://getcomposer.org/download/
- **MySQL/MariaDB**: Download from https://www.mysql.com/downloads/ or https://mariadb.org/download/

#### macOS
```bash
# Using Homebrew
brew install node
brew install php
brew install composer
brew install mysql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm
sudo apt install php php-cli php-mbstring php-xml php-mysqli
sudo apt install composer
sudo apt install mysql-server
```

### 2️⃣ Verify Installations

Open terminal/command prompt and verify:

```bash
node --version    # Should show v16.x.x or higher
npm --version     # Should show 8.x.x or higher
php --version     # Should show 7.4.x or higher
composer --version # Should show 2.x.x or higher
mysql --version    # Should show MySQL version
```

### 3️⃣ Automated Setup

Navigate to project directory and run:

```bash
cd path/to/inoic
npm install
```

This will automatically:
- Create `.env` files from templates
- Install all frontend dependencies
- Install all backend dependencies

### 4️⃣ Database Setup

#### Create Database

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p
```
Then in MySQL:
```sql
CREATE DATABASE expense_recorder;
EXIT;
```

**Option B: Using phpMyAdmin**
1. Open phpMyAdmin (usually http://localhost/phpmyadmin)
2. Click "New" in the left sidebar
3. Enter database name: `expense_recorder`
4. Click "Create"

#### Import Database Schema

**Option A: Command Line**
```bash
mysql -u root -p expense_recorder < expense_tracker.sql
```

**Option B: phpMyAdmin**
1. Select `expense_recorder` database
2. Click "Import" tab
3. Choose file: `expense_tracker.sql`
4. Click "Go"

### 5️⃣ Configure Backend

Edit `backend/.env` file:

```env
# Update these with your database credentials
database.default.hostname = localhost
database.default.database = expense_recorder
database.default.username = root
database.default.password = YOUR_MYSQL_PASSWORD
database.default.port = 3306
```

**Important:** If your MySQL password is empty, leave it blank:
```env
database.default.password = 
```

### 6️⃣ Start the Application

#### Option 1: Start Both Servers (Recommended)
```bash
npm start
```

#### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
npm run start:backend
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
```

### 7️⃣ Access the Application

Open your browser:
- **Frontend**: http://localhost:8100
- **Backend API**: http://localhost:8080

---

## 🔧 Manual Setup (If Automated Setup Fails)

### Frontend Setup
```bash
cd frontend
npm install
```

### Backend Setup
```bash
cd backend
composer install
```

### Create Environment Files
```bash
# Backend
cd backend
copy .env.example .env    # Windows
# or
cp .env.example .env      # Mac/Linux

# Frontend (optional)
cd frontend
copy .env.example .env    # Windows
# or
cp .env.example .env      # Mac/Linux
```

---

## 🐛 Common Issues & Solutions

### Issue: "npm install" fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Issue: "composer install" fails

**Solution:**
```bash
# Update composer
composer self-update

# Try installing with platform requirements ignored
composer install --ignore-platform-reqs
```

### Issue: Cannot connect to MySQL

**Solutions:**
1. Verify MySQL is running:
   - Windows: Check Services > MySQL
   - Mac: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

2. Check credentials in `backend/.env`

3. Test connection:
   ```bash
   mysql -u root -p
   ```

### Issue: Port 8080 already in use

**Solution:**
```bash
# Find process using port 8080 (Windows)
netstat -ano | findstr :8080
taskkill /PID <process_id> /F

# Or change backend port in backend/.env
app.baseURL = 'http://localhost:8081/'
```

Then update frontend API URL in `frontend/src/environments/environment.ts`

### Issue: Port 8100 already in use

**Solution:**
```bash
cd frontend
ng serve --port 8101
```

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf vendor composer.lock
composer install
```

### Issue: PHP extensions missing

**Solution:**

Edit `php.ini` file and enable:
```ini
extension=intl
extension=mysqli
extension=mbstring
extension=json
```

Restart your web server after changes.

**Find php.ini location:**
```bash
php --ini
```

---

## 📱 Testing the Setup

### Test Backend API

Open browser or use curl:
```bash
curl http://localhost:8080/api
```

Should return API information.

### Test Frontend

1. Open http://localhost:8100
2. Try registering a new user
3. Login with the user
4. Add an expense
5. Check if data appears

---

## 🎯 Transferring to Another Computer

### Export from Current Computer

1. **Copy entire project folder** to USB/cloud storage
2. **Export database** (optional if using same schema):
   ```bash
   mysqldump -u root -p expense_recorder > backup.sql
   ```

### Import on New Computer

1. **Copy project folder** to new location
2. **Install prerequisites** (Node.js, PHP, Composer, MySQL)
3. **Run setup**:
   ```bash
   npm install
   ```
4. **Create and import database** (follow Step 4 above)
5. **Update `backend/.env`** with new database credentials
6. **Start servers**:
   ```bash
   npm start
   ```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend loads at http://localhost:8100
- [ ] Backend API responds at http://localhost:8080/api
- [ ] Can register new user
- [ ] Can login
- [ ] Can add expense
- [ ] Can view expenses
- [ ] Can update budget
- [ ] No console errors in browser (F12)

---

## 📞 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Check console logs for error messages
4. Ensure database is created and imported
5. Verify database credentials in backend/.env

---

## 🎉 Success!

If everything works, you should see:
- Expense Recorder app running in your browser
- Ability to create account, login, and track expenses
- Data persisting in the database

Happy expense tracking! 💰📊
