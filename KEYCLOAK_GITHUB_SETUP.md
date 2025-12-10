# Keycloak + GitHub Identity Provider Setup Guide

This guide explains how to configure GitHub as an identity provider in Keycloak for seamless authentication and automatic GitHub token management.

## 🎯 Benefits of This Setup

- **Single Sign-On**: Users log in once with GitHub
- **Automatic Token Management**: No manual GitHub token creation needed
- **Enhanced Security**: GitHub handles authentication, Keycloak manages authorization
- **Better User Experience**: Seamless login flow
- **Scalable**: Easy to add more identity providers later

## 📋 Prerequisites

1. **Keycloak Server** running (v15+ recommended)
2. **GitHub Account** with admin access to create OAuth apps
3. **Domain/URL** where your Keycloak is accessible

## 🔧 Step-by-Step Configuration

### Step 1: Create GitHub OAuth Application

1. Go to **GitHub** → **Settings** → **Developer settings** → **OAuth Apps**
2. Click **"New OAuth App"**
3. Fill in the details:
   ```
   Application name: Your App Name (e.g., "My GitHub Repo Viewer")
   Homepage URL: http://localhost:5173 (or your app URL)
   Application description: Your app description
   Authorization callback URL: http://localhost:8080/realms/YOUR_REALM_NAME/broker/github/endpoint
   ```
   
   ⚠️ **Important**: Replace `YOUR_REALM_NAME` with your actual Keycloak realm name
   
4. Click **"Register application"**
5. **Copy the Client ID and Client Secret** - you'll need these for Keycloak

### Step 2: Configure GitHub Identity Provider in Keycloak

1. **Log in to Keycloak Admin Console**
2. **Select your realm** (or create a new one)
3. Go to **Identity Providers** → **Add provider** → **GitHub**
4. Configure the GitHub provider:

   ```
   Alias: github (or any name you prefer)
   Display Name: Login with GitHub
   Client ID: [Paste from GitHub OAuth App]
   Client Secret: [Paste from GitHub OAuth App]
   Default Scopes: user:email repo
   ```

   **Important Settings:**
   - ✅ **Enabled**: ON
   - ✅ **Store Token**: ON (This allows access to GitHub API)
   - ✅ **Stored Tokens Readable**: ON
   - ✅ **Trust Email**: ON
   - ✅ **Account Linking Only**: OFF
   - ✅ **Hide on Login Page**: OFF

5. Click **"Save"**

### Step 3: Configure Token Storage and Mappers

1. In the **GitHub Identity Provider** settings, go to **Mappers** tab
2. Click **"Add mapper"** and create these mappers:

   **Mapper 1: GitHub Token**
   ```
   Name: github-token
   Mapper Type: Attribute Importer
   Social Profile JSON Field Path: access_token
   User Attribute Name: github_token
   ```

   **Mapper 2: GitHub Username**
   ```
   Name: github-username
   Mapper Type: Attribute Importer
   Social Profile JSON Field Path: login
   User Attribute Name: github_username
   ```

   **Mapper 3: GitHub Avatar**
   ```
   Name: github-avatar
   Mapper Type: Attribute Importer
   Social Profile JSON Field Path: avatar_url
   User Attribute Name: github_avatar_url
   ```

### Step 4: Configure Your Keycloak Client

1. Go to **Clients** → Select your app client (e.g., `github-repo-viewer`)
2. In **Settings** tab:
   ```
   Client authentication: OFF
   Authorization: OFF
   Standard flow: ON
   Direct access grants: ON
   ```

3. In **Advanced** tab:
   ```
   Access Token Lifespan: 15 minutes (or as needed)
   ```

4. **Valid Redirect URIs**:
   ```
   http://localhost:5173/*
   http://localhost:3001/*
   ```

5. **Web Origins**:
   ```
   http://localhost:5173
   ```

### Step 5: Update Your Application Configuration

Update your `.env` file:

```env
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-super-secret-session-key

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=your-realm-name
KEYCLOAK_CLIENT_ID=github-repo-viewer

# GitHub token is now optional - users get it automatically via GitHub IdP
# GITHUB_TOKEN=optional-fallback-token
```

## 🚀 How It Works

### Authentication Flow:
1. User clicks "Login with Keycloak"
2. Keycloak redirects to GitHub OAuth
3. User authorizes with GitHub
4. GitHub returns user info + access token to Keycloak
5. Keycloak stores GitHub token and creates user session
6. User is redirected back to your app with Keycloak token
7. Your app can now access GitHub API using the stored token

### Token Access:
Your application automatically gets the GitHub token through multiple methods:
- Token introspection from Keycloak
- User attributes in the JWT token
- Fallback to environment variable if needed

## 🔍 Testing the Setup

1. **Start your application**:
   ```bash
   npm run dev
   ```

2. **Access the app**: `http://localhost:5173`

3. **Click "Login with Keycloak"**

4. **You should see**: "Login with GitHub" option on Keycloak login page

5. **After GitHub login**: You should be redirected back to your app with access to repositories

## 🛠️ Troubleshooting

### Common Issues:

**1. "Invalid redirect URI" error**
- Check that the callback URL in GitHub OAuth app matches exactly:
  `http://localhost:8080/realms/YOUR_REALM/broker/github/endpoint`

**2. "GitHub token not found" error**
- Ensure "Store Token" is enabled in GitHub Identity Provider
- Check that the github-token mapper is configured correctly
- Verify the user has logged in via GitHub (not directly to Keycloak)

**3. "Scope insufficient" error**
- Make sure Default Scopes includes `repo` for repository access
- Update GitHub OAuth app permissions if needed

**4. Token not refreshing**
- GitHub tokens from OAuth don't auto-refresh
- Consider implementing token refresh logic or use shorter-lived sessions

### Debug Steps:

1. **Check Keycloak logs** for authentication errors
2. **Inspect JWT token** content at jwt.io
3. **Test GitHub API** directly with the token
4. **Verify user attributes** in Keycloak admin console

## 🔐 Security Best Practices

1. **Use HTTPS in production**
2. **Set appropriate token lifespans**
3. **Regularly rotate client secrets**
4. **Monitor token usage and access patterns**
5. **Implement proper logout flows**
6. **Use minimal required GitHub scopes**

## 📈 Advanced Configuration

### Multiple Environments:
```env
# Development
KEYCLOAK_URL=http://localhost:8080
# Production
KEYCLOAK_URL=https://auth.yourdomain.com
```

### Custom Scopes:
```
Default Scopes: user:email repo read:org
```

### Token Refresh Strategy:
Consider implementing a background job to refresh GitHub tokens or handle token expiration gracefully.

## 🎉 Benefits Achieved

✅ **No manual token management** - Users don't need to create GitHub PATs
✅ **Seamless authentication** - Single click login with GitHub
✅ **Automatic token storage** - Keycloak handles token lifecycle
✅ **Enhanced security** - OAuth flow instead of static tokens
✅ **Better UX** - Familiar GitHub login experience
✅ **Scalable architecture** - Easy to add more identity providers

Your setup is now complete! Users can log in with their GitHub accounts and automatically get access to their repositories without any manual token configuration.