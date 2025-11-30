const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Expense Recorder Configuration...\n');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let hasErrors = false;
let hasWarnings = false;

// Check Node.js version
log('Checking Node.js version...', 'blue');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 16) {
  log(`✓ Node.js ${nodeVersion} - OK`, 'green');
} else {
  log(`✗ Node.js ${nodeVersion} - Version 16+ required`, 'red');
  hasErrors = true;
}

// Check for required files
log('\nChecking project structure...', 'blue');
const requiredFiles = [
  'package.json',
  'frontend/package.json',
  'backend/composer.json',
  'expense_tracker.sql',
  'README.md',
  'scripts/setup.js',
  'backend/.env.example',
  'frontend/.env.example'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    log(`✓ ${file}`, 'green');
  } else {
    log(`✗ ${file} - MISSING`, 'red');
    hasErrors = true;
  }
});

// Check environment files
log('\nChecking environment configuration...', 'blue');

const backendEnv = path.join(__dirname, '../backend/.env');
if (fs.existsSync(backendEnv)) {
  log('✓ Backend .env exists', 'green');
  
  // Read and check database configuration
  const envContent = fs.readFileSync(backendEnv, 'utf8');
  if (envContent.includes('database.default.database = expense_recorder')) {
    log('  ✓ Database name configured', 'green');
  } else {
    log('  ⚠ Database name not configured properly', 'yellow');
    hasWarnings = true;
  }
  
  if (envContent.includes('database.default.username')) {
    log('  ✓ Database username configured', 'green');
  } else {
    log('  ⚠ Database username not configured', 'yellow');
    hasWarnings = true;
  }
} else {
  log('⚠ Backend .env not found - Run npm install to create it', 'yellow');
  hasWarnings = true;
}

const frontendEnv = path.join(__dirname, '../frontend/.env');
if (fs.existsSync(frontendEnv)) {
  log('✓ Frontend .env exists', 'green');
} else {
  log('⚠ Frontend .env not found (optional)', 'yellow');
}

// Check for node_modules
log('\nChecking dependencies...', 'blue');

const frontendNodeModules = path.join(__dirname, '../frontend/node_modules');
if (fs.existsSync(frontendNodeModules)) {
  log('✓ Frontend dependencies installed', 'green');
} else {
  log('⚠ Frontend dependencies not installed - Run: npm run install:frontend', 'yellow');
  hasWarnings = true;
}

const backendVendor = path.join(__dirname, '../backend/vendor');
if (fs.existsSync(backendVendor)) {
  log('✓ Backend dependencies installed', 'green');
} else {
  log('⚠ Backend dependencies not installed - Run: npm run install:backend', 'yellow');
  hasWarnings = true;
}

// Check environment configuration
log('\nChecking environment settings...', 'blue');

const envTsPath = path.join(__dirname, '../frontend/src/environments/environment.ts');
if (fs.existsSync(envTsPath)) {
  const envContent = fs.readFileSync(envTsPath, 'utf8');
  if (envContent.includes('apiUrl')) {
    log('✓ API URL configured in environment', 'green');
  } else {
    log('✗ API URL not configured in environment.ts', 'red');
    hasErrors = true;
  }
}

const apiServicePath = path.join(__dirname, '../frontend/src/app/services/api.service.ts');
if (fs.existsSync(apiServicePath)) {
  const serviceContent = fs.readFileSync(apiServicePath, 'utf8');
  if (serviceContent.includes("import { environment }")) {
    log('✓ API service using environment configuration', 'green');
  } else {
    log('⚠ API service may have hardcoded URL', 'yellow');
    hasWarnings = true;
  }
}

// Summary
log('\n' + '='.repeat(50), 'blue');
if (hasErrors) {
  log('❌ Configuration has ERRORS - Please fix them before running', 'red');
  process.exit(1);
} else if (hasWarnings) {
  log('⚠️  Configuration has warnings - Application may not work properly', 'yellow');
  log('\nRecommended actions:', 'blue');
  log('1. Ensure database is created and imported', 'yellow');
  log('2. Update backend/.env with your database credentials', 'yellow');
  log('3. Run: npm run install:all (if dependencies missing)', 'yellow');
} else {
  log('✅ Configuration looks good!', 'green');
  log('\nYou can now start the application:', 'blue');
  log('  npm start', 'green');
}
log('='.repeat(50), 'blue');
