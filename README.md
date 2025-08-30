# CMGEM Monorepo

This is a monorepo containing both the frontend and backend applications for the CMGEM project.

## Project Structure

```
cmgem-monorepo/
├── frontend/          # React frontend application
├── backend/           # NestJS backend application
├── package.json       # Root workspace configuration
└── README.md         # This file
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

## Getting Started

### 1. Install Dependencies

Install all dependencies for the entire monorepo:

```bash
npm run install:all
```

Or install from the root directory:

```bash
npm install
```

### 2. Development

Run both frontend and backend concurrently in development mode:

```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on the configured port (check backend configuration)

### 3. Individual Development

Run only the frontend in development mode:

```bash
npm run dev:frontend
```

Run only the backend in development mode:

```bash
npm run dev:backend
```

### 4. Preview

Preview the built frontend application:

```bash
npm run preview
```

**Note**: This only runs the frontend preview and requires the frontend to be built first.

### 5. Building

Build all applications:

```bash
npm run build
```

Build specific applications:

```bash
npm run build:frontend
npm run build:backend
```

### 6. Production

Start the backend in production mode:

```bash
npm run start:prod
```

**Note**: This requires the backend to be built first.

## Available Scripts

### Root Level Scripts

- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:frontend` - Run only frontend in development mode
- `npm run dev:backend` - Run only backend in development mode
- `npm run preview` - Preview the frontend application
- `npm run build` - Build all applications
- `npm run build:frontend` - Build only frontend
- `npm run build:backend` - Build only backend
- `npm run start` - Start backend in development mode
- `npm run start:prod` - Start backend in production mode
- `npm run lint` - Lint all applications
- `npm run test` - Run tests for all applications
- `npm run install:all` - Install dependencies for all workspaces

### Frontend Scripts

- `npm run dev --workspace=frontend` - Start development server
- `npm run build --workspace=frontend` - Build for production
- `npm run preview --workspace=frontend` - Preview production build
- `npm run lint --workspace=frontend` - Lint frontend code

### Backend Scripts

- `npm run dev --workspace=backend` - Start development server with webpack
- `npm run build --workspace=backend` - Build for production
- `npm run start --workspace=backend` - Start in development mode
- `npm run start:prod --workspace=backend` - Start in production mode
- `npm run lint --workspace=backend` - Lint backend code

## Deployment

The frontend and backend are deployed separately to different servers based on where changes are made:

- **Frontend changes**: Deploy to frontend server
- **Backend changes**: Deploy to backend server
- **Shared changes**: Deploy both

### GitLab CI/CD

The repository uses GitLab CI/CD with separate pipelines for frontend and backend. Changes in respective directories will trigger the appropriate deployment pipeline.

## Development Workflow

1. **Clone the repository**
2. **Install dependencies**: `npm run install:all`
3. **Start development**: `npm run dev`
4. **Make changes** in either frontend or backend
5. **Test changes** using the development servers
6. **Build and deploy** using GitLab CI/CD

## Troubleshooting

### Port Conflicts

If you encounter port conflicts:
- Frontend runs on port 3000 by default
- Backend port is configured in the backend configuration
- Check the respective configuration files for port settings

### Dependency Issues

If you encounter dependency issues:
1. Clear node_modules: `npm run clean`
2. Reinstall: `npm run install:all`

### Build Issues

If builds fail:
1. Ensure all dependencies are installed
2. Check for TypeScript/ESLint errors
3. Verify environment variables are set correctly

## Contributing

1. Make changes in the appropriate workspace directory
2. Test your changes using the development scripts
3. Ensure all tests pass
4. Commit and push your changes
5. GitLab CI/CD will automatically deploy based on the changes made

## License

This project is private and proprietary.
