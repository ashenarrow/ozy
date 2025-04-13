document.addEventListener('DOMContentLoaded', () => {
        // Check for URL fragment to bypass BIOS
        const hash = window.location.hash;
        if (hash.includes("#menu") || hash.includes("#desktop")) {
            // Hide BIOS screen and boot sequence
            const biosScreen = document.getElementById('biosScreen');
            if (biosScreen) {
                biosScreen.style.display = 'none';
            }
            const bootSequence = document.getElementById('bootSequence');
            if (bootSequence) {
                bootSequence.style.display = 'none';
            }
      
            // Show terminal container
            const terminalContainer = document.getElementById('terminalContainer');
            if (terminalContainer) {
                terminalContainer.style.display = 'flex';
            }
      
            if (hash.includes("#menu")) {
                // For "#menu": bypass desktop and go directly to the interactive terminal
                const terminalContent = document.getElementById('terminalContent');
                if (terminalContent) {
                    terminalContent.style.display = 'none';
                }
                const interactiveTerminal = document.getElementById('interactiveTerminal');
                if (interactiveTerminal) {
                    interactiveTerminal.style.display = 'flex';
                }
      
                if (typeof window.initTerminal === 'function') {
                    window.initTerminal();
                } else {
                    setTimeout(() => {
                        if (typeof window.initTerminal === 'function') {
                            window.initTerminal();
                        }
                    }, 1000);
                }
            } else if (hash.includes("#desktop")) {
                // For "#desktop": show the desktop screen (homescreen) and leave the interactive terminal hidden
                const interactiveTerminal = document.getElementById('interactiveTerminal');
                if (interactiveTerminal) {
                    interactiveTerminal.style.display = 'none';
                }
                const terminalContent = document.getElementById('terminalContent');
                if (terminalContent) {
                    terminalContent.style.display = 'flex';
                }
                // You can place any additional initialization for the desktop mode here.
            }
            return; // Exit early; no BIOS boot sequence in bypass mode.
        }
      
        // If no URL fragment is used, start normal BIOS boot sequence
      
        const biosScreen = document.getElementById('biosScreen');
        const biosContent = document.getElementById('biosContent');
        const terminalContainer = document.getElementById('terminalContainer');
        const bootSequence = document.getElementById('bootSequence');
      
        // BIOS POST (Power-On Self Test) sequence
        function startBIOS() {
            // Clear BIOS content
            biosContent.innerHTML = '';
      
            // Add BIOS header
            addBIOSLine('<div style="text-align: center; margin-bottom: 20px;">OZYRIX ADVANCED HACKING SYSTEM</div>');
      
            // CPU information
            addBIOSLine('<div class="bios-section">CPU Information</div>');
            addBIOSLine('<table class="bios-table">');
            addBIOSLine('<tr><td>Processor:</td><td>Quantum Core i9-9900K @ 5.0 GHz</td></tr>');
            addBIOSLine('<tr><td>Architecture:</td><td>x86_64</td></tr>');
            addBIOSLine('<tr><td>Cores/Threads:</td><td>8/16</td></tr>');
            addBIOSLine('<tr><td>Cache:</td><td>16MB L3</td></tr>');
            addBIOSLine('</table>');
      
            // Memory information
            addBIOSLine('<div class="bios-section">Memory Information</div>');
            addBIOSLine('<table class="bios-table">');
            addBIOSLine('<tr><td>Installed Memory:</td><td>32GB DDR5 5600MHz</td></tr>');
            addBIOSLine('<tr><td>Memory Slots:</td><td>4 of 4 used</td></tr>');
            addBIOSLine('<tr><td>Memory Mode:</td><td>Dual Channel</td></tr>');
            addBIOSLine('</table>');
      
            // Storage information
            addBIOSLine('<div class="bios-section">Storage Information</div>');
            addBIOSLine('<table class="bios-table">');
            addBIOSLine('<tr><td>Primary Drive:</td><td>NVMe SSD 2TB</td></tr>');
            addBIOSLine('<tr><td>Secondary Drive:</td><td>SATA SSD 4TB</td></tr>');
            addBIOSLine('<tr><td>RAID Configuration:</td><td>RAID 1</td></tr>');
            addBIOSLine('</table>');
      
            // Network information
            addBIOSLine('<div class="bios-section">Network Information</div>');
            addBIOSLine('<table class="bios-table">');
            addBIOSLine('<tr><td>Primary Adapter:</td><td>Ethernet Controller X550</td></tr>');
            addBIOSLine('<tr><td>MAC Address:</td><td>00:1A:2B:3C:4D:5E</td></tr>');
            addBIOSLine('<tr><td>IP Configuration:</td><td>DHCP</td></tr>');
            addBIOSLine('</table>');
      
            // Security information
            addBIOSLine('<div class="bios-section">Security Information</div>');
            addBIOSLine('<table class="bios-table">');
            addBIOSLine('<tr><td>Secure Boot:</td><td>Enabled</td></tr>');
            addBIOSLine('<tr><td>TPM:</td><td>Version 2.0</td></tr>');
            addBIOSLine('<tr><td>Virtualization:</td><td>Enabled</td></tr>');
            addBIOSLine('</table>');
      
            // Add progress bar
            addBIOSLine('<div class="bios-section">System Initialization</div>');
            addBIOSLine('<div class="bios-progress"><div class="bios-progress-bar" id="biosProgressBar"></div></div>');
      
            // Start progress bar animation
            const progressBar = document.getElementById('biosProgressBar');
            let progress = 0;
      
            const progressInterval = setInterval(() => {
                progress += 1;
                progressBar.style.width = `${progress}%`;
      
                if (progress >= 100) {
                    clearInterval(progressInterval);
      
                    // Add boot message
                    addBIOSLine('<div style="color: #00aa00; margin-top: 10px;">System initialization complete. Booting operating system...</div>');
      
                    // Wait, then transition to boot sequence
                    setTimeout(() => {
                        biosScreen.style.display = 'none';
                        terminalContainer.style.display = 'flex';
                        startBootSequence();
                    }, 2000);
                }
            }, 50);
        }
      
        // Helper to append BIOS lines
        function addBIOSLine(html) {
            biosContent.innerHTML += html;
            biosContent.scrollTop = biosContent.scrollHeight;
        }
      
        // Boot sequence definition
        function startBootSequence() {
            bootSequence.style.display = 'block';
            bootSequence.innerHTML = '';
      
            const BOOT_LINES = [
                { text: 'OZYRIX SYSTEM BOOT SEQUENCE INITIATED', type: 'header' },
                { text: 'Loading kernel...', type: 'info' },
                { text: 'Kernel loaded successfully', type: 'success' },
                { text: 'Initializing memory subsystems...', type: 'info' },
                { text: 'Memory check: OK', type: 'success' },
                { text: 'Initializing quantum encryption module...', type: 'info' },
                { text: 'Quantum encryption online', type: 'success' },
                { text: 'Establishing secure network connections...', type: 'info' },
                { text: 'Network connection established', type: 'success' },
                { text: 'Checking for system integrity...', type: 'info' },
                { text: 'WARNING: Potential security breach detected in sector 7G', type: 'warning' },
                { text: 'Applying security patches...', type: 'info' },
                { text: 'Security level 2 enabled', type: 'success' },
                { text: 'Loading user interface...', type: 'info' },
                { text: 'WELCOME TO OZYRIX TERMINAL v3.0', type: 'header' },
                { text: 'Type "help" for available commands', type: 'info' },
                { text: 'SYSTEM READY', type: 'success' }
            ];
      
            let lineIndex = 0;
            const BOOT_DELAY = 100; // milliseconds
      
            function addBootLine() {
                if (lineIndex < BOOT_LINES.length) {
                    const line = document.createElement('div');
                    line.className = `boot-line ${BOOT_LINES[lineIndex].type}`;
      
                    // Add a line prefix
                    const prefix = document.createElement('span');
                    prefix.style.color = '#0abdc6';
                    prefix.textContent = `[${String(lineIndex).padStart(2, '0')}] `;
      
                    const content = document.createElement('span');
                    content.textContent = BOOT_LINES[lineIndex].text;
      
                    line.appendChild(prefix);
                    line.appendChild(content);
      
                    // On the last line add a blinking cursor and finish boot sequence
                    if (lineIndex === BOOT_LINES.length - 1) {
                        const cursor = document.createElement('span');
                        cursor.className = 'cursor';
                        line.appendChild(cursor);
      
                        setTimeout(() => {
                            bootSequence.style.display = 'none';
                            // Show interactive terminal
                            document.getElementById('interactiveTerminal').style.display = 'flex';
                            initializeTerminal();
                        }, 2000);
                    }
      
                    bootSequence.appendChild(line);
                    bootSequence.scrollTop = bootSequence.scrollHeight;
      
                    lineIndex++;
                    setTimeout(addBootLine, BOOT_DELAY);
                }
            }
      
            addBootLine();
        }
      
        // Initialize terminal (from terminal.js)
        function initializeTerminal() {
            if (typeof window.initTerminal === 'function') {
                window.initTerminal();
            } else {
                setTimeout(() => {
                    if (typeof window.initTerminal === 'function') {
                        window.initTerminal();
                    } else {
                        console.error('Terminal initialization function not found');
                        document.getElementById('terminalContent').style.display = 'flex';
                    }
                }, 1000);
            }
        }
      
        // Start the normal BIOS sequence if no hash is provided
        startBIOS();
      
        // Easter egg: Press F12 during BIOS to show a secret message
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' && biosScreen.style.display !== 'none') {
                e.preventDefault();
                addBIOSLine('<div style="color: #ff00ff; margin-top: 10px;">SECRET BOOT MENU ACCESSED - DEVELOPER MODE ENABLED</div>');
                addBIOSLine('<div class="bios-section">Developer Options</div>');
                addBIOSLine('<table class="bios-table">');
                addBIOSLine('<tr><td>Debug Mode:</td><td>Enabled</td></tr>');
                addBIOSLine('<tr><td>Verbose Boot:</td><td>Enabled</td></tr>');
                addBIOSLine('<tr><td>Secret Backdoor:</td><td>Enabled</td></tr>');
                addBIOSLine('</table>');
                addBIOSLine('<div style="color: #ff00ff; font-size: 0.8em; margin-top: 10px;">Hint: Try the "backdoor" command in the terminal</div>');
            }
        });
    });
    