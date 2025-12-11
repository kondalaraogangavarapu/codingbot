const express = require('express');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Keycloak configuration
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'master';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'github-repo-viewer';

// Middleware to verify Keycloak token
const verifyKeycloakToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    // Verify token with Keycloak
    const response = await axios.get(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    req.user = response.data;
    req.token = token;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.response?.data || error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    keycloak: {
      url: KEYCLOAK_URL,
      realm: KEYCLOAK_REALM,
      clientId: KEYCLOAK_CLIENT_ID
    }
  });
});

// Get current user info
app.get('/api/user', verifyKeycloakToken, (req, res) => {
  res.json({ user: req.user });
});

// Helper function to get GitHub token from various sources
const getGitHubToken = async (req) => {
  // Method 1: Try to get token from Keycloak token introspection (for GitHub IdP)
  try {
    const introspectResponse = await axios.post(
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`,
      `token=${req.token}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${req.token}`
        }
      }
    );
    
    // Check for GitHub token in the introspection response
    if (introspectResponse.data.github_access_token) {
      return introspectResponse.data.github_access_token;
    }
  } catch (error) {
    console.log('Token introspection failed, trying other methods...');
  }

  // Method 2: Check user attributes from userinfo endpoint
  if (req.user.github_token) {
    return req.user.github_token;
  }

  // Method 3: Check for custom attributes (array format)
  if (req.user.attributes && req.user.attributes.github_token) {
    return Array.isArray(req.user.attributes.github_token) 
      ? req.user.attributes.github_token[0] 
      : req.user.attributes.github_token;
  }

  // Method 4: Fallback to environment variable
  return process.env.GITHUB_TOKEN;
};

// Get user repositories from GitHub
app.get('/api/repos', verifyKeycloakToken, async (req, res) => {
  try {
    const githubToken = await getGitHubToken(req);
    
    if (!githubToken) {
      return res.status(400).json({ 
        error: 'GitHub token not found. Please ensure you have logged in with GitHub through Keycloak or configure a GitHub token in your profile.' 
      });
    }

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 50,
        affiliation: 'owner,collaborator'
      }
    });

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      private: repo.private,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url
      }
    }));

    res.json({ repos });
  } catch (error) {
    console.error('Error fetching repositories:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'GitHub token is invalid or expired. Please update your GitHub integration.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get GitHub user info
app.get('/api/github/user', verifyKeycloakToken, async (req, res) => {
  try {
    const githubToken = await getGitHubToken(req);
    
    if (!githubToken) {
      return res.status(400).json({ 
        error: 'GitHub token not found. Please ensure you have logged in with GitHub through Keycloak or configure a GitHub token in your profile.' 
      });
    }

    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const githubUser = {
      id: response.data.id,
      login: response.data.login,
      name: response.data.name,
      avatar_url: response.data.avatar_url,
      email: response.data.email,
      public_repos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following
    };

    res.json({ githubUser });
  } catch (error) {
    console.error('Error fetching GitHub user:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'GitHub token is invalid or expired. Please update your GitHub integration.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch GitHub user information' });
  }
});

// Keycloak configuration endpoint for frontend
app.get('/api/keycloak-config', (req, res) => {
  res.json({
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID
  });
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Keycloak URL: ${KEYCLOAK_URL}`);
  console.log(`Keycloak Realm: ${KEYCLOAK_REALM}`);
  console.log(`Keycloak Client ID: ${KEYCLOAK_CLIENT_ID}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
  }
});