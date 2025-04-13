const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_secret_key_here'; // Replace with a secure key or load from env

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Directory for storing uploads and metadata
const uploadsDir = path.join(__dirname, 'uploads');
const appsJsonPath = path.join(uploadsDir, 'apps.json');
const usersJsonPath = path.join(uploadsDir, 'users.json');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Initialize apps.json if it does not exist
if (!fs.existsSync(appsJsonPath)) {
  fs.writeFileSync(appsJsonPath, JSON.stringify([]));
}

// Initialize users.json if it does not exist
if (!fs.existsSync(usersJsonPath)) {
  fs.writeFileSync(usersJsonPath, JSON.stringify([]));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(uploadsDir, 'files');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

/**
 * JWT authentication middleware.
 * Expects the token to be sent as "Authorization: Bearer <token>".
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log("Received token for verification:", token);
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ================= User Authentication Endpoints =================

// Signup endpoint: creates a new user and returns a token
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersJsonPath));
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      apps: [],
      installedApps: [],
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2));
    const { password: _, ...userInfo } = newUser;
    // Generate token (expires in 7 days)
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ user: userInfo, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login endpoint: verifies credentials and returns a token
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersJsonPath));
    const user = users.find(user => user.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const { password: _, ...userInfo } = user;
    // Generate token (expires in 7 days)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ user: userInfo, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Endpoint to verify token and get user info
app.get('/api/me', authenticateToken, (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersJsonPath));
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ================= App/Tool Endpoints =================

// Upload endpoint (protected by token)
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    const { appName, description, category } = req.body;
    const userId = req.user.id;
    const appEntry = {
      uuid: uuidv4(),
      name: appName || req.file.originalname,
      description: description || '',
      category: category || 'other',
      filePath: req.file.path,
      userId: userId,
      likes: 0,
      downloads: 0,
      views: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    appsList.push(appEntry);
    fs.writeFileSync(appsJsonPath, JSON.stringify(appsList, null, 2));

    // Add app UUID to user's apps list
    const users = JSON.parse(fs.readFileSync(usersJsonPath));
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].apps.push(appEntry.uuid);
      fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2));
    }

    res.json(appEntry);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// List all apps
app.get('/api/apps', (req, res) => {
  try {
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    res.json(appsList);
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// List apps uploaded by a specific user
app.get('/api/users/:userId/apps', (req, res) => {
  try {
    const { userId } = req.params;
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    const userApps = appsList.filter(app => app.userId === userId);
    res.json(userApps);
  } catch (error) {
    console.error('Error fetching user apps:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get app statistics
app.get('/api/apps/:uuid/stats', (req, res) => {
  try {
    const { uuid } = req.params;
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    const app = appsList.find(app => app.uuid === uuid);
    if (!app) return res.status(404).json({ error: 'App not found' });
    const stats = {
      likes: app.likes,
      downloads: app.downloads,
      views: app.views,
      commentCount: app.comments.length
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching app stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record a view for an app
app.post('/api/apps/:uuid/view', (req, res) => {
  try {
    const { uuid } = req.params;
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    const appIndex = appsList.findIndex(app => app.uuid === uuid);
    if (appIndex === -1)
      return res.status(404).json({ error: 'App not found' });
    appsList[appIndex].views += 1;
    fs.writeFileSync(appsJsonPath, JSON.stringify(appsList, null, 2));
    res.json({ views: appsList[appIndex].views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like an app
app.post('/api/apps/:uuid/like', (req, res) => {
  try {
    const { uuid } = req.params;
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    const appIndex = appsList.findIndex(app => app.uuid === uuid);
    if (appIndex === -1)
      return res.status(404).json({ error: 'App not found' });
    appsList[appIndex].likes += 1;
    fs.writeFileSync(appsJsonPath, JSON.stringify(appsList, null, 2));
    res.json({ likes: appsList[appIndex].likes });
  } catch (error) {
    console.error('Error liking app:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download an app and record installation
app.get('/api/apps/:uuid/download', (req, res) => {
  try {
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    const appIndex = appsList.findIndex(app => app.uuid === req.params.uuid);
    if (appIndex === -1)
      return res.status(404).json({ error: 'App not found' });

    // Increment download counter
    appsList[appIndex].downloads += 1;
    fs.writeFileSync(appsJsonPath, JSON.stringify(appsList, null, 2));

    // Optionally record installation for a user, if userId is provided as query param
    if (req.query.userId) {
      const users = JSON.parse(fs.readFileSync(usersJsonPath));
      const userIndex = users.findIndex(u => u.id === req.query.userId);
      if (userIndex !== -1) {
        if (!users[userIndex].installedApps) {
          users[userIndex].installedApps = [];
        }
        if (!users[userIndex].installedApps.includes(req.params.uuid)) {
          users[userIndex].installedApps.push(req.params.uuid);
        }
        fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2));
      }
    }

    res.download(appsList[appIndex].filePath, appsList[appIndex].name);
  } catch (error) {
    console.error('Error downloading app:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a comment to an app
app.post('/api/apps/:uuid/comment', (req, res) => {
  try {
    const { uuid } = req.params;
    const { userId, username, text } = req.body;
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    const appIndex = appsList.findIndex(app => app.uuid === uuid);
    if (appIndex === -1)
      return res.status(404).json({ error: 'App not found' });
    const comment = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      username: username || 'Anonymous',
      text,
      createdAt: new Date().toISOString()
    };
    appsList[appIndex].comments.push(comment);
    fs.writeFileSync(appsJsonPath, JSON.stringify(appsList, null, 2));
    res.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve the installer ZIP file
app.get('/api/installer', (req, res) => {
  // Explicitly set CORS header for this response
  res.setHeader('Access-Control-Allow-Origin', '*');
  const zipPath = path.join(__dirname, 'app-install', 'app-install.zip');
  res.download(zipPath, 'app-install.zip', (err) => {
    if (err) {
      console.error('Error sending ZIP file:', err);
      res.status(500).send('Server error');
    }
  });
});

// Provide server statistics for dashboard
app.get('/api/stats', (req, res) => {
  try {
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    const totalApps = appsList.length;
    let totalDownloads = 0;
    let totalLikes = 0;
    let totalComments = 0;

    appsList.forEach(app => {
      totalDownloads += app.downloads;
      totalLikes += app.likes;
      totalComments += (app.comments && app.comments.length) || 0;
    });

    res.json({
      totalApps,
      totalDownloads,
      totalLikes,
      totalComments,
      serverUptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching server stats:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// Get installed apps for a user
app.get('/api/users/:userId/installed', (req, res) => {
  try {
    const { userId } = req.params;
    const users = JSON.parse(fs.readFileSync(usersJsonPath));
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const appsList = JSON.parse(fs.readFileSync(appsJsonPath));
    const installedApps = appsList.filter(app =>
      user.installedApps && user.installedApps.includes(app.uuid)
    );
    res.json(installedApps);
  } catch (error) {
    console.error('Error fetching installed apps:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Ozyrix backend server running on http://localhost:${PORT}`);
});
