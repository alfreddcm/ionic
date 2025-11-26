# Ionic + CodeIgniter Full-Stack Development Environment

This project combines Ionic Framework (Angular) for the mobile frontend with CodeIgniter 4 for the backend API, creating a complete full-stack development environment.

## Project Structure

```
├── frontend/          # Ionic Angular mobile app
│   ├── src/
│   │   ├── app/
│   │   │   ├── home/           # Home page with API demo
│   │   │   ├── services/       # API service for backend communication
│   │   │   └── ...
│   │   └── ...
│   ├── package.json
│   └── ionic.config.json
├── backend/           # CodeIgniter 4 PHP API
│   ├── app/
│   │   ├── Controllers/        # API controllers
│   │   ├── Config/            # Configuration files
│   │   └── ...
│   ├── composer.json
│   └── spark
├── .vscode/
│   └── tasks.json             # VS Code tasks for development
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) and npm
- **PHP** (v7.4 or higher)
- **Composer** (PHP package manager)
- **Ionic CLI**: `npm install -g @ionic/cli`

## Quick Start

### 1. Install Dependencies

**Frontend (Ionic):**
```bash
cd frontend
npm install
```

**Backend (CodeIgniter):**
```bash
cd backend
composer install --ignore-platform-req=ext-intl
```

### 2. Start Development Servers

**Option A: Using VS Code Tasks (Recommended)**
1. Open the project in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Tasks: Run Task"
4. Select "Start Both Servers"

**Option B: Manual Start**

**Backend (CodeIgniter) - Terminal 1:**
```bash
cd backend
php -S localhost:8080 -t public
```
*Note: If `php spark serve` fails due to path issues, use the PHP built-in server instead.*

**Frontend (Ionic) - Terminal 2:**
```bash
cd frontend
ionic serve
```
*Note: If you encounter webpack path errors, see the Troubleshooting section below.*

### 3. Access the Applications

- **Ionic App**: http://localhost:8100
- **CodeIgniter API**: http://localhost:8080

## API Endpoints

The CodeIgniter backend provides the following REST API endpoints:

- `GET /api` - API information and available endpoints
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update specific user
- `DELETE /api/users/{id}` - Delete specific user

## Development Features

### Frontend (Ionic)
- Angular framework with TypeScript
- Ionic UI components
- HTTP client service for API communication
- CORS handling for development
- Mobile-responsive design

### Backend (CodeIgniter)
- RESTful API structure
- CORS middleware for cross-origin requests
- JSON response formatting
- Modular controller architecture

### VS Code Integration
- Ionic snippets and Angular language service
- PHP intellisense for CodeIgniter
- Predefined tasks for development workflow
- Extensions for enhanced development experience

## VS Code Tasks Available

- **Start Both Servers**: Runs both Ionic and CodeIgniter servers simultaneously
- **Start Ionic Dev Server**: Runs only the Ionic development server
- **Start CodeIgniter Server**: Runs only the CodeIgniter server
- **Build Ionic for Production**: Creates production build of Ionic app
- **Install Frontend Dependencies**: Installs npm packages for Ionic
- **Install Backend Dependencies**: Installs Composer packages for CodeIgniter

## Configuration

### Environment Variables

Create a `.env` file in the backend directory for CodeIgniter configuration:

```env
CI_ENVIRONMENT = development

app.baseURL = 'http://localhost:8080'

database.default.hostname = localhost
database.default.database = your_database_name
database.default.username = your_username
database.default.password = your_password
database.default.DBDriver = MySQLi
```

### CORS Configuration

CORS is already configured in the API controller to allow cross-origin requests from the Ionic development server.

## Building for Production

### Ionic (Mobile App)
```bash
cd frontend
ionic build --prod
```

For mobile deployment:
```bash
ionic capacitor add ios
ionic capacitor add android
ionic capacitor run ios
ionic capacitor run android
```

### CodeIgniter (API)
For production deployment, ensure:
1. Configure your web server (Apache/Nginx)
2. Set `CI_ENVIRONMENT = production` in `.env`
3. Configure proper database connections
4. Set appropriate CORS origins for your domain

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the CodeIgniter server is running on port 8080
2. **API Connection Failed**: Verify both servers are running and ports are correct
3. **Module Not Found**: Run `npm install` or `composer install` to install dependencies
4. **PHP intl Extension Missing**: Enable `extension=intl` in your `php.ini` file
5. **Path Issues with Special Characters**: If your username contains special characters (like `!`), you may encounter webpack configuration errors

### Port Conflicts

If default ports are in use:
- Change Ionic port: `ionic serve --port 8101`
- Change CodeIgniter port: `php -S localhost:8081 -t public` (from backend directory)
- Update API service baseUrl in `frontend/src/app/services/api.service.ts`

### Path Issues with Special Characters

If your Windows username contains special characters (like `!`, `@`, etc.), you may encounter issues:

**For CodeIgniter:**
- Use `php -S localhost:8080 -t public` instead of `php spark serve`

**For Ionic:**
- Try running from a directory without special characters
- Or use a different terminal/command prompt
- Consider creating a symbolic link to your project in a path without special characters

## Next Steps

1. **Database Integration**: Add database models and migrations to CodeIgniter
2. **Authentication**: Implement JWT or session-based authentication
3. **Mobile Features**: Add Capacitor plugins for device features
4. **Testing**: Add unit and integration tests
5. **Deployment**: Set up CI/CD pipelines for production deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).