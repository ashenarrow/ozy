// Terminal functionality
document.addEventListener('DOMContentLoaded', () => {
    // Terminal controls functionality
    const minimizeBtn = document.querySelector('.control.minimize');
    const maximizeBtn = document.querySelector('.control.maximize');
    const closeBtn = document.querySelector('.control.close');
    const terminalContainer = document.querySelector('.terminal-container');
    
    // Terminal elements
    const interactiveTerminal = document.getElementById('interactiveTerminal');
    const terminalContent = document.getElementById('terminalContent');
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalInput = document.getElementById('terminalInput');
    const terminalPrompt = document.getElementById('terminalPrompt');
    const terminalButton = document.getElementById('terminalButton');
    const helpModal = document.getElementById('helpModal');
    
    // Command history
    let commandHistory = [];
    let historyIndex = -1;
    
    // Current directory and file system
    let currentDir = '/home/user';
    let username = 'user';
    
    // Simple file system structure
    const fileSystem = {
        '/': {
            type: 'dir',
            contents: {
                'home': {
                    type: 'dir',
                    contents: {
                        'user': {
                            type: 'dir',
                            contents: {
                                'documents': {
                                    type: 'dir',
                                    contents: {
                                        'readme.txt': {
                                            type: 'file',
                                            content: 'Welcome to Ozyrix Terminal!\n\nThis is a simulated hacking environment for educational purposes.\nType "help" to see available commands.\n\nTry to find hidden easter eggs and secret commands!'
                                        },
                                        'secret.txt': {
                                            type: 'file',
                                            content: 'Congratulations on finding this secret file!\nTry the "matrix" command for a cool effect.'
                                        }
                                    }
                                },
                                'downloads': {
                                    type: 'dir',
                                    contents: {
                                        'hack_tool.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# This is a simulated hacking tool\necho "Initiating hack sequence..."\nsleep 2\necho "Target acquired, exploiting vulnerabilities..."\nsleep 2\necho "Access granted!"\n'
                                        }
                                    }
                                },
                                '.hidden': {
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    contents: {
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:Ozyrix User:/home/user:/bin/bash'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1 localhost\n127.0.1.1 ozyrix\n\n# The following lines are desirable for IPv6 capable hosts\n::1     ip6-localhost ip6-loopback\nfe00::0 ip6-localnet\nff00::0 ip6-mcastprefix\nff02::1 ip6-allnodes\nff02::2 ip6-allrouters'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    contents: {
                        'log': {
                            type: 'dir',
                            contents: {
                                'system.log': {
                                    type: 'file',
                                    content: '2023-05-01 00:00:00 System initialized\n2023-05-01 00:01:23 User login: admin\n2023-05-01 00:05:46 Security alert: Unauthorized access attempt\n2023-05-01 00:06:12 Security breach contained\n2023-05-01 00:10:45 System update initiated\n2023-05-01 00:15:30 System update completed'
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    
    // Minimize button (just for show)
    minimizeBtn.addEventListener('click', () => {
        terminalContainer.classList.toggle('minimized');
    });
    
    // Maximize button (toggle fullscreen)
    maximizeBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // Close button (reload page)
    closeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to close the terminal?')) {
            location.reload();
        }
    });
    
    // Add glitch effect occasionally
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance
            terminalContainer.classList.add('glitch');
            setTimeout(() => {
                terminalContainer.classList.remove('glitch');
            }, 200);
        }
    }, 10000);
    
    // Initialize the terminal
    window.initTerminal = function() {
        // Focus the input
        terminalInput.focus();
        
        // Add welcome message
        addOutput(`
 ██████╗ ███████╗██╗   ██╗██████╗ ██╗██╗  ██╗
██╔═══██╗╚══███╔╝╚██╗ ██╔╝██╔══██╗██║╚██╗██╔╝
██║   ██║  ███╔╝  ╚████╔╝ ██████╔╝██║ ╚███╔╝ 
██║   ██║ ███╔╝    ╚██╔╝  ██╔══██╗██║ ██╔██╗ 
╚██████╔╝███████╗   ██║   ██║  ██║██║██╔╝ ██╗
 ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
                                             
Ozyrix Terminal v3.0
Type "help" for available commands.
Type "exit" to view the desktop.
`, 'success');
        
        // Set up event listeners
        terminalInput.addEventListener('keydown', handleTerminalInput);
        
        // Terminal button in menu
        terminalButton.addEventListener('click', () => {
            terminalContent.style.display = 'none';
            interactiveTerminal.style.display = 'flex';
            terminalInput.focus();
        });
        
        // Close help modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                helpModal.style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
        
        // Update prompt with username
        updatePrompt();
    };
    
    // Handle terminal input
    function handleTerminalInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            const command = terminalInput.value.trim();
            
            if (command) {
                // Add command to history
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                
                // Display command
                addCommandToOutput(command);
                
                // Process command
                processCommand(command);
                
                // Clear input
                terminalInput.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            
            // Auto-complete command
            const input = terminalInput.value.trim();
            const commands = [
                'help', 'clear', 'ls', 'cd', 'cat', 'whoami', 'date', 'echo',
                'ping', 'matrix', 'hack', 'decrypt', 'scan', 'exit', 'pwd',
                'mkdir', 'touch', 'rm', 'mv', 'cp', 'grep', 'find', 'sudo',
                'apt-get', 'ssh', 'telnet', 'ftp', 'wget', 'curl', 'ifconfig',
                'netstat', 'ps', 'kill', 'top', 'history', 'man', 'uname',
                'backdoor', 'easter', 'konami', 'matrix', 'screenshake'
            ];
            
            const matches = commands.filter(cmd => cmd.startsWith(input));
            
            if (matches.length === 1) {
                terminalInput.value = matches[0] + ' ';
            } else if (matches.length > 1) {
                addOutput(matches.join('  '), 'info');
            }
        } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            clearTerminal();
        } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            addCommandToOutput(terminalInput.value + '^C');
            terminalInput.value = '';
        }
    }
    
    // Add command to output
    function addCommandToOutput(command) {
        const commandLine = document.createElement('div');
        commandLine.className = 'command-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'command-prompt';
        prompt.textContent = terminalPrompt.textContent + ' ';
        
        const commandText = document.createElement('span');
        commandText.className = 'command-text';
        commandText.textContent = command;
        
        commandLine.appendChild(prompt);
        commandLine.appendChild(commandText);
        
        terminalOutput.appendChild(commandLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    // Add output to terminal
    function addOutput(text, type = '') {
        const output = document.createElement('div');
        output.className = `command-output ${type}`;
        output.textContent = text;
        
        terminalOutput.appendChild(output);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    // Clear terminal
    function clearTerminal() {
        terminalOutput.innerHTML = '';
    }
    
    // Update prompt with current directory
    function updatePrompt() {
        terminalPrompt.textContent = `${username}@ozyrix:${currentDir}$`;
    }
    
    // Process command
    function processCommand(command) {
        const args = command.split(' ');
        const cmd = args[0].toLowerCase();
        
        switch (cmd) {
            case 'help':
                showHelp();
                break;
            case 'clear':
                clearTerminal();
                break;
            case 'ls':
                listDirectory(args[1]);
                break;
            case 'cd':
                changeDirectory(args[1]);
                break;
            case 'cat':
                showFileContents(args[1]);
                break;
            case 'whoami':
                addOutput(username);
                break;
            case 'date':
                addOutput(new Date().toString());
                break;
            case 'echo':
                addOutput(args.slice(1).join(' '));
                break;
            case 'ping':
                simulatePing(args[1]);
                break;
            case 'matrix':
                toggleMatrixEffect();
                break;
            case 'hack':
                simulateHack(args[1]);
                break;
            case 'decrypt':
                simulateDecrypt(args[1]);
                break;
            case 'scan':
                simulateScan(args[1]);
                break;
            case 'exit':
                exitTerminal();
                break;
            case 'pwd':
                addOutput(currentDir);
                break;
            case 'backdoor':
                activateBackdoor();
                break;
            case 'konami':
                konamiCode();
                break;
            case 'screenshake':
                screenShake();
                break;
            case 'sudo':
                sudoCommand(args.slice(1).join(' '));
                break;
            default:
                addOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }
    }
    
    // Show help
    function showHelp() {
        helpModal.style.display = 'block';
    }
    
    // List directory contents
    function listDirectory(path) {
        const targetPath = resolvePath(path || currentDir);
        const dir = getFileSystemObject(targetPath);
        
        if (!dir || dir.type !== 'dir') {
            addOutput(`ls: cannot access '${path}': No such directory`, 'error');
            return;
        }
        
        const contents = Object.keys(dir.contents);
        if (contents.length === 0) {
            addOutput('(empty directory)');
            return;
        }
        
        // Format output with colors
        let output = '';
        contents.forEach(name => {
            const item = dir.contents[name];
            if (item.type === 'dir') {
                output += `<span style="color: #0abdc6;">${name}/</span>  `;
            } else {
                output += `${name}  `;
            }
        });
        
        const outputDiv = document.createElement('div');
        outputDiv.className = 'command-output';
        outputDiv.innerHTML = output;
        
        terminalOutput.appendChild(outputDiv);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    // Change directory
    function changeDirectory(path) {
        if (!path) {
            currentDir = `/home/${username}`;
            updatePrompt();
            return;
        }
        
        const targetPath = resolvePath(path);
        const dir = getFileSystemObject(targetPath);
        
        if (!dir) {
            addOutput(`cd: no such directory: ${path}`, 'error');
            return;
        }
        
        if (dir.type !== 'dir') {
            addOutput(`cd: not a directory: ${path}`, 'error');
            return;
        }
        
        currentDir = targetPath;
        updatePrompt();
    }
    
    // Show file contents
    function showFileContents(path) {
        if (!path) {
            addOutput('cat: missing file operand', 'error');
            return;
        }
        
        const targetPath = resolvePath(path);
        const file = getFileSystemObject(targetPath);
        
        if (!file) {
            addOutput(`cat: ${path}: No such file or directory`, 'error');
            return;
        }
        
        if (file.type !== 'file') {
            addOutput(`cat: ${path}: Is a directory`, 'error');
            return;
        }
          {
            addOutput(`cat: ${path}: Is a directory`, 'error');
            return;
        }
        
        addOutput(file.content);
    }
    
    // Resolve path (handle relative paths)
    function resolvePath(path) {
        if (!path) return currentDir;
        
        // Absolute path
        if (path.startsWith('/')) {
            return path;
        }
        
        // Home directory
        if (path === '~' || path.startsWith('~/')) {
            return path.replace('~', `/home/${username}`);
        }
        
        // Parent directory
        if (path === '..') {
            const parts = currentDir.split('/');
            parts.pop();
            return parts.join('/') || '/';
        }
        
        // Current directory
        if (path === '.') {
            return currentDir;
        }
        
        // Relative path
        return `${currentDir}/${path}`.replace(/\/\//g, '/');
    }
    
    // Get file system object from path
    function getFileSystemObject(path) {
        const parts = path.split('/').filter(p => p);
        let current = fileSystem['/'];
        
        if (path === '/') return current;
        
        for (const part of parts) {
            if (!current.contents[part]) {
                return null;
            }
            current = current.contents[part];
        }
        
        return current;
    }
    
    // Simulate ping command
    function simulatePing(host) {
        if (!host) {
            addOutput('ping: missing host operand', 'error');
            return;
        }
        
        addOutput(`PING ${host} (127.0.0.1) 56(84) bytes of data.`);
        
        let count = 0;
        const pingInterval = setInterval(() => {
            const time = Math.random() * 100;
            addOutput(`64 bytes from ${host} (127.0.0.1): icmp_seq=${count + 1} ttl=64 time=${time.toFixed(3)} ms`);
            count++;
            
            if (count >= 4) {
                clearInterval(pingInterval);
                addOutput(`\n--- ${host} ping statistics ---`);
                addOutput(`4 packets transmitted, 4 received, 0% packet loss, time 3005ms`);
                addOutput(`rtt min/avg/max/mdev = 0.123/0.456/0.789/0.123 ms`);
            }
        }, 1000);
    }
    
    // Toggle matrix effect
    function toggleMatrixEffect() {
        const matrixCanvas = document.getElementById('matrixRain');
        
        if (matrixCanvas.style.display === 'none') {
            matrixCanvas.style.display = 'block';
            addOutput('Matrix mode activated. Type "matrix" again to deactivate.', 'success');
            
            // Start matrix animation (implemented in matrix.js)
            if (typeof window.startMatrixRain === 'function') {
                window.startMatrixRain();
            }
        } else {
            matrixCanvas.style.display = 'none';
            addOutput('Matrix mode deactivated.', 'info');
            
            // Stop matrix animation
            if (typeof window.stopMatrixRain === 'function') {
                window.stopMatrixRain();
            }
        }
    }
    
    // Simulate hacking
    function simulateHack(target) {
        if (!target) {
            addOutput('hack: missing target operand', 'error');
            return;
        }
        
        addOutput(`Initiating hack on target: ${target}`, 'info');
        addOutput('Scanning for vulnerabilities...', 'info');
        
        setTimeout(() => {
            addOutput('Vulnerabilities found:', 'success');
            addOutput('- Outdated SSH server (CVE-2022-1234)', 'warning');
            addOutput('- Weak password policy', 'warning');
            addOutput('- Unpatched web server', 'warning');
            
            setTimeout(() => {
                addOutput('Exploiting vulnerabilities...', 'info');
                
                setTimeout(() => {
                    // Screen shake effect
                    screenShake();
                    
                    addOutput('ACCESS GRANTED!', 'success');
                    addOutput(`Successfully hacked into ${target}`, 'success');
                    addOutput('User credentials obtained:', 'info');
                    addOutput('Username: admin', 'info');
                    addOutput('Password: ********', 'info');
                }, 2000);
            }, 2000);
        }, 2000);
    }
    
    // Simulate decrypt
    function simulateDecrypt(file) {
        if (!file) {
            addOutput('decrypt: missing file operand', 'error');
            return;
        }
        
        addOutput(`Attempting to decrypt: ${file}`, 'info');
        addOutput('Analyzing encryption algorithm...', 'info');
        
        setTimeout(() => {
            addOutput('Encryption identified: AES-256-CBC', 'success');
            addOutput('Generating decryption keys...', 'info');
            
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 10;
                addOutput(`Decryption progress: ${progress}%`, 'info');
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    setTimeout(() => {
                        addOutput('Decryption complete!', 'success');
                        addOutput('Decrypted content:', 'info');
                        addOutput('------------------------', 'info');
                        addOutput('TOP SECRET INFORMATION', 'warning');
                        addOutput('Project Codename: OZYRIX', 'info');
                        addOutput('Status: Active', 'info');
                        addOutput('Clearance: Level 5', 'info');
                        addOutput('------------------------', 'info');
                    }, 500);
                }
            }, 500);
        }, 2000);
    }
    
    // Simulate network scan
    function simulateScan(network) {
        if (!network) {
            addOutput('scan: missing network operand', 'error');
            return;
        }
        
        addOutput(`Scanning network: ${network}`, 'info');
        addOutput('Initiating port scan...', 'info');
        
        setTimeout(() => {
            addOutput('Discovered hosts:', 'success');
            
            for (let i = 1; i <= 5; i++) {
                const ip = network.replace('0/24', i * 10);
                const ports = [];
                
                // Generate random open ports
                const numPorts = Math.floor(Math.random() * 5) + 1;
                const commonPorts = [21, 22, 23, 25, 53, 80, 443, 3306, 8080];
                
                for (let j = 0; j < numPorts; j++) {
                    ports.push(commonPorts[Math.floor(Math.random() * commonPorts.length)]);
                }
                
                addOutput(`${ip} - Open ports: ${ports.join(', ')}`, 'info');
            }
            
            addOutput('Scan complete.', 'success');
        }, 3000);
    }
    
    // Exit terminal
    function exitTerminal() {
        interactiveTerminal.style.display = 'none';
        terminalContent.style.display = 'flex';
    }
    
    // Activate backdoor (easter egg)
    function activateBackdoor() {
        addOutput('BACKDOOR ACTIVATED', 'warning');
        addOutput('Accessing restricted system areas...', 'info');
        
        setTimeout(() => {
            // Screen shake effect
            screenShake();
            
            // Change terminal color temporarily
            terminalOutput.style.color = '#ff00ff';
            
            addOutput(`
 ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄ 
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌
▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀  ▀▀▀▀█░█▀▀▀▀ 
▐░▌          ▐░▌          ▐░▌          ▐░▌               ▐░▌     
▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄▄▄ ▐░▌          ▐░█▄▄▄▄▄▄▄▄▄      ▐░▌     
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌          ▐░░░░░░░░░░░▌     ▐░▌     
 ▀▀▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀ ▐░▌          ▐░█▀▀▀▀▀▀▀▀▀      ▐░▌     
          ▐░▌▐░▌          ▐░▌          ▐░▌               ▐░▌     
 ▄▄▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄▄▄      ▐░▌     
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌     ▐░▌     
 ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀       ▀      
                                                                  
`, 'error');
            
            addOutput('You found a secret! Try the "konami" command for another easter egg.', 'success');
            
            // Reset terminal color after a delay
            setTimeout(() => {
                terminalOutput.style.color = '';
            }, 3000);
        }, 2000);
    }
    
    // Konami code easter egg
    function konamiCode() {
        addOutput('KONAMI CODE ACTIVATED!', 'success');
        addOutput('↑ ↑ ↓ ↓ ← → ← → B A', 'info');
        
        // Add 30 lives
        addOutput('30 LIVES ADDED', 'success');
        
        // Screen shake
        screenShake();
    }
    
    // Screen shake effect
    function screenShake() {
        document.body.classList.add('shake');
        
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, 500);
    }
    
    // Sudo command
    function sudoCommand(command) {
        if (!command) {
            addOutput('sudo: missing command operand', 'error');
            return;
        }
        
        addOutput('Enter password: ', 'info');
        
        // Simulate password input
        setTimeout(() => {
            addOutput('********', 'info');
            
            setTimeout(() => {
                if (Math.random() > 0.3) {
                    addOutput('Password accepted.', 'success');
                    addOutput(`Executing: ${command} with root privileges`, 'info');
                    
                    // Process the command
                    processCommand(command);
                } else {
                    addOutput('Sorry, try again.', 'error');
                }
            }, 1000);
        }, 1500);
    }
});