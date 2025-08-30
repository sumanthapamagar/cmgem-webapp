# GitLab CI/CD Pipeline Documentation

## Overview

The CMGEM monorepo uses a **split pipeline architecture** where frontend and backend have completely separate CI/CD pipelines that only trigger when changes are made in their respective directories. **Files outside the `frontend/` and `backend/` directories will NOT trigger any CI pipelines.**

The pipelines deploy to Azure:
- **Frontend**: Azure Static Web App
- **Backend**: Azure Web App on Linux

## Pipeline Architecture

### 1. Main Pipeline Trigger (`.gitlab-ci.yml`)
- **Purpose**: Orchestrates which pipelines to run based on file changes
- **Trigger**: Always runs on every commit/merge request
- **Action**: Determines which specific pipelines to trigger

### 2. Frontend Pipeline (`.gitlab-ci-frontend.yml`)
- **Trigger**: Only when files in `frontend/` directory change
- **Scope**: Frontend-specific operations only
- **Deployment**: Azure Static Web App

### 3. Backend Pipeline (`.gitlab-ci-backend.yml`)
- **Trigger**: Only when files in `backend/` directory change
- **Scope**: Backend-specific operations only
- **Deployment**: Azure Web App on Linux

## File Change Detection

### Frontend Pipeline Triggers
```yaml
changes:
  - frontend/**/*
  - frontend/**/*.{js,jsx,ts,tsx,css,scss,html,json}
  - frontend/**/*.{png,jpg,jpeg,gif,svg,ico}
  - frontend/**/*.{woff,woff2,ttf,eot}
  - frontend/**/*.{md,txt}
```

**Examples of files that trigger frontend pipeline:**
- `frontend/src/components/Button.jsx`
- `frontend/src/styles/main.css`
- `frontend/public/logo.png`
- `frontend/package.json`

### Backend Pipeline Triggers
```yaml
changes:
  - backend/**/*
  - backend/**/*.{ts,js,json,yml,yaml}
  - backend/**/*.{md,txt}
  - backend/**/*.{sql,prisma}
```

**Examples of files that trigger backend pipeline:**
- `backend/src/modules/users/users.service.ts`
- `backend/src/config/database.config.ts`
- `backend/package.json`
- `backend/Dockerfile`

### Files That Do NOT Trigger CI
**Root-level files and configuration files will NOT trigger any CI pipelines:**
- `package.json` (root)
- `.gitlab-ci.yml`
- `docker-compose.yml`
- `README.md`
- `Makefile`
- `env.example`
- `scripts/**/*`
- `cmgem.code-workspace`
- Any other files outside `frontend/` and `backend/` directories

## Pipeline Stages

### Frontend Pipeline Stages
1. **Install**: Install frontend dependencies
2. **Test**: Lint and test frontend code
3. **Build**: Build frontend for production
4. **Deploy**: Deploy to Azure Static Web App

### Backend Pipeline Stages
1. **Install**: Install backend dependencies
2. **Test**: Lint and test backend code
3. **Build**: Build backend and create deployment package
4. **Deploy**: Deploy to Azure Web App on Linux

## Azure Deployment

### Frontend - Azure Static Web App
The frontend is deployed to Azure Static Web App, which provides:
- Global CDN distribution
- Built-in authentication and authorization
- Serverless API support
- Automatic scaling

**Deployment Process:**
1. Build the frontend application
2. Use Azure CLI to deploy to Static Web App
3. Azure automatically handles hosting and CDN

### Backend - Azure Web App on Linux
The backend is deployed to Azure Web App on Linux, which provides:
- Managed Node.js runtime
- Automatic scaling
- Built-in monitoring and logging
- Easy deployment and rollback

**Deployment Process:**
1. Build the backend application
2. Create a deployment package (zip file)
3. Use Azure CLI to deploy to Web App
4. Azure handles runtime and scaling

## Deployment Environments

### Frontend Deployments (Azure Static Web App)
- **Staging**: `https://{app-name}-staging.azurestaticapps.net`
- **Production**: `https://{app-name}-production.azurestaticapps.net`
- **Hotfix**: `https://{app-name}-hotfix.azurestaticapps.net`

### Backend Deployments (Azure Web App)
- **Staging**: `https://{app-name}-staging.azurewebsites.net`
- **Production**: `https://{app-name}-production.azurewebsites.net`
- **Hotfix**: `https://{app-name}-hotfix.azurewebsites.net`

## Required Azure Configuration

### 1. Azure Service Principal
Create a service principal for CI/CD authentication:
```bash
az ad sp create-for-rbac --name "cmgem-cicd" --role contributor
```

### 2. Environment Variables
Set these variables in your GitLab CI/CD settings:

**Azure Authentication:**
- `AZURE_CLIENT_ID`: Service principal client ID
- `AZURE_CLIENT_SECRET`: Service principal client secret
- `AZURE_TENANT_ID`: Azure tenant ID
- `AZURE_LOCATION`: Azure region (e.g., eastus)

**Frontend - Static Web App:**
- `AZURE_STATIC_WEB_APP_NAME_STAGING`: Staging app name
- `AZURE_STATIC_WEB_APP_NAME_PRODUCTION`: Production app name
- `AZURE_STATIC_WEB_APP_NAME_HOTFIX`: Hotfix app name
- `AZURE_RESOURCE_GROUP_STAGING`: Staging resource group
- `AZURE_RESOURCE_GROUP_PRODUCTION`: Production resource group
- `AZURE_RESOURCE_GROUP_HOTFIX`: Hotfix resource group

**Backend - Web App:**
- `AZURE_WEB_APP_NAME_STAGING`: Staging app name
- `AZURE_WEB_APP_NAME_PRODUCTION`: Production app name
- `AZURE_WEB_APP_NAME_HOTFIX`: Hotfix app name
- `AZURE_RESOURCE_GROUP_STAGING`: Staging resource group
- `AZURE_RESOURCE_GROUP_PRODUCTION`: Production resource group
- `AZURE_RESOURCE_GROUP_HOTFIX`: Hotfix resource group

## Pipeline Scenarios

### Scenario 1: Frontend Changes Only
```
Commit: Update frontend component
Files changed: frontend/src/components/Header.jsx

Result:
✅ Frontend Pipeline: RUNS (deploys to Azure Static Web App)
❌ Backend Pipeline: SKIPPED
```

### Scenario 2: Backend Changes Only
```
Commit: Update backend service
Files changed: backend/src/modules/auth/auth.service.ts

Result:
❌ Frontend Pipeline: SKIPPED
✅ Backend Pipeline: RUNS (deploys to Azure Web App)
```

### Scenario 3: Root-Level Changes (No CI Triggered)
```
Commit: Update root package.json
Files changed: package.json

Result:
❌ Frontend Pipeline: SKIPPED
❌ Backend Pipeline: SKIPPED
❌ No CI pipelines run
```

### Scenario 4: Mixed Changes
```
Commit: Update both frontend and backend
Files changed: 
- frontend/src/App.jsx
- backend/src/main.ts

Result:
✅ Frontend Pipeline: RUNS (deploys to Azure Static Web App)
✅ Backend Pipeline: RUNS (deploys to Azure Web App)
```

## Benefits of Split Pipelines

### 1. **Efficiency**
- Only relevant pipelines run
- Faster feedback loops
- Reduced CI/CD resource usage

### 2. **Isolation**
- Frontend and backend changes don't interfere
- Independent deployment cycles
- Easier debugging and rollbacks

### 3. **Scalability**
- Teams can work independently
- Parallel development workflows
- Reduced merge conflicts

### 4. **Cost Optimization**
- Pay only for what you use
- Reduced build minutes
- Better resource allocation

### 5. **Clean Separation**
- Configuration changes don't trigger unnecessary builds
- Infrastructure changes don't affect application CI
- Clear boundaries between application and project setup

### 6. **Azure Integration**
- Native Azure deployment
- Automatic scaling and management
- Built-in monitoring and logging

## Configuration Customization

### Update Azure Resource Names
Edit the respective CI files and update the Azure resource names:

```yaml
variables:
  AZURE_STATIC_WEB_APP_NAME: your-actual-app-name
  AZURE_RESOURCE_GROUP: your-actual-resource-group
```

### Customize Azure Deployment Commands
The current deployment uses Azure CLI commands. You can customize these:

```yaml
script:
  - echo "Deploying to Azure..."
  - az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
  - az staticwebapp create --name $AZURE_STATIC_WEB_APP_NAME --resource-group $AZURE_RESOURCE_GROUP --source frontend/dist/ --location $AZURE_LOCATION
```

## Troubleshooting

### Pipeline Not Running
1. **Check file paths**: Ensure changes are in the correct directories (`frontend/` or `backend/`)
2. **Verify rules**: Check the `rules` section in the main CI file
3. **Branch protection**: Ensure your branch allows pipeline execution

### Pipeline Running Unexpectedly
1. **File patterns**: Review the `changes` patterns in pipeline triggers
2. **Wildcards**: Check if `**/*` patterns are too broad
3. **File extensions**: Verify file extension patterns match your files

### No CI Triggered for Root Changes
**This is expected behavior!** Root-level changes (like updating `package.json`, `.gitlab-ci.yml`, etc.) will not trigger CI pipelines. This is by design to:
- Avoid unnecessary builds for configuration changes
- Keep CI focused on application code changes
- Reduce CI/CD resource usage

### Azure Deployment Failures
1. **Service Principal**: Verify Azure service principal has correct permissions
2. **Resource Groups**: Ensure resource groups exist and are accessible
3. **App Names**: Verify app names are unique and follow Azure naming conventions
4. **Environment Variables**: Check all required Azure variables are set in GitLab

### Common Azure Issues
1. **Authentication**: Service principal may have expired or insufficient permissions
2. **Resource Limits**: Azure subscription may have reached resource limits
3. **Naming Conflicts**: App names may already exist in Azure
4. **Region Issues**: Resources may not be available in specified region

## Best Practices

### 1. **File Organization**
- Keep frontend and backend code in separate directories
- Avoid mixing concerns in shared files
- Use clear naming conventions

### 2. **Commit Strategy**
- Make focused commits (frontend OR backend, not both)
- Use conventional commit messages
- Separate infrastructure changes from code changes

### 3. **Pipeline Maintenance**
- Regularly review and update file patterns
- Monitor pipeline performance
- Optimize build and test steps

### 4. **Azure Deployment Strategy**
- Use staging environments for testing
- Implement rollback procedures
- Monitor deployment health
- Set up proper resource group organization

### 5. **Configuration Changes**
- Test CI configuration changes locally before committing
- Use feature branches for CI configuration updates
- Document any changes to CI behavior

### 6. **Azure Security**
- Use service principals with minimal required permissions
- Regularly rotate service principal secrets
- Monitor Azure resource access and usage

## Support

For questions or issues with the CI/CD pipelines:
1. Check the pipeline logs in GitLab
2. Review the pipeline configuration files
3. Consult the GitLab CI/CD documentation
4. Check Azure portal for deployment status
5. Review Azure CLI documentation
6. Contact your DevOps team
