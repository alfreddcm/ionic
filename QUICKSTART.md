# ⚡ QUICK START GUIDE

## For First Time Setup

```bash
# 1. Navigate to project directory
cd path\to\inoic

# 2. Run automated setup
npm install

# 3. Create database and import schema
# Option A: Using MySQL command line
mysql -u root -p
> CREATE DATABASE expense_recorder;
> EXIT;
mysql -u root -p expense_recorder < expense_tracker.sql

# Option B: On Windows, use phpMyAdmin or MySQL Workbench

# 4. Configure database in backend\.env
# Edit backend\.env and update:
#   database.default.username = your_username
#   database.default.password = your_password

# 5. Start the application
npm start
```

Open browser: http://localhost:8100

---

## For Transferring to New Computer

```bash
# 1. Copy entire project folder to new computer

# 2. Install prerequisites (if not already installed)
#    - Node.js: https://nodejs.org/
#    - PHP: https://www.php.net/downloads
#    - Composer: https://getcomposer.org/
#    - MySQL: https://www.mysql.com/downloads/

# 3. Navigate to project
cd path\to\inoic

# 4. Run setup (automatically installs all dependencies)
npm install

# 5. Create database (if doesn't exist on new machine)
# Use phpMyAdmin, MySQL Workbench, or command line:
mysql -u root -p
> CREATE DATABASE expense_recorder;
> EXIT;
mysql -u root -p expense_recorder < expense_tracker.sql

# 6. Update database credentials in backend\.env

# 7. Start application
npm start
```

---

## Verify Setup is Working

```bash
# Check configuration
npm run validate

# Should show:
# ✅ Configuration looks good!
```

---

## Daily Development

```bash
# Start both servers
npm start

# Or start individually:
npm run start:backend    # Backend only
npm run start:frontend   # Frontend only
```

---

## Troubleshooting

**Problem:** npm install fails
```bash
npm cache clean --force
npm install
```

**Problem:** Cannot connect to backend
```bash
# Check backend is running
npm run start:backend

# Check database credentials in backend/.env
```

**Problem:** Port already in use
```bash
# Windows - Kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <process_id> /F
```

**Problem:** Database connection failed
```bash
# Verify MySQL is running
# Check credentials in backend/.env
# Ensure database exists
mysql -u root -p -e "SHOW DATABASES;"
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm install` | Complete setup (first time) |
| `npm start` | Start both servers |
| `npm run start:frontend` | Start frontend only |
| `npm run start:backend` | Start backend only |
| `npm run validate` | Check configuration |
| `npm run build:frontend` | Build for production |

---

## Access Points

- **Frontend App:** http://localhost:8100
- **Backend API:** http://localhost:8080
- **API Test:** http://localhost:8080/api

---

## ✅ Success Checklist

- [ ] Prerequisites installed
- [ ] `npm install` completed successfully
- [ ] Database created and imported
- [ ] backend/.env configured
- [ ] `npm run validate` shows no errors
- [ ] `npm start` runs without errors
- [ ] Frontend loads at http://localhost:8100
- [ ] Can register and login

---

**Need detailed help?** See `SETUP.md`

**For full documentation:** See `README.md`
