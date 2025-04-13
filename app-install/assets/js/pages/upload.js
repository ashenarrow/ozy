// Upload page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_URL = 'http://localhost:3000/api';
    
    // DOM Elements
    const uploadForm = document.getElementById('uploadForm');
    const appFile = document.getElementById('appFile');
    const fileUploadPlaceholder = document.getElementById('fileUploadPlaceholder');
    const fileUploadPreview = document.getElementById('fileUploadPreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressText = document.getElementById('uploadProgressText');
    const uploadSuccessModal = document.getElementById('uploadSuccessModal');
    const uploadedAppDetails = document.getElementById('uploadedAppDetails');
    const viewAppBtn = document.getElementById('viewAppBtn');
    const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
    const closeModal = document.querySelector('.close-modal');
    
    // File selection
    appFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            showFilePreview(file);
        }
    });
    
    // Remove file
    removeFile.addEventListener('click', () => {
        appFile.value = '';
        fileUploadPlaceholder.style.display = 'flex';
        fileUploadPreview.style.display = 'none';
    });
    
    // Show file preview
    function showFilePreview(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileUploadPlaceholder.style.display = 'none';
        fileUploadPreview.style.display = 'flex';
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Form submission
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(uploadForm);
        const file = appFile.files[0];
        
        if (!file) {
            alert('Please select a file to upload');
            return;
        }
        
        // Update status
        const statusIndicator = uploadStatus.querySelector('.status-indicator');
        statusIndicator.className = 'status-indicator uploading';
        statusIndicator.textContent = 'TRANSMISSION IN PROGRESS';
        
        const progressContainer = uploadStatus.querySelector('.progress-container');
        progressContainer.style.display = 'block';
        
        // Simulate upload progress (since fetch doesn't provide progress events easily)
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            
            uploadProgress.style.width = `${progress}%`;
            uploadProgressText.textContent = `${Math.round(progress)}%`;
            
            if (progress === 100) {
                clearInterval(progressInterval);
            }
        }, 300);
        
        // Send the upload request
        fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            clearInterval(progressInterval);
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            return response.json();
        })
        .then(data => {
            // Update status
            statusIndicator.className = 'status-indicator success';
            statusIndicator.textContent = 'TRANSMISSION SUCCESSFUL';
            uploadProgress.style.width = '100%';
            uploadProgressText.textContent = '100%';
            
            // Show success modal
            showUploadSuccess(data);
        })
        .catch(error => {
            clearInterval(progressInterval);
            
            console.error('Error uploading app:', error);
            
            // Update status
            statusIndicator.className = 'status-indicator error';
            statusIndicator.textContent = 'TRANSMISSION FAILED';
            uploadProgress.style.width = '0%';
            uploadProgressText.textContent = 'ERROR';
            
            alert('Failed to upload application. Please try again.');
        });
    });
    
    // Show upload success modal
    function showUploadSuccess(app) {
        uploadedAppDetails.innerHTML = `
            <div class="app-details-success">
                <div class="detail-item">
                    <span class="detail-label">NAME:</span>
                    <span class="detail-value">${app.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">SIZE:</span>
                    <span class="detail-value">${formatFileSize(app.fileSize)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">UPLOAD DATE:</span>
                    <span class="detail-value">${new Date(app.uploadDate).toLocaleString()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">APP ID:</span>
                    <span class="detail-value">${app.uuid}</span>
                </div>
            </div>
        `;
        
        // Store app UUID for view button
        viewAppBtn.setAttribute('data-uuid', app.uuid);
        
        uploadSuccessModal.style.display = 'block';
    }
    
    // View uploaded app
    viewAppBtn.addEventListener('click', () => {
        const appUuid = viewAppBtn.getAttribute('data-uuid');
        if (appUuid) {
            // Open the store page in the parent frame and close the modal
            window.parent.document.querySelector('[data-page="store.html"]').click();
            uploadSuccessModal.style.display = 'none';
            
            // We could also pass the app UUID to the store page to highlight it
        }
    });
    
    // Upload another app
    uploadAnotherBtn.addEventListener('click', () => {
        uploadSuccessModal.style.display = 'none';
        uploadForm.reset();
        fileUploadPlaceholder.style.display = 'flex';
        fileUploadPreview.style.display = 'none';
        
        // Reset status
        const statusIndicator = uploadStatus.querySelector('.status-indicator');
        statusIndicator.className = 'status-indicator ready';
        statusIndicator.textContent = 'READY FOR TRANSMISSION';
        
        const progressContainer = uploadStatus.querySelector('.progress-container');
        progressContainer.style.display = 'none';
    });
    
    // Close modal
    closeModal.addEventListener('click', () => {
        uploadSuccessModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === uploadSuccessModal) {
            uploadSuccessModal.style.display = 'none';
        }
    });
    
    // Drag and drop functionality
    const dropArea = document.querySelector('.file-upload-ui');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        if (file) {
            appFile.files = dt.files;
            showFilePreview(file);
        }
    }
});