// --------------------- Global Variables & Configuration ---------------------

// Use serverPort from config, default to 3000 if not specified.
const SERVER_PORT = (window.OZYRIX_CONFIG && window.OZYRIX_CONFIG.serverPort) || 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`; // Change if necessary

// Global variable for the local apps folder handle.
window.localAppsFolderHandle = null;

// --------------------- Helper Functions ---------------------

// Write a file (supports nested folders) into a given directory handle.
async function writeFile(directoryHandle, relativePath, fileBlob) {
  const parts = relativePath.split('/').filter(p => p);
  let currentDir = directoryHandle;
  for (let i = 0; i < parts.length - 1; i++) {
    currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
  }
  const fileName = parts[parts.length - 1];
  const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(fileBlob);
  await writable.close();
}

// Remove a directory entry recursively.
async function removeDirectoryEntry(parentHandle, dirName) {
  try {
    await parentHandle.removeEntry(dirName, { recursive: true });
  } catch (err) {
    console.error("Error removing directory:", err);
    showNotification("Failed to remove directory", "error");
  }
}

// --------------------- Notification Function ---------------------
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add("show"), 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// --------------------- Main Initialization ---------------------
document.addEventListener("DOMContentLoaded", () => {
  // Check server status.
  checkServerStatus();

  // Load apps.
  loadApps();

  // Set up event listeners.
  setupEventListeners();

  // Set up local apps folder selector.
  const localFolderBtn = document.getElementById("selectLocalAppsFolder");
  if (localFolderBtn) {
    localFolderBtn.addEventListener("click", async () => {
      if (!window.showDirectoryPicker) {
        showNotification("File System Access API is not supported in your browser.", "error");
        return;
      }
      try {
        const chosenFolder = await window.showDirectoryPicker();
        const localAppsHandle = await chosenFolder.getDirectoryHandle('apps', { create: true });
        window.localAppsFolderHandle = localAppsHandle;
        const statusEl = document.getElementById("localAppsFolderStatus");
        if (statusEl) statusEl.textContent = "Local apps folder selected";
        showNotification("Local apps folder selected", "success");
      } catch (error) {
        console.error("Folder selection error:", error);
        showNotification("Failed to select local apps folder", "error");
      }
    });
  } else {
    console.warn("Local folder selection button not found.");
  }
});

// --------------------- Server Status ---------------------
function checkServerStatus() {
  fetch(`${SERVER_URL}/api/server/status`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.status === "online") {
        document.querySelectorAll(".status-indicator").forEach((el) => {
          el.classList.remove("offline");
          el.classList.add("online");
        });
        document.querySelectorAll(".status-text").forEach((el) => {
          el.textContent = "SECURE CONNECTION";
        });
        document.querySelectorAll(".server-status").forEach((el) => {
          el.textContent = "SERVER ONLINE";
          el.classList.remove("offline");
          el.classList.add("online");
        });
      } else {
        setOfflineStatus();
      }
    })
    .catch((error) => {
      console.error("Error checking server status:", error);
      setOfflineStatus();
    });
}

function setOfflineStatus() {
  document.querySelectorAll(".status-indicator").forEach((el) => {
    el.classList.remove("online");
    el.classList.add("offline");
  });
  document.querySelectorAll(".status-text").forEach((el) => {
    el.textContent = "CONNECTION LOST";
  });
  document.querySelectorAll(".server-status").forEach((el) => {
    el.textContent = "SERVER OFFLINE";
    el.classList.remove("online");
    el.classList.add("offline");
  });
}

// --------------------- App Loading ---------------------
function loadApps() {
  // Use the container ID that exists in your HTML (here "appsGrid").
  const appGrid = document.getElementById("appsGrid");
  if (!appGrid) {
    console.error("Apps container element (id 'appsGrid') not found.");
    return;
  }
  
  appGrid.innerHTML = "";
  
  const categoryFilter = document.getElementById("category-filter") ? document.getElementById("category-filter").value : "";
  const searchInput = document.getElementById("search-input") ? document.getElementById("search-input").value : "";
  const sortSelect = document.getElementById("sort-select") ? document.getElementById("sort-select").value : "";
  
  const queryParams = new URLSearchParams();
  if (categoryFilter) queryParams.append("category", categoryFilter);
  if (searchInput) queryParams.append("search", searchInput);
  if (sortSelect) queryParams.append("sort", sortSelect);
  
  // Check URL parameters for an initial filter.
  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get("category");
  if (urlCategory && !categoryFilter) {
    queryParams.append("category", urlCategory);
    if (document.getElementById("category-filter"))
      document.getElementById("category-filter").value = urlCategory;
  }
  
  appGrid.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>SCANNING REPOSITORY...</p></div>';
  
  fetch(`${SERVER_URL}/api/apps?${queryParams.toString()}`)
    .then((response) => response.json())
    .then((data) => {
      appGrid.innerHTML = "";
      if (data.success && data.apps && data.apps.length > 0) {
        data.apps.forEach((app) => {
          const appCard = document.createElement("div");
          appCard.className = "app-card";
  
          appCard.innerHTML = `
            <div class="app-icon">
              <img src="${app.icon || "/assets/images/app-default.png"}" alt="${app.name}">
            </div>
            <div class="app-info">
              <h3 class="app-name">${app.name}</h3>
              <div class="app-meta">
                <span class="app-category">${app.category ? app.category.toUpperCase() : "TOOL"}</span>
                <span class="app-author">by ${app.author || "Unknown"}</span>
              </div>
              <p class="app-description">${app.description || ""}</p>
              <div class="app-stats">
                <div class="app-rating">
                  <span class="rating-value">${(app.rating || 0).toFixed(1)}</span>
                </div>
                <div class="app-downloads">
                  ${app.downloads || 0} downloads
                </div>
              </div>
            </div>
            <div class="app-actions">
              <button class="btn primary install-btn" data-uuid="${app.uuid}">Install</button>
              <button class="btn secondary launch-btn" data-uuid="${app.uuid}">Launch</button>
              <button class="btn remove-btn" data-uuid="${app.uuid}">Remove</button>
            </div>
          `;
  
          appGrid.appendChild(appCard);
        });
  
        document.querySelectorAll(".install-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const uuid = e.target.getAttribute("data-uuid");
            installApp(uuid);
          });
        });
        document.querySelectorAll(".launch-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const uuid = e.target.getAttribute("data-uuid");
            launchApp(uuid);
          });
        });
        document.querySelectorAll(".remove-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const uuid = e.target.getAttribute("data-uuid");
            removeApp(uuid);
          });
        });
      } else {
        appGrid.innerHTML = '<div class="no-apps">No apps found matching your criteria</div>';
      }
    })
    .catch((error) => {
      console.error("Error loading apps:", error);
      appGrid.innerHTML = '<div class="error-message">Failed to load apps. Please try again later.</div>';
    });
}
  
// --------------------- Download Function (Existing) ---------------------
function downloadApp(appId) {
  fetch(`${SERVER_URL}/api/apps/download/${appId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = data.downloadUrl;
        showNotification("Download started", "success");
      } else {
        showNotification(data.message || "Download failed", "error");
      }
    })
    .catch((error) => {
      console.error("Download error:", error);
      showNotification("Download failed. Please try again.", "error");
    });
}
  
// --------------------- Local Installation Functions ---------------------
async function installApp(uuid) {
  if (!window.localAppsFolderHandle) {
    showNotification("Please select your local apps folder first", "error");
    return;
  }
  try {
    const res = await fetch(`${SERVER_URL}/api/apps`);
    const data = await res.json();
    if (!(data.success && data.apps)) throw new Error("Failed to load apps data");
    const appEntry = data.apps.find(a => a.uuid === uuid);
    if (!appEntry) {
      showNotification("App not found", "error");
      return;
    }
    const safeName = appEntry.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
    const folderName = `${uuid}-${safeName}`;
  
    const appDirHandle = await window.localAppsFolderHandle.getDirectoryHandle(folderName, { create: true });
  
    const downloadUrl = `${SERVER_URL}/api/apps/${uuid}/download`;
    const fileRes = await fetch(downloadUrl);
    if (!fileRes.ok) throw new Error("Failed to download app file");
    const blob = await fileRes.blob();
  
    if (appEntry.filePath.toLowerCase().endsWith(".zip")) {
      const zip = await JSZip.loadAsync(blob);
      for (const filename of Object.keys(zip.files)) {
        const fileData = await zip.files[filename].async("blob");
        await writeFile(appDirHandle, filename, fileData);
      }
    } else {
      await writeFile(appDirHandle, appEntry.name, blob);
    }
    showNotification("App installed locally", "success");
  } catch (err) {
    console.error("Installation error:", err);
    showNotification("Installation error: " + err.message, "error");
  }
}
  
async function launchApp(uuid) {
  if (!window.localAppsFolderHandle) {
    showNotification("Please select your local apps folder first", "error");
    return;
  }
  try {
    const res = await fetch(`${SERVER_URL}/api/apps`);
    const data = await res.json();
    if (!(data.success && data.apps)) throw new Error("Failed to load apps data");
    const appEntry = data.apps.find(a => a.uuid === uuid);
    if (!appEntry) {
      showNotification("App not found", "error");
      return;
    }
    const safeName = appEntry.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
    const folderName = `${uuid}-${safeName}`;
  
    const appDirHandle = await window.localAppsFolderHandle.getDirectoryHandle(folderName);
    let indexFileHandle;
    try {
      indexFileHandle = await appDirHandle.getFileHandle("index.html");
    } catch (e) {
      showNotification("index.html not found in the installed app folder", "error");
      return;
    }
    const file = await indexFileHandle.getFile();
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  } catch (err) {
    console.error("Launch error:", err);
    showNotification("Launch error: " + err.message, "error");
  }
}
  
async function removeApp(uuid) {
  if (!window.localAppsFolderHandle) {
    showNotification("Please select your local apps folder first", "error");
    return;
  }
  try {
    const res = await fetch(`${SERVER_URL}/api/apps`);
    const data = await res.json();
    if (!(data.success && data.apps)) throw new Error("Failed to load apps data");
    const appEntry = data.apps.find(a => a.uuid === uuid);
    if (!appEntry) {
      showNotification("App not found", "error");
      return;
    }
    const safeName = appEntry.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
    const folderName = `${uuid}-${safeName}`;
    await removeDirectoryEntry(window.localAppsFolderHandle, folderName);
    showNotification("Local installation removed", "success");
  } catch (err) {
    console.error("Remove error:", err);
    showNotification("Remove error: " + err.message, "error");
  }
}
  
// --------------------- Debounce Function ---------------------
function debounce(func, delay) {
  let timeout;
  return function () {
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  }
}
  
// --------------------- Authentication & Modal Functions ---------------------
// (Preserve your existing implementations.)
  
function showLoginModal() {
  let loginModal = document.getElementById("loginModal");
  if (!loginModal) {
    loginModal = document.createElement("div");
    loginModal.id = "loginModal";
    loginModal.className = "modal";
    loginModal.innerHTML = `
      <div class="modal-content">
          <div class="modal-header">
              <h2>Login to OZYRIX</h2>
              <span class="close-modal">&times;</span>
          </div>
          <div class="modal-body">
              <form id="loginForm">
                  <div class="form-group">
                      <label for="username">Username</label>
                      <input type="text" id="username" name="username" required>
                  </div>
                  <div class="form-group">
                      <label for="password">Password</label>
                      <input type="password" id="password" name="password" required>
                  </div>
                  <div class="form-actions">
                      <button type="submit" class="btn primary">Login</button>
                      <button type="button" class="btn secondary" id="switchToSignup">Create Account</button>
                  </div>
              </form>
          </div>
      </div>
    `;
    document.body.appendChild(loginModal);
  
    const closeBtn = loginModal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => {
      loginModal.style.display = "none";
    });
  
    const switchToSignupBtn = document.getElementById("switchToSignup");
    switchToSignupBtn.addEventListener("click", () => {
      loginModal.style.display = "none";
      showSignupModal();
    });
  
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            loginModal.style.display = "none";
            updateAuthUI(data.user);
            showNotification("Login successful", "success");
            loadApps();
          } else {
            showNotification(data.message || "Login failed", "error");
          }
        })
        .catch((error) => {
          console.error("Login error:", error);
          showNotification("Login failed. Please try again.", "error");
        });
    });
  }
  loginModal.style.display = "block";
}
  
function showSignupModal() {
  let signupModal = document.getElementById("signupModal");
  if (!signupModal) {
    signupModal = document.createElement("div");
    signupModal.id = "signupModal";
    signupModal.className = "modal";
    signupModal.innerHTML = `
      <div class="modal-content">
          <div class="modal-header">
              <h2>Create OZYRIX Account</h2>
              <span class="close-modal">&times;</span>
          </div>
          <div class="modal-body">
              <form id="signupForm">
                  <div class="form-group">
                      <label for="newUsername">Username</label>
                      <input type="text" id="newUsername" name="newUsername" required>
                  </div>
                  <div class="form-group">
                      <label for="email">Email</label>
                      <input type="email" id="email" name="email" required>
                  </div>
                  <div class="form-group">
                      <label for="newPassword">Password</label>
                      <input type="password" id="newPassword" name="newPassword" required>
                  </div>
                  <div class="form-group">
                      <label for="confirmPassword">Confirm Password</label>
                      <input type="password" id="confirmPassword" name="confirmPassword" required>
                  </div>
                  <div class="form-actions">
                      <button type="submit" class="btn primary">Create Account</button>
                      <button type="button" class="btn secondary" id="switchToLogin">Login Instead</button>
                  </div>
              </form>
          </div>
      </div>
    `;
    document.body.appendChild(signupModal);
  
    const closeBtn = signupModal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => {
      signupModal.style.display = "none";
    });
  
    const switchToLoginBtn = document.getElementById("switchToLogin");
    switchToLoginBtn.addEventListener("click", () => {
      signupModal.style.display = "none";
      showLoginModal();
    });
  
    const signupForm = document.getElementById("signupForm");
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("newUsername").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
  
      if (password !== confirmPassword) {
        showNotification("Passwords do not match", "error");
        return;
      }
  
      fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            signupModal.style.display = "none";
            updateAuthUI(data.user);
            showNotification("Account created successfully", "success");
          } else {
            showNotification(data.message || "Signup failed", "error");
          }
        })
        .catch((error) => {
          console.error("Signup error:", error);
          showNotification("Signup failed. Please try again.", "error");
        });
    });
  }
  signupModal.style.display = "block";
}
  
function checkAuthStatus() {
  fetch("/api/auth/status")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.authenticated) {
        updateAuthUI(data.user);
      } else {
        updateAuthUI(null);
      }
    })
    .catch((error) => {
      console.error("Auth status error:", error);
      updateAuthUI(null);
    });
}
  
function updateAuthUI(user) {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userDisplay = document.getElementById("userDisplay");
  const dashboardLink = document.getElementById("dashboardLink");
  
  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (userDisplay) {
      userDisplay.style.display = "inline-block";
      userDisplay.textContent = user.username;
    }
    if (dashboardLink) {
      dashboardLink.style.display = "inline-block";
    }
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (signupBtn) signupBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userDisplay) {
      userDisplay.style.display = "none";
    }
    if (dashboardLink) {
      dashboardLink.style.display = "none";
    }
  }
}
  
function logout() {
  fetch("/api/auth/logout")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateAuthUI(null);
        showNotification("Logged out successfully", "success");
        loadApps();
      }
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
}
