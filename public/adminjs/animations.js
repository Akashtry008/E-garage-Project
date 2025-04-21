// Animations.js - Handles custom animations across the application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initializeFadeInAnimations();
    initializeCardAnimations();
    initializeButtonAnimations();
    initializeTableRowAnimations();
    initializeAlertAnimations();
    initializeModalAnimations();
});

// Initialize fade-in animations for page elements
function initializeFadeInAnimations() {
    // Add fade-in class to elements with data-animate="fade-in" attribute
    const fadeElements = document.querySelectorAll('[data-animate="fade-in"]');
    
    fadeElements.forEach((element, index) => {
        // Get delay from attribute or use index-based delay
        const delay = element.getAttribute('data-animate-delay') || (index * 0.1);
        
        // Apply animation with delay
        element.style.opacity = '0';
        element.style.animation = `fadeIn 0.5s ease-out ${delay}s forwards`;
    });
}

// Initialize card hover animations
function initializeCardAnimations() {
    const cards = document.querySelectorAll('.card, .dashboard-card');
    
    cards.forEach(card => {
        // Skip cards that should not be animated
        if (card.hasAttribute('data-no-animation')) return;
        
        // Add hover animation
        card.addEventListener('mouseenter', () => {
            // Skip animation if disabled in attribute
            if (card.hasAttribute('data-no-hover')) return;
            
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            if (card.hasAttribute('data-no-hover')) return;
            
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Initialize button animations
function initializeButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Skip buttons that should not be animated
        if (button.hasAttribute('data-no-animation')) return;
        
        // Add hover animation
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.transition = 'transform 0.2s ease';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
        
        // Add click animation
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-2px)';
        });
    });
}

// Initialize table row animations
function initializeTableRowAnimations() {
    const tables = document.querySelectorAll('table.table-hover');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach((row, index) => {
            // Add animation class with delay based on index
            row.style.opacity = '0';
            row.style.animation = `fadeIn 0.5s ease-out ${index * 0.05}s forwards`;
            
            // Add hover effect
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.1)';
                row.style.transition = 'background-color 0.2s ease';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
            });
        });
    });
}

// Initialize alert animations
function initializeAlertAnimations() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        // Add animation class
        alert.style.animation = 'slideInDown 0.5s ease-out forwards';
        
        // Add auto-dismiss if specified
        if (alert.hasAttribute('data-auto-dismiss')) {
            const delay = parseInt(alert.getAttribute('data-auto-dismiss'), 10) || 5000;
            
            setTimeout(() => {
                // Add slide-out animation
                alert.style.animation = 'slideOutUp 0.5s ease-in forwards';
                
                // Remove after animation completes
                setTimeout(() => {
                    alert.remove();
                }, 500);
            }, delay);
        }
        
        // Add click-to-dismiss functionality
        const closeButton = alert.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                alert.style.animation = 'slideOutUp 0.5s ease-in forwards';
                
                setTimeout(() => {
                    alert.remove();
                }, 500);
            });
        }
    });
}

// Initialize modal animations
function initializeModalAnimations() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('show.bs.modal', () => {
            const modalDialog = modal.querySelector('.modal-dialog');
            modalDialog.style.transform = 'scale(0.8)';
            modalDialog.style.opacity = '0';
            
            setTimeout(() => {
                modalDialog.style.transform = 'scale(1)';
                modalDialog.style.opacity = '1';
                modalDialog.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            }, 10);
        });
        
        modal.addEventListener('hide.bs.modal', () => {
            const modalDialog = modal.querySelector('.modal-dialog');
            modalDialog.style.transform = 'scale(0.8)';
            modalDialog.style.opacity = '0';
            modalDialog.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
        });
    });
}

// Create wave effect on button click
function createRippleEffect(event, element) {
    const button = element || this;
    
    // Create ripple element
    const ripple = document.createElement('span');
    button.appendChild(ripple);
    
    // Get position and size
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    // Set size and position
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - (button.getBoundingClientRect().left + radius)}px`;
    ripple.style.top = `${event.clientY - (button.getBoundingClientRect().top + radius)}px`;
    
    // Add ripple class
    ripple.className = 'ripple';
    
    // Remove after animation completes
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to buttons if desired
function addRippleEffectToButtons() {
    const buttons = document.querySelectorAll('.btn[data-ripple="true"]');
    
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
        
        // Add position relative if not already set
        if (getComputedStyle(button).position !== 'relative') {
            button.style.position = 'relative';
        }
        
        // Add overflow hidden if not already set
        if (getComputedStyle(button).overflow !== 'hidden') {
            button.style.overflow = 'hidden';
        }
    });
}

// Add custom slideUp and slideDown animations
function slideUp(element, duration = 300) {
    element.style.height = `${element.offsetHeight}px`;
    element.style.transitionProperty = 'height, margin, padding';
    element.style.transitionDuration = `${duration}ms`;
    element.style.overflow = 'hidden';
    
    // Trigger reflow
    element.offsetHeight;
    
    element.style.height = '0';
    element.style.paddingTop = '0';
    element.style.paddingBottom = '0';
    element.style.marginTop = '0';
    element.style.marginBottom = '0';
    
    setTimeout(() => {
        element.style.display = 'none';
        element.style.removeProperty('height');
        element.style.removeProperty('padding-top');
        element.style.removeProperty('padding-bottom');
        element.style.removeProperty('margin-top');
        element.style.removeProperty('margin-bottom');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition-duration');
        element.style.removeProperty('transition-property');
    }, duration);
}

function slideDown(element, duration = 300) {
    element.style.removeProperty('display');
    let display = window.getComputedStyle(element).display;
    if (display === 'none') display = 'block';
    element.style.display = display;
    
    const height = element.offsetHeight;
    element.style.overflow = 'hidden';
    element.style.height = '0';
    element.style.paddingTop = '0';
    element.style.paddingBottom = '0';
    element.style.marginTop = '0';
    element.style.marginBottom = '0';
    
    // Trigger reflow
    element.offsetHeight;
    
    element.style.transitionProperty = 'height, margin, padding';
    element.style.transitionDuration = `${duration}ms`;
    element.style.height = `${height}px`;
    element.style.removeProperty('padding-top');
    element.style.removeProperty('padding-bottom');
    element.style.removeProperty('margin-top');
    element.style.removeProperty('margin-bottom');
    
    setTimeout(() => {
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition-duration');
        element.style.removeProperty('transition-property');
    }, duration);
}

// Export utility functions for use in other files
window.AnimationUtils = {
    fadeIn: initializeFadeInAnimations,
    ripple: createRippleEffect,
    slideUp: slideUp,
    slideDown: slideDown
};