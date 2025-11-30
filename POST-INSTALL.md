# 📋 Post-Installation Configuration

## ⚠️ IMPORTANT: Complete These Steps Before Running

### 1. Database Setup

Create the database:
```bash
mysql -u root -p
```

In MySQL prompt:
```sql
CREATE DATABASE expense_recorder;
EXIT;
```

Import the schema:
```bash
mysql -u root -p expense_recorder < expense_tracker.sql
```

### 2. Backend Configuration

Edit `backend/.env` and update these lines:

```env
database.default.hostname = localhost
database.default.database = expense_recorder
database.default.username = root
database.default.password = YOUR_MYSQL_PASSWORD
```

**Note:** If your MySQL password is empty, leave it blank:
```env
database.default.password = 
```

### 3. Verify Configuration

Run the validation script:
```bash
npm run validate
```

### 4. Start Application

```bash
npm start
```

### 5. Access Application

- Frontend: http://localhost:8100
- Backend API: http://localhost:8080

---

## ✅ Configuration Complete!

You're all set! The application should now work seamlessly.

---

## 🔄 Transferring to Another Computer?

Just copy the entire project folder and run:
```bash
npm install
```

Then complete steps 1-5 above.

The project is fully portable - no additional configuration needed!
