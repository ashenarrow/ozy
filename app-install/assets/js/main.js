// main.js: // Main JavaScript for the Ozyrix terminal interface

// Configuration
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const terminalContent = document.getElementById('terminalContent');
const contentFrame = document.getElementById('contentFrame');
const frameTitle = document.getElementById('frameTitle');
const serverStatus = document.getElementById('serverStatus');
const currentTime = document.getElementById('currentTime');
const connectionStatus = document.getElementById('connectionStatus');
const menuItems = document.querySelectorAll('.menu-item');
const menuItems1 = document.querySelectorAll('.menu-item1');
const statsButton = document.getElementById('statsButton');
const statsModal = document.getElementById('statsModal');
const statsContent = document.getElementById('statsContent');
const closeModal = document.querySelector('.close-modal');
const terminalButton = document.getElementById('terminalButton');
const interactiveTerminal = document.getElementById('interactiveTerminal');

// Function to retrieve the token from the head
function getToken() {
  const tokenElement = document.querySelector('meta[name="ozyrix-token"]');
  if (tokenElement) {
    return tokenElement.content;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  // Set up menu items
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Update active state
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');
      
      // Handle terminal button separately
      if (item.id === 'terminalButton') {
        terminalContent.style.display = 'none';
        interactiveTerminal.style.display = 'flex';
        document.getElementById('terminalInput').focus();
        return;
      }
      
      // Load content in iframe
      const page = item.getAttribute('data-page');
      if (page) {
        contentFrame.src = page;
        frameTitle.textContent = page.replace('.html', '').toUpperCase();
        
        // Show terminal content
        terminalContent.style.display = 'flex';
        interactiveTerminal.style.display = 'none';
      }
    });
  });
  
  // Handle frame title updates
  contentFrame.addEventListener('load', () => {
    try {
      frameTitle.textContent = contentFrame.contentDocument.title.replace('OZYRIX - ', '').toUpperCase();
    } catch (e) {
      // Handle cross-origin issues
      frameTitle.textContent = 'CONTENT LOADED';
    }
  });
  
  // Update time
  updateTime();
  setInterval(updateTime, 1000);
  
  // Check server status
  checkServerStatus();
  setInterval(checkServerStatus, 10000);
  
  // Set up stats modal
  statsButton.addEventListener('click', showStatsModal);
  closeModal.addEventListener('click', () => {
    statsModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === statsModal) {
      statsModal.style.display = 'none';
    }
  });
  
  // Handle "Open Terminal" button in index.html
  window.addEventListener('message', (event) => {
    if (event.data === 'openTerminal') {
      terminalButton.click();
    }
  });

  // Handle menuItems1 (Repository) click
  menuItems1.forEach(item => {
    item.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      const token = getToken(); // Get the token
      if (page) {
        // Construct the URL with the token as a query parameter
        const newUrl = `${page}?token=${token}`;
        window.top.location.href = newUrl; // Load in top window
      }
    });
  });
});

// Update current time
function updateTime() {
  const now = new Date();
  currentTime.textContent = now.toLocaleTimeString();
}

// Check server status
function checkServerStatus() {
  const token = getToken(); // Get the token here
  fetch(`${API_URL}/stats`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '' // Include if available
    }
  })
    .then(response => {
      if (response.ok) {
        serverStatus.textContent = 'SERVER: ONLINE';
        serverStatus.style.color = 'var(--primary-color)';
        connectionStatus.textContent = 'SECURE';
        connectionStatus.style.backgroundColor = 'rgba(0, 255, 65, 0.1)';
        return response.json();
      } else {
        throw new Error('Server error');
      }
    })
    .catch(error => {
      console.error('Server status check failed:', error);
      serverStatus.textContent = 'SERVER: OFFLINE';
      serverStatus.style.color = 'var(--danger-color)';
      connectionStatus.textContent = 'DISCONNECTED';
      connectionStatus.style.backgroundColor = 'rgba(255, 34, 0, 0.1)';
      connectionStatus.style.color = 'var(--danger-color)';
    });
}

// Show stats modal
function showStatsModal() {
  statsModal.style.display = 'block';
  statsContent.innerHTML = '<div class="loading-spinner"></div>';
  const token = getToken();  // Get the token here
  fetch(`${API_URL}/stats`,{
        headers: {
          'Authorization': token ? `Bearer ${token}` : '' // Include if available
        }
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    })
    .then(stats => {
      // Format uptime
      const uptime = formatUptime(stats.serverUptime);
      
      statsContent.innerHTML = `
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">TOTAL APPS</div>
            <div class="stat-value">${stats.totalApps}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">TOTAL DOWNLOADS</div>
            <div class="stat-value">${stats.totalDownloads}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">TOTAL LIKES</div>
            <div class="stat-value">${stats.totalLikes}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">TOTAL COMMENTS</div>
            <div class="stat-value">${stats.totalComments}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">SERVER UPTIME</div>
            <div class="stat-value">${uptime}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">LAST UPDATED</div>
            <div class="stat-value">${new Date(stats.timestamp).toLocaleString()}</div>
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error fetching stats:', error);
      statsContent.innerHTML = `
        <div class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-text">Failed to fetch server statistics. Server may be offline.</div>
        </div>
      `;
    });
}

// Format uptime seconds into readable format
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0 || days > 0) result += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
  result += `${seconds}s`;
  
  return result;
}

// Add CSS for stats grid
const style = document.createElement('style');
style.textContent = `
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .stat-item {
    background-color: var(--background-light);
    padding: 15px;
    border: 1px solid var(--secondary-color);
  }
  
  .stat-label {
    color: var(--text-dim);
    font-size: 0.8em;
    margin-bottom: 5px;
  }
  
  .stat-value {
    color: var(--primary-color);
    font-size: 1.5em;
    font-family: var(--font-display);
  }
  
  .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
  }
  
  .error-icon {
    font-size: 2em;
  }
  
  .help-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }
  
  .help-table tr:nth-child(odd) {
    background-color: var(--background-light);
  }
  
  .help-table td {
    padding: 8px;
  }
  
  .help-table td:first-child {
    width: 150px;
    font-family: var(--font-mono);
    color: var(--primary-color);
  }
`;
document.head.appendChild(style);
document.addEventListener('DOMContentLoaded', function() {
  const menuItems1 = document.querySelectorAll('.menu-item1');

  menuItems1.forEach(item => {
    item.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      const token = getToken(); // Get the token
      if (page) {
        // Construct the URL with the token as a query parameter
        const newUrl = `${page}?token=${token}`;
        window.top.location.href = newUrl; // Load in top window
      }
    });
  });
});
