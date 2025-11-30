const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Expense Recorder project...\n');

// Colors for terminal output
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

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function copyEnvFile(examplePath, envPath, name) {
  if (!fileExists(envPath)) {
    if (fileExists(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log(`✓ Created ${name} .env file`, 'green');
    } else {
      log(`✗ ${name} .env.example not found`, 'red');
    }
  } else {
    log(`ℹ ${name} .env file already exists`, 'yellow');
  }
}

// Step 1: Create .env files from examples
log('📝 Step 1: Setting up environment files...', 'blue');
copyEnvFile(
  path.join(__dirname, '../backend/.env.example'),
  path.join(__dirname, '../backend/.env'),
  'Backend'
);
copyEnvFile(
  path.join(__dirname, '../frontend/.env.example'),
  path.join(__dirname, '../frontend/.env'),
  'Frontend'
);

// Step 2: Install frontend dependencies
log('\n📦 Step 2: Installing frontend dependencies...', 'blue');
try {
  const frontendPath = path.join(__dirname, '../frontend');
  log('Installing npm packages for frontend...', 'yellow');
  execSync('npm install', { cwd: frontendPath, stdio: 'inherit' });
  log('✓ Frontend dependencies installed', 'green');
} catch (error) {
  log('✗ Failed to install frontend dependencies', 'red');
  log('Please run: npm run install:frontend', 'yellow');
}

// Step 3: Install backend dependencies
log('\n📦 Step 3: Installing backend dependencies...', 'blue');
try {
  const backendPath = path.join(__dirname, '../backend');
  
  // Check if composer is installed
  try {
    execSync('composer --version', { stdio: 'ignore' });
    log('Installing Composer packages for backend...', 'yellow');
    execSync('composer install', { cwd: backendPath, stdio: 'inherit' });
    log('✓ Backend dependencies installed', 'green');
  } catch (composerError) {
    log('⚠ Composer not found. Skipping backend dependencies.', 'yellow');
    log('Please install Composer from https://getcomposer.org/', 'yellow');
    log('Then run: npm run install:backend', 'yellow');
  }
} catch (error) {
  log('✗ Failed to install backend dependencies', 'red');
}

// Step 4: Display next steps
log('\n✅ Setup complete!', 'green');
log('\n' + '='.repeat(60), 'blue');
log('⚠️  IMPORTANT: Complete these steps before running:', 'yellow');
log('='.repeat(60), 'blue');
log('\n1️⃣  Create database and import schema:', 'blue');
log('   mysql -u root -p -e "CREATE DATABASE expense_recorder;"', 'yellow');
log('   mysql -u root -p expense_recorder < expense_tracker.sql', 'yellow');
log('\n2️⃣  Configure database in backend/.env:', 'blue');
log('   - Update database username', 'yellow');
log('   - Update database password', 'yellow');
log('\n3️⃣  Verify configuration:', 'blue');
log('   npm run validate', 'yellow');
log('\n4️⃣  Start the application:', 'blue');
log('   npm start', 'green');
log('\n5️⃣  Access the app:', 'blue');
log('   Frontend: http://localhost:8100', 'yellow');
log('   Backend:  http://localhost:8080', 'yellow');
log('\n' + '='.repeat(60), 'blue');
log('\n📖 For detailed instructions, see:', 'blue');
log('   - QUICKSTART.md (quick reference)', 'yellow');
log('   - POST-INSTALL.md (next steps)', 'yellow');
log('   - SETUP.md (detailed guide)', 'yellow');
log('   - README.md (full documentation)', 'yellow');
log('\n🎉 Happy coding!', 'green');
