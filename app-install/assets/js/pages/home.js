// Home page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Add some dynamic elements to the home page

  // Update current time
  function updateTime() {
    const timeElement = document.createElement('div');
    timeElement.className = 'current-time';
    timeElement.textContent = new Date().toLocaleTimeString();

    // Replace existing time element if it exists
    const existingTime = document.querySelector('.current-time');
    if (existingTime) {
      existingTime.replaceWith(timeElement);
    } else {
      document.querySelector('.welcome-section').appendChild(timeElement);
    }
  }

  // Update time every second
  updateTime();
  setInterval(updateTime, 1000);

  // Add some animation to the status items
  const statusValues = document.querySelectorAll('.status-value');
  statusValues.forEach(status => {
    // Add a pulsating effect
    status.style.animation = 'pulse 2s infinite';
  });

  // Add a CSS animation
  const style = document.createElement('style');
  style.textContent = `
      @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
      }

      .current-time {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          color: var(--primary-color);
          text-align: center;
          margin-top: 20px;
          text-shadow: 0 0 5px var(--primary-color);
      }
  `;
  document.head.appendChild(style);

  // Add a random "incoming transmission" effect occasionally
  function showRandomTransmission() {
    const transmissions = [
      "WARNING: Unauthorized access attempt detected in sector 7G.",
      "ALERT: New security tools available in the repository.",
      "NOTICE: System maintenance scheduled for next cycle.",
      "UPDATE: Security protocols enhanced to level 3.",
      "INCOMING: New transmission from anonymous source."
    ];

    const randomIndex = Math.floor(Math.random() * transmissions.length);
    const message = transmissions[randomIndex];

    const transmissionElement = document.createElement('div');
    transmissionElement.className = 'random-transmission';
    transmissionElement.innerHTML = `
        <div class="transmission-header">INCOMING TRANSMISSION</div>
        <div class="transmission-body">${message}</div>
    `;

    document.body.appendChild(transmissionElement);

    // Remove after a few seconds
    setTimeout(() => {
      transmissionElement.classList.add('transmission-fade');
      setTimeout(() => {
        transmissionElement.remove();
      }, 1000);
    }, 5000);
  }

  // Add transmission CSS
  const transmissionStyle = document.createElement('style');
  transmissionStyle.textContent = `
      .random-transmission {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: rgba(10, 189, 198, 0.1);
          border: 1px solid var(--secondary-color);
          padding: 15px;
          max-width: 300px;
          animation: slideIn 0.5s ease-out;
          z-index: 1000;
      }

      .transmission-header {
          color: var(--secondary-color);
          font-weight: bold;
          margin-bottom: 5px;
      }

      .transmission-body {
          color: var(--text-bright);
      }

      .transmission-fade {
          animation: fadeOut 1s ease-in;
          opacity: 0;
      }

      @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
      }

      @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
      }
  `;
  document.head.appendChild(transmissionStyle);

  // Show a random transmission every 30-60 seconds
  function scheduleRandomTransmission() {
    const delay = 30000 + Math.random() * 30000; // 30-60 seconds
    setTimeout(() => {
      showRandomTransmission();
      scheduleRandomTransmission();
    }, delay);
  }

  scheduleRandomTransmission();

  // Handle "Open Terminal" button
  const openTerminalBtn = document.getElementById('openTerminalBtn');
  if (openTerminalBtn) {
    openTerminalBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Send the 'openTerminal' message to the parent frame
      window.parent.postMessage('openTerminal', '*');

      // --- URL cleaning part (iframe-aware) ---
      const iframeUrl = window.location;

      if (iframeUrl.hash) {
        iframeUrl.hash = '';
      } else if (iframeUrl.search) {
        iframeUrl.search = '';
      }
    });
  }
});