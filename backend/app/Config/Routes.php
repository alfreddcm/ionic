<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// API Routes
$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    // Basic API info
    $routes->get('/', 'Api::index');
    
    // Database setup route
    $routes->get('setup', 'SetupController::createDatabase');
    $routes->post('setup/database', 'SetupController::createDatabase');
    $routes->get('setup/migrate', 'SetupController::runMigrations');
    $routes->get('setup/status', 'SetupController::migrationStatus');
    $routes->get('setup/rollback', 'SetupController::rollback');
    
    // Database test routes
    $routes->get('db-test', 'DatabaseTest::index');
    $routes->post('db-create', 'DatabaseTest::createDatabase');
    $routes->get('db-test-user', 'DatabaseTest::testUser');
    $routes->delete('db-clear', 'DatabaseTest::clearTestData');
    
    // Migration routes
    $routes->get('migrate', 'MigrationTest::migrate');
    $routes->get('migrate/status', 'MigrationTest::status');
    $routes->get('migrate/rollback', 'MigrationTest::rollback');
    
    // Legacy user routes (keeping for backward compatibility)
    $routes->get('users', 'Api::users');
    $routes->get('users/(:num)', 'Api::users/$1');
    $routes->post('users', 'Api::createUser');
    $routes->put('users/(:num)', 'Api::updateUser/$1');
    $routes->delete('users/(:num)', 'Api::deleteUser/$1');
    
    // Authentication routes
    $routes->post('auth/register', 'AuthController::register');
    $routes->post('auth/login', 'AuthController::login');
    $routes->post('auth/logout', 'AuthController::logout');
    $routes->get('auth/profile', 'AuthController::profile');
    $routes->put('auth/profile', 'AuthController::updateProfile');
    
    // User profile routes
    $routes->get('users/(:num)', 'UserController::show/$1');
    $routes->put('users/(:num)', 'UserController::update/$1');
    $routes->post('users/(:num)/change-password', 'UserController::changePassword/$1');
    
    // Debug routes (remove in production)
    $routes->get('debug/test', 'DebugController::test');
    $routes->post('debug/test', 'DebugController::test');
    $routes->post('debug/login-test', 'DebugController::loginTest');
    $routes->get('debug/logs', 'LogController::viewErrors');
    $routes->post('debug/request', 'TestController::requestDebug');
    
    // Expense routes
    $routes->get('expenses', 'ExpenseController::index');
    $routes->post('expenses', 'ExpenseController::create');
    $routes->get('expenses/(:num)', 'ExpenseController::show/$1');
    $routes->put('expenses/(:num)', 'ExpenseController::update/$1');
    $routes->delete('expenses/(:num)', 'ExpenseController::delete/$1');
    $routes->get('expenses/today', 'ExpenseController::getTodayExpenses');
    $routes->get('expenses/monthly', 'ExpenseController::getMonthlyExpenses');
    $routes->get('expenses/summary', 'ExpenseController::getSummary');
    
    // Budget routes
    $routes->get('budgets', 'BudgetController::index');
    $routes->post('budgets', 'BudgetController::create');
    $routes->put('budgets/(:num)', 'BudgetController::update/$1');
    $routes->post('budgets/update-spent', 'BudgetController::updateSpent');
    
    // Category routes
    $routes->get('categories', 'CategoryController::index');
    $routes->post('categories', 'CategoryController::create');
    $routes->get('categories/(:num)', 'CategoryController::show/$1');
    $routes->put('categories/(:num)', 'CategoryController::update/$1');
    $routes->delete('categories/(:num)', 'CategoryController::delete/$1');
    
    // Wallet routes
    $routes->get('wallets', 'WalletController::index');
    $routes->post('wallets', 'WalletController::create');
    $routes->get('wallets/(:num)', 'WalletController::show/$1');
    $routes->put('wallets/(:num)', 'WalletController::update/$1');
    $routes->delete('wallets/(:num)', 'WalletController::delete/$1');
    $routes->get('wallets/enabled', 'WalletController::enabled');
    
    // Transaction routes
    $routes->get('transactions', 'TransactionController::index');
    $routes->post('transactions', 'TransactionController::create');
    $routes->get('transactions/(:num)', 'TransactionController::show/$1');
    $routes->put('transactions/(:num)', 'TransactionController::update/$1');
    $routes->delete('transactions/(:num)', 'TransactionController::delete/$1');
    $routes->get('transactions/today', 'TransactionController::today');
    $routes->get('transactions/date-range', 'TransactionController::dateRange');
    
    // User Settings routes
    $routes->get('user-settings', 'UserSettingsController::index');
    $routes->post('user-settings', 'UserSettingsController::create');
    $routes->put('user-settings/(:num)', 'UserSettingsController::update/$1');
    $routes->post('user-settings/daily-budget', 'UserSettingsController::dailyBudget');
});
