# Legalink360 AI Office Add-in: Developer Guide

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Development

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Prerequisites](#2-prerequisites)
3. [Project Setup](#3-project-setup)
4. [Development Environment](#4-development-environment)
5. [Project Structure](#5-project-structure)
6. [Building and Running](#6-building-and-running)
7. [Testing the Add-in](#7-testing-the-add-in)
8. [Development Workflow](#8-development-workflow)
9. [Key Concepts](#9-key-concepts)
10. [Common Tasks](#10-common-tasks)
11. [Troubleshooting](#11-troubleshooting)
12. [Resources](#12-resources)

---

## 1. Quick Start

Get up and running in 5 minutes:

```bash
# 1. Navigate to office-addin directory
cd office-addin

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Configure environment variables (see Setup section)
# Edit .env with your Azure AD credentials

# 5. Start development server
npm run start

# 6. Sideload manifest in Office Online
# Go to Word Online → Insert → Add-ins → My Add-ins → Upload My Add-in
# Select office-addin/manifest.xml
```

---

## 2. Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0.0 or higher (comes with Node.js)
- **Git** for version control
- **Microsoft 365 account** (for testing)
  - Personal Microsoft account, or
  - Microsoft 365 Developer tenant ([Get one free](https://developer.microsoft.com/microsoft-365/dev-program))
- **Azure account** (for Azure AD app registration)
  - Free tier is sufficient
- **Code editor** (Visual Studio Code recommended)
- **Modern web browser** (Chrome, Edge, Firefox, or Safari)

---

## 3. Project Setup

### 3.1 Clone the Repository

```bash
git clone <repository-url>
cd legalink360-ai
```

### 3.2 Install Dependencies

```bash
# Install Office Add-in dependencies
cd office-addin
npm install

# Install backend dependencies (if working on backend)
cd ..
npm install
```

### 3.3 Azure AD App Registration

You need to register an Azure AD application to enable authentication:

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to Azure Active Directory** → **App registrations**
3. **Click "New registration"**
4. **Configure**:
   - **Name**: Legalink360 Office Add-in
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: 
     - Type: Single-page application (SPA)
     - URI: `http://localhost:3000/taskpane.html` (for development)
5. **Click "Register"**
6. **Note down**:
   - **Application (client) ID**
   - **Directory (tenant) ID**
7. **Configure API permissions**:
   - Go to **API permissions**
   - Click **Add a permission**
   - Select **Microsoft Graph** → **Delegated permissions**
   - Add: `User.Read`, `openid`, `profile`, `email`
   - Click **Add permissions**
   - Click **Grant admin consent** (if you're an admin)

### 3.4 Environment Configuration

Create `.env` file in `office-addin/` directory:

```bash
# Azure AD Configuration
AZURE_CLIENT_ID=your-client-id-here
AZURE_TENANT_ID=your-tenant-id-here

# API Configuration
API_BASE_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

**For production**, create `.env.production`:

```bash
AZURE_CLIENT_ID=your-production-client-id
AZURE_TENANT_ID=your-tenant-id
API_BASE_URL=https://api.legalink360ai.com
NODE_ENV=production
```

### 3.5 Backend API Setup

If you're also working on the backend API:

1. Ensure the main Next.js application is set up (see main README)
2. The backend API should be running on `http://localhost:3000`
3. Backend environment variables should be configured (see backend documentation)

---

## 4. Development Environment

### 4.1 Recommended VS Code Extensions

Install these VS Code extensions for better development experience:

- **Office Add-in Developer Tools** (Microsoft)
- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** (Microsoft)
- **Prettier** (optional, for code formatting)

### 4.2 Development Server

The development server runs on `http://localhost:3000` (configurable).

**Start development server**:
```bash
npm run start
```

This will:
- Start webpack dev server
- Enable hot module replacement (HMR)
- Watch for file changes
- Serve the Add-in at `http://localhost:3000/taskpane.html`

**Port Configuration**: Edit `webpack.config.js` to change the port if needed.

### 4.3 Office Online Setup (Recommended for Development)

Office Online is the easiest way to test Add-ins during development:

1. **Go to** https://office.com or https://outlook.office.com
2. **Sign in** with your Microsoft account
3. **Open Word Online** or **Outlook Online**
4. **Sideload the Add-in**:
   - Click **Insert** → **Add-ins** (Word) or **Get Add-ins** (Outlook)
   - Click **My Add-ins** → **Upload My Add-in**
   - Select `manifest.xml` from the `office-addin/` directory
   - The Add-in should appear in your Add-ins list

**Note**: You may need to refresh the page after making changes to the manifest.

---

## 5. Project Structure

```
office-addin/
├── manifest.xml                 # Office Add-in manifest (configuration)
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── webpack.config.js           # Webpack build configuration
├── .env                        # Environment variables (create this)
├── .env.example                # Environment variables template
├── src/
│   ├── taskpane/              # Task pane application
│   │   ├── taskpane.html      # HTML entry point
│   │   ├── taskpane.tsx       # TypeScript entry point
│   │   ├── App.tsx            # Main React component
│   │   ├── index.css          # Styles
│   │   └── components/        # React components
│   │       ├── DocumentAnalysis.tsx
│   │       ├── LegalQuestion.tsx
│   │       ├── ResultsView.tsx
│   │       ├── AuthProvider.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorDisplay.tsx
│   ├── commands/              # Office Add-in commands (if needed)
│   │   └── commands.ts
│   ├── lib/                   # Utility libraries
│   │   ├── office-utils.ts    # Office.js utilities
│   │   ├── api-client.ts      # API client functions
│   │   └── auth.ts            # Authentication utilities
│   └── types/                 # TypeScript type definitions
│       └── index.ts
└── assets/                    # Static assets
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-80.png
    └── logo.png
```

### Key Files Explained

- **manifest.xml**: Defines the Add-in's capabilities, permissions, and configuration. Must be updated when adding features or changing URLs.
- **taskpane.html**: HTML entry point that loads the React application.
- **taskpane.tsx**: Initializes Office.js and renders the React app.
- **App.tsx**: Main React component that manages routing and state.
- **lib/office-utils.ts**: Helper functions for interacting with Office.js APIs.
- **lib/api-client.ts**: Functions for making API calls to the backend.
- **lib/auth.ts**: Authentication logic using MSAL.js.

---

## 6. Building and Running

### 6.1 Development Mode

```bash
npm run start
```

Runs the development server with hot reloading. The Add-in will be available at `http://localhost:3000/taskpane.html`.

### 6.2 Production Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory. Use this for deployment.

### 6.3 Linting

```bash
npm run lint
```

Runs ESLint to check for code quality issues.

### 6.4 Type Checking

```bash
npm run type-check
```

Runs TypeScript compiler to check for type errors without building.

---

## 7. Testing the Add-in

### 7.1 Sideloading in Office Online

**Word Online**:
1. Go to https://office.com and open Word
2. Click **Insert** → **Add-ins**
3. Click **My Add-ins** → **Upload My Add-in**
4. Select `manifest.xml`
5. The Add-in appears in the ribbon

**Outlook Online**:
1. Go to https://outlook.office.com
2. Click **Get Add-ins** (top right)
3. Click **My Add-ins** → **Upload My Add-in**
4. Select `manifest.xml`
5. The Add-in appears in the message compose window

### 7.2 Testing in Office Desktop (Windows/Mac)

**Method 1: Network Share** (Windows):
1. Place `manifest.xml` on a network share (e.g., `\\server\share\manifest.xml`)
2. In Word/Outlook: **File** → **Options** → **Trust Center** → **Trust Center Settings** → **Trusted Add-in Catalogs**
3. Add the network share path
4. Go to **Insert** → **Add-ins** → **My Add-ins** → **SHARED FOLDER**
5. Select the Add-in

**Method 2: Local Path** (Development):
1. Use `npm run start` to serve the Add-in locally
2. Update manifest SourceLocation to `http://localhost:3000/taskpane.html`
3. Sideload using Office dev tools or registry settings

### 7.3 Debugging

**Browser DevTools** (Office Online):
- Press **F12** to open DevTools
- Use Console tab for JavaScript errors
- Use Network tab to monitor API calls
- Use Application tab to inspect storage and cookies

**Visual Studio Code Debugging**:
1. Install "Debugger for Chrome" extension
2. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Office Add-in",
      "type": "chrome",
      "request": "launch",
      "url": "https://office.com/launch/word",
      "webRoot": "${workspaceFolder}/office-addin"
    }
  ]
}
```

**Console Logging**:
- Use `console.log()`, `console.error()`, etc.
- Logs appear in browser DevTools console
- Use appropriate log levels for production code

### 7.4 Testing Checklist

- [ ] Add-in loads without errors
- [ ] Authentication flow works
- [ ] Document analysis feature works
- [ ] Legal question feature works
- [ ] Error handling works correctly
- [ ] UI is responsive and functional
- [ ] Works in Word Online
- [ ] Works in Outlook Online
- [ ] Works in Word Desktop (Windows/Mac)
- [ ] Works in Outlook Desktop (Windows/Mac)

---

## 8. Development Workflow

### 8.1 Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Edit source files in `src/`
   - The dev server will hot-reload changes automatically
   - Test in Office Online or Desktop

3. **Test your changes**:
   - Test in Office Online (easiest)
   - Test authentication flow
   - Test all affected features
   - Check for console errors

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push and create pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### 8.2 Code Style Guidelines

- **TypeScript**: Use TypeScript for all code. Avoid `any` type.
- **React**: Use functional components and hooks. Follow React best practices.
- **Naming**: Use descriptive names. Use PascalCase for components, camelCase for functions.
- **Formatting**: Use consistent indentation (2 spaces). Use Prettier if configured.
- **Comments**: Add comments for complex logic. Use JSDoc for public functions.

### 8.3 File Organization

- **Components**: One component per file. Co-locate related components.
- **Utilities**: Keep utility functions in `lib/`. Group related utilities.
- **Types**: Define types in `types/index.ts` or co-locate with components.
- **Styles**: Use CSS modules or styled-components. Keep styles organized.

---

## 9. Key Concepts

### 9.1 Office.js APIs

Office.js provides APIs to interact with Office applications:

```typescript
// Initialize Office.js
Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    // Word-specific code
  }
});

// Read document content
Word.run(async (context) => {
  const body = context.document.body;
  context.load(body, 'text');
  await context.sync();
  console.log(body.text);
});

// Read selected text
const selection = Office.context.document.getSelectedDataAsync(
  Office.CoercionType.Text,
  (result) => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      console.log(result.value);
    }
  }
);
```

### 9.2 Authentication Flow

The Add-in uses MSAL.js for Azure AD authentication:

1. **Initialize MSAL**:
```typescript
import { PublicClientApplication } from '@azure/msal-browser';

const msalInstance = new PublicClientApplication(config);
await msalInstance.initialize();
```

2. **Login**:
```typescript
const loginResponse = await msalInstance.loginPopup({
  scopes: ['User.Read']
});
```

3. **Get Token**:
```typescript
const tokenResponse = await msalInstance.acquireTokenSilent({
  scopes: ['User.Read'],
  account: msalInstance.getActiveAccount()
});
```

4. **Use Token in API Calls**:
```typescript
const response = await fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${tokenResponse.accessToken}`
  }
});
```

### 9.3 API Integration

The Add-in communicates with the backend API:

```typescript
// Example: Document analysis
const response = await fetch(`${API_BASE_URL}/office/document-analysis`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    document_content: documentText,
    analysis_type: 'full'
  })
});

const result = await response.json();
```

### 9.4 Error Handling

Always handle errors appropriately:

```typescript
try {
  const result = await someAsyncOperation();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly error message
  setError('Something went wrong. Please try again.');
}
```

---

## 10. Common Tasks

### 10.1 Adding a New Component

1. Create component file in `src/taskpane/components/`:
```typescript
// MyNewComponent.tsx
import React from 'react';

export const MyNewComponent: React.FC = () => {
  return <div>My New Component</div>;
};
```

2. Import and use in `App.tsx` or parent component:
```typescript
import { MyNewComponent } from './components/MyNewComponent';
```

### 10.2 Adding a New API Endpoint

1. Backend: Add route in `app/api/office/`
2. Frontend: Add function in `lib/api-client.ts`:
```typescript
export async function myNewApiCall(data: MyDataType): Promise<MyResponseType> {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}/office/my-endpoint`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}
```

### 10.3 Updating the Manifest

When adding features or changing URLs:

1. Edit `manifest.xml`
2. Update version number
3. Update SourceLocation if hosting URL changed
4. Add new permissions if needed
5. Test sideloading the updated manifest

### 10.4 Debugging Authentication Issues

Common issues and solutions:

**Issue**: "Invalid redirect URI"
- **Solution**: Ensure redirect URI in Azure AD matches exactly (including port and protocol)

**Issue**: "Token acquisition failed"
- **Solution**: Check that API permissions are granted and admin consent is provided

**Issue**: "CORS error"
- **Solution**: Ensure backend CORS is configured to allow Add-in origin

**Issue**: "Token expired"
- **Solution**: Implement token refresh logic (MSAL handles this automatically with `acquireTokenSilent`)

### 10.5 Handling Office.js Errors

```typescript
try {
  await Word.run(async (context) => {
    // Office.js operations
    await context.sync();
  });
} catch (error) {
  if (error instanceof OfficeExtension.Error) {
    console.error('Office.js error:', error.message);
    console.error('Code:', error.code);
    console.error('Trace messages:', error.traceMessages);
  }
}
```

---

## 11. Troubleshooting

### 11.1 Add-in Won't Load

**Symptoms**: Add-in doesn't appear or shows error when loading.

**Solutions**:
- Check browser console for errors (F12)
- Verify manifest.xml is valid XML
- Ensure SourceLocation URL is accessible
- Check that hosting server is running
- Verify HTTPS (required for production)
- Clear browser cache and reload

### 11.2 Authentication Not Working

**Symptoms**: Login fails, tokens not acquired, API calls return 401.

**Solutions**:
- Verify Azure AD app registration is correct
- Check redirect URIs match exactly
- Ensure API permissions are granted
- Check environment variables are set correctly
- Verify tenant ID and client ID are correct
- Check browser console for MSAL errors
- Try clearing browser cache and cookies

### 11.3 Office.js APIs Not Available

**Symptoms**: Office.js functions fail or are undefined.

**Solutions**:
- Ensure `Office.onReady()` is called before using APIs
- Check that you're using the correct API set (WordApi, Mailbox, etc.)
- Verify manifest permissions include required capabilities
- Check Office version compatibility
- Use Office.js TypeScript definitions for type checking

### 11.4 API Calls Failing

**Symptoms**: Backend API returns errors or timeouts.

**Solutions**:
- Check API_BASE_URL is correct
- Verify backend server is running
- Check network tab in DevTools for request details
- Verify authentication token is included in headers
- Check backend logs for errors
- Verify CORS is configured correctly
- Test API endpoint directly (e.g., with Postman)

### 11.5 Build Errors

**Symptoms**: `npm run build` fails with errors.

**Solutions**:
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies are installed: `npm install`
- Check for syntax errors in source files
- Verify webpack configuration is correct
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version matches requirements

### 11.6 Hot Reload Not Working

**Symptoms**: Changes don't reflect automatically.

**Solutions**:
- Restart development server
- Clear browser cache
- Check webpack dev server is running
- Verify file watcher is working
- Check for webpack compilation errors

---

## 12. Resources

### 12.1 Documentation

- **Office Add-ins Documentation**: https://learn.microsoft.com/office/dev/add-ins/
- **Office.js API Reference**: https://learn.microsoft.com/javascript/api/overview/office
- **MSAL.js Documentation**: https://github.com/AzureAD/microsoft-authentication-library-for-js
- **Office Add-ins Samples**: https://github.com/OfficeDev/Office-Add-in-samples

### 12.2 Microsoft 365 Developer Program

- **Developer Portal**: https://developer.microsoft.com/microsoft-365/dev-program
- **Free Developer Tenant**: Get a free Microsoft 365 E5 subscription for development
- **Community Forums**: https://learn.microsoft.com/answers/topics/office-addins-dev.html

### 12.3 Tools

- **Office Add-in Manifest Validator**: https://validator.officeapp.dev/
- **Office Add-in Debugging Tools**: Included in Visual Studio Code
- **Azure Portal**: https://portal.azure.com (for Azure AD configuration)

### 12.4 Support

- **Internal Documentation**: See `docs/IMPLEMENTATION_PLAN_M365.md` for detailed implementation plan
- **Team Communication**: [Add your team communication channels]
- **Issue Tracking**: [Add your issue tracker URL]

---

## Appendix A: Environment Variables Reference

### Development (.env)

```bash
# Azure AD Configuration
AZURE_CLIENT_ID=your-development-client-id
AZURE_TENANT_ID=your-tenant-id

# API Configuration
API_BASE_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

### Production (.env.production)

```bash
# Azure AD Configuration
AZURE_CLIENT_ID=your-production-client-id
AZURE_TENANT_ID=your-tenant-id

# API Configuration
API_BASE_URL=https://api.legalink360ai.com/api

# Environment
NODE_ENV=production
```

---

## Appendix B: Useful Commands

```bash
# Development
npm run start              # Start dev server
npm run build              # Build for production
npm run lint               # Run linter
npm run type-check         # Check TypeScript types

# Testing
npm test                   # Run tests (when implemented)
npm run test:watch         # Run tests in watch mode

# Utilities
npm run clean              # Clean build artifacts
npm run validate-manifest  # Validate manifest.xml (if script exists)
```

---

## Appendix C: Quick Reference

### Office.js Common Patterns

```typescript
// Initialize
Office.onReady((info) => {
  console.log(`Host: ${info.host}, Platform: ${info.platform}`);
});

// Word: Read document
Word.run(async (context) => {
  const body = context.document.body;
  context.load(body, 'text');
  await context.sync();
  return body.text;
});

// Word: Get selection
const selection = Office.context.document.getSelectedDataAsync(
  Office.CoercionType.Text,
  (result) => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      console.log(result.value);
    }
  }
);

// Outlook: Read mail item
Office.context.mailbox.item.body.getAsync(
  Office.CoercionType.Text,
  (result) => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      console.log(result.value);
    }
  }
);
```

### MSAL.js Common Patterns

```typescript
// Initialize
const msalInstance = new PublicClientApplication(config);
await msalInstance.initialize();

// Login
await msalInstance.loginPopup({ scopes: ['User.Read'] });

// Get token
const token = await msalInstance.acquireTokenSilent({
  scopes: ['User.Read'],
  account: msalInstance.getActiveAccount()
});

// Logout
await msalInstance.logoutPopup();
```

---

**Document End**

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Maintained By**: Development Team

