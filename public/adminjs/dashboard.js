// Dashboard.js - Handles the dashboard-specific functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Initialize all popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    
    // For UI-only demo - instead of loading from backend, show the demo content right away
    animateDashboardElements();
});

// Get appropriate CSS class for appointment status
function getStatusClass(status) {
    switch(status) {
        case 'Scheduled':
            return 'badge-scheduled';
        case 'Confirmed':
            return 'badge-confirmed';
        case 'Completed':
            return 'badge-completed';
        case 'Cancelled':
            return 'badge-cancelled';
        default:
            return 'bg-secondary';
    }
}

// Show toast notifications
function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create unique ID for the toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast HTML
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${title}</strong>
                <small>Just now</small>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Initialize and show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { 
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Add animation classes to dashboard elements
function animateDashboardElements() {
    // Add fade-in class to stats cards with incremental delays
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        card.classList.add(`fade-in-delay-${index + 1}`);
    });
    
    // Add fade-in class to chart container
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.classList.add('fade-in-delay-2');
    }
    
    // Add fade-in class to appointment list title
    const appointmentTitle = document.querySelector('#todayAppointmentsTitle');
    if (appointmentTitle) {
        appointmentTitle.classList.add('fade-in-delay-1');
    }
}