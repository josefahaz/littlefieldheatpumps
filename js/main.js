// Get modal elements
const modal = document.getElementById('contact-modal');
const openBtn = document.getElementById('open-modal-btn');
const closeBtn = document.querySelector('.close-btn');

// Event listeners to open and close the modal
openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

// Form submission is now handled by the 'action' attribute on the form element in index.html
