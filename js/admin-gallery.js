/**
 * Admin Gallery Management
 * Handles photo uploads and gallery management
 */

document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('photo-upload-form');
    const photoFile = document.getElementById('photo-file');
    const photoPreview = document.getElementById('photo-preview');
    const previewContainer = document.getElementById('preview-container');
    
    // Load existing photos
    loadGalleryPhotos();
    
    // Photo preview on file select
    if (photoFile) {
        photoFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    photoFile.value = '';
                    previewContainer.style.display = 'none';
                    return;
                }
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    photoFile.value = '';
                    previewContainer.style.display = 'none';
                    return;
                }
                
                // Show preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoPreview.src = e.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }
    
    // Handle form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            uploadPhoto();
        });
    }
    
    // Upload photo function
    function uploadPhoto() {
        const formData = new FormData(uploadForm);
        
        // Show loading state
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        submitBtn.disabled = true;
        
        fetch('../server/api/upload-photo.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Photo uploaded successfully!', 'success');
                uploadForm.reset();
                previewContainer.style.display = 'none';
                loadGalleryPhotos();
            } else {
                showNotification('Error: ' + (data.error || 'Upload failed'), 'error');
            }
        })
        .catch(error => {
            console.error('Upload error:', error);
            showNotification('Error uploading photo: ' + error.message, 'error');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }
    
    // Load gallery photos
    function loadGalleryPhotos() {
        fetch('../server/api/get-photos.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayPhotos(data.photos);
            } else {
                console.error('Error loading photos:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading photos:', error);
        });
    }
    
    // Display photos in galleries
    function displayPhotos(photos) {
        const installationsGallery = document.getElementById('installations-gallery');
        const maintenanceGallery = document.getElementById('maintenance-gallery');
        const gasGallery = document.getElementById('gas-gallery');
        
        // Clear existing content
        installationsGallery.innerHTML = '';
        maintenanceGallery.innerHTML = '';
        gasGallery.innerHTML = '';
        
        // Sort photos by date (newest first)
        photos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        // Distribute photos to appropriate galleries
        photos.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            
            switch(photo.category) {
                case 'installations':
                    installationsGallery.appendChild(photoCard);
                    break;
                case 'maintenance':
                    maintenanceGallery.appendChild(photoCard);
                    break;
                case 'gas':
                    gasGallery.appendChild(photoCard);
                    break;
            }
        });
        
        // Show empty messages if no photos
        if (installationsGallery.children.length === 0) {
            installationsGallery.innerHTML = '<p style="text-align: center; color: #666;">No photos yet. Upload your first installation photo!</p>';
        }
        if (maintenanceGallery.children.length === 0) {
            maintenanceGallery.innerHTML = '<p style="text-align: center; color: #666;">No photos yet. Upload your first maintenance photo!</p>';
        }
        if (gasGallery.children.length === 0) {
            gasGallery.innerHTML = '<p style="text-align: center; color: #666;">No photos yet. Upload your first gas system photo!</p>';
        }
    }
    
    // Create photo card element
    function createPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'gallery-photo-card';
        
        const categoryClass = {
            'installations': 'badge-installations',
            'maintenance': 'badge-maintenance',
            'gas': 'badge-gas'
        }[photo.category] || '';
        
        const categoryName = {
            'installations': 'Installation',
            'maintenance': 'Maintenance',
            'gas': 'Gas System'
        }[photo.category] || photo.category;
        
        card.innerHTML = `
            <img src="${photo.path}" alt="${photo.title}">
            <div class="gallery-photo-info">
                <span class="category-badge ${categoryClass}">${categoryName}</span>
                <h4>${photo.title}</h4>
                <p>${photo.description || 'No description'}</p>
                <small style="color: #999;">Uploaded: ${formatDate(photo.uploadDate)}</small>
                <div class="gallery-photo-actions">
                    <button class="btn-edit" onclick="editPhoto('${photo.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deletePhoto('${photo.id}', '${photo.title}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});

// Global functions for photo actions
function editPhoto(photoId) {
    const newTitle = prompt('Enter new title:');
    if (!newTitle) return;
    
    const newDescription = prompt('Enter new description:');
    
    fetch('../server/api/update-photo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: photoId,
            title: newTitle,
            description: newDescription
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Photo updated successfully!');
            location.reload();
        } else {
            alert('Error updating photo: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating photo');
    });
}

function deletePhoto(photoId, photoTitle) {
    if (!confirm(`Are you sure you want to delete "${photoTitle}"? This cannot be undone.`)) {
        return;
    }
    
    fetch('../server/api/delete-photo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: photoId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Photo deleted successfully!');
            location.reload();
        } else {
            alert('Error deleting photo: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting photo');
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
