// Validation.js - Handles form validations across the application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all forms with validation
    const forms = document.querySelectorAll('.needs-validation');
    
    // Loop over forms and prevent submission if validation fails
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!validateForm(form)) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
        
        // Add live validation on input
        addLiveValidation(form);
    });
    
    // Initialize special validation fields
    initializePasswordValidation();
    initializeEmailValidation();
    initializeDateValidation();
    initializePhoneValidation();
});

// Validate entire form
function validateForm(form) {
    let isValid = true;
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            setInvalidState(field, 'This field is required');
            isValid = false;
        } else {
            clearInvalidState(field);
        }
    });
    
    // Check email fields
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !validateEmail(field.value)) {
            setInvalidState(field, 'Please enter a valid email address');
            isValid = false;
        }
    });
    
    // Check numeric fields
    const numericFields = form.querySelectorAll('input[type="number"], input[data-type="numeric"]');
    numericFields.forEach(field => {
        if (field.value && !validateNumeric(field.value, field.min, field.max)) {
            const message = field.min && field.max 
                ? `Please enter a number between ${field.min} and ${field.max}` 
                : 'Please enter a valid number';
            setInvalidState(field, message);
            isValid = false;
        }
    });
    
    // Check date fields
    const dateFields = form.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        if (field.value && !validateDate(field.value, field.min, field.max)) {
            setInvalidState(field, 'Please enter a valid date');
            isValid = false;
        }
    });
    
    // Check phone fields
    const phoneFields = form.querySelectorAll('input[data-type="phone"]');
    phoneFields.forEach(field => {
        if (field.value && !validatePhone(field.value)) {
            setInvalidState(field, 'Please enter a valid phone number');
            isValid = false;
        }
    });
    
    // Check password fields
    const passwordFields = form.querySelectorAll('input[type="password"][data-min-length]');
    passwordFields.forEach(field => {
        const minLength = parseInt(field.getAttribute('data-min-length'), 10) || 8;
        if (field.value && field.value.length < minLength) {
            setInvalidState(field, `Password must be at least ${minLength} characters long`);
            isValid = false;
        }
    });
    
    // Check password confirmation
    const confirmPasswordFields = form.querySelectorAll('input[data-match]');
    confirmPasswordFields.forEach(field => {
        const targetId = field.getAttribute('data-match');
        const targetField = document.getElementById(targetId);
        if (targetField && field.value !== targetField.value) {
            setInvalidState(field, 'Passwords do not match');
            isValid = false;
        }
    });
    
    return isValid;
}

// Add live validation to form fields
function addLiveValidation(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
        field.addEventListener('blur', () => {
            // Skip validation if field is empty and not required
            if (!field.value && !field.hasAttribute('required')) {
                clearInvalidState(field);
                return;
            }
            
            // Validate field based on type
            let isValid = true;
            let errorMessage = '';
            
            if (field.type === 'email') {
                isValid = validateEmail(field.value);
                errorMessage = 'Please enter a valid email address';
            } else if (field.type === 'number' || field.getAttribute('data-type') === 'numeric') {
                isValid = validateNumeric(field.value, field.min, field.max);
                errorMessage = 'Please enter a valid number';
            } else if (field.type === 'date') {
                isValid = validateDate(field.value, field.min, field.max);
                errorMessage = 'Please enter a valid date';
            } else if (field.getAttribute('data-type') === 'phone') {
                isValid = validatePhone(field.value);
                errorMessage = 'Please enter a valid phone number';
            } else if (field.type === 'password' && field.getAttribute('data-min-length')) {
                const minLength = parseInt(field.getAttribute('data-min-length'), 10) || 8;
                isValid = field.value.length >= minLength;
                errorMessage = `Password must be at least ${minLength} characters long`;
            } else if (field.hasAttribute('data-match')) {
                const targetId = field.getAttribute('data-match');
                const targetField = document.getElementById(targetId);
                isValid = targetField && field.value === targetField.value;
                errorMessage = 'Passwords do not match';
            } else if (field.hasAttribute('required')) {
                isValid = field.value.trim() !== '';
                errorMessage = 'This field is required';
            }
            
            if (!isValid) {
                setInvalidState(field, errorMessage);
            } else {
                clearInvalidState(field);
            }
        });
    });
}

// Set invalid state for a field
function setInvalidState(field, message) {
    field.classList.add('is-invalid');
    
    // Find or create the invalid feedback div
    let feedbackElement = field.nextElementSibling;
    if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
        feedbackElement = document.createElement('div');
        feedbackElement.className = 'invalid-feedback';
        field.parentNode.insertBefore(feedbackElement, field.nextSibling);
    }
    
    feedbackElement.textContent = message;
}

// Clear invalid state for a field
function clearInvalidState(field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
}

// Email validation
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Numeric validation
function validateNumeric(value, min, max) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < parseFloat(min)) return false;
    if (max !== undefined && num > parseFloat(max)) return false;
    return true;
}

// Date validation
function validateDate(value, min, max) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    
    if (min) {
        const minDate = new Date(min);
        if (date < minDate) return false;
    }
    
    if (max) {
        const maxDate = new Date(max);
        if (date > maxDate) return false;
    }
    
    return true;
}

// Phone validation
function validatePhone(phone) {
    // Basic phone validation - allowing various formats
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(String(phone).trim());
}

// Initialize password validation with strength meter
function initializePasswordValidation() {
    const passwordFields = document.querySelectorAll('input[type="password"][data-show-strength]');
    
    passwordFields.forEach(field => {
        // Create strength meter container
        const container = document.createElement('div');
        container.className = 'password-strength mt-2';
        container.innerHTML = `
            <div class="progress" style="height: 5px;">
                <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <small class="form-text mt-1">Password strength: <span class="strength-text">Too weak</span></small>
        `;
        
        // Insert after password field
        field.parentNode.insertBefore(container, field.nextSibling);
        
        const progressBar = container.querySelector('.progress-bar');
        const strengthText = container.querySelector('.strength-text');
        
        // Add input event listener
        field.addEventListener('input', () => {
            const strength = calculatePasswordStrength(field.value);
            
            // Update progress bar
            progressBar.style.width = `${strength.score * 25}%`;
            progressBar.className = `progress-bar bg-${strength.className}`;
            progressBar.setAttribute('aria-valuenow', strength.score * 25);
            
            // Update strength text
            strengthText.textContent = strength.label;
        });
    });
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 10) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Normalize score to 0-4 range
    score = Math.min(Math.floor(score / 1.5), 4);
    
    // Define labels and classes
    const labels = ['Too weak', 'Weak', 'Medium', 'Strong', 'Very strong'];
    const classes = ['danger', 'danger', 'warning', 'info', 'success'];
    
    return {
        score: score,
        label: labels[score],
        className: classes[score]
    };
}

// Initialize email validation with domain check
function initializeEmailValidation() {
    const emailFields = document.querySelectorAll('input[type="email"][data-validate-domain]');
    
    emailFields.forEach(field => {
        field.addEventListener('blur', () => {
            if (field.value && validateEmail(field.value)) {
                const domain = field.value.split('@')[1];
                
                // Common typos in domain names
                const commonDomains = {
                    'gmail.com': ['gmail.co', 'gmail.cm', 'gmial.com', 'gmail.con', 'gamil.com'],
                    'yahoo.com': ['yahoo.co', 'yaho.com', 'yahoo.cm', 'yahoo.con'],
                    'hotmail.com': ['hotmail.co', 'hotmail.cm', 'hotmal.com', 'hotmail.con'],
                    'outlook.com': ['outlook.co', 'outlook.cm', 'outlook.con']
                };
                
                // Check for possible typos
                for (const [correctDomain, typos] of Object.entries(commonDomains)) {
                    if (typos.includes(domain)) {
                        const suggestion = field.value.replace(domain, correctDomain);
                        
                        // Create suggestion element
                        let suggestionElement = field.nextElementSibling;
                        if (!suggestionElement || !suggestionElement.classList.contains('email-suggestion')) {
                            suggestionElement = document.createElement('div');
                            suggestionElement.className = 'email-suggestion alert alert-info mt-2 py-2';
                            field.parentNode.insertBefore(suggestionElement, field.nextSibling);
                        }
                        
                        suggestionElement.innerHTML = `
                            Did you mean <a href="#" class="suggested-email">${suggestion}</a>?
                        `;
                        
                        // Add click handler for suggestion
                        suggestionElement.querySelector('.suggested-email').addEventListener('click', (e) => {
                            e.preventDefault();
                            field.value = suggestion;
                            suggestionElement.remove();
                            field.classList.remove('is-invalid');
                            field.classList.add('is-valid');
                        });
                        
                        break;
                    }
                }
            }
        });
    });
}

// Initialize date validation with min/max date logic
function initializeDateValidation() {
    const dateFields = document.querySelectorAll('input[type="date"][data-min-days], input[type="date"][data-max-days]');
    
    dateFields.forEach(field => {
        const minDays = field.getAttribute('data-min-days');
        const maxDays = field.getAttribute('data-max-days');
        
        // Set min date if specified
        if (minDays) {
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + parseInt(minDays, 10));
            field.min = minDate.toISOString().split('T')[0];
        }
        
        // Set max date if specified
        if (maxDays) {
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + parseInt(maxDays, 10));
            field.max = maxDate.toISOString().split('T')[0];
        }
    });
}

// Initialize phone validation with formatting
function initializePhoneValidation() {
    const phoneFields = document.querySelectorAll('input[data-type="phone"]');
    
    phoneFields.forEach(field => {
        field.addEventListener('input', (e) => {
            // Get only digits from input
            let input = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (input.length > 10) {
                input = input.substring(0, 10);
            }
            
            // Format phone number
            if (input.length > 3 && input.length <= 6) {
                e.target.value = `(${input.substring(0, 3)}) ${input.substring(3)}`;
            } else if (input.length > 6) {
                e.target.value = `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6)}`;
            } else if (input.length <= 3) {
                e.target.value = input;
            }
        });
    });
}