/**
 * AJAX form submission handler for callback form, help from ChatGPT
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('callbackForm');
        if (!form) return;

        // Track if form has been submitted at least once
        let hasBeenSubmitted = false;

        // Create success message container
        const successContainer = document.createElement('div');
        successContainer.className = 'callback-form-success';
        successContainer.style.display = 'none';
        form.insertBefore(successContainer, form.firstChild);

        // Validation rules matching server-side
        const validationRules = {
            Name: {
                required: true,
                message: 'Name is required'
            },
            Email: {
                required: true,
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Invalid email address format'
            },
            Phone: {
                required: true,
                pattern: /^(\+46[1-9]\d{8}|0[1-9]\d{8})$/,
                message: 'Invalid phone number'
            },
            SelectedOption: {
                required: true,
                message: 'Please select an option'
            }
        };

        // Setup live validation for all inputs
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            // Validate on blur and input (after first submit)
            input.addEventListener('blur', function() {
                if (hasBeenSubmitted) {
                    validateField(input);
                }
            });

            // For text inputs, validate on input
            if (input.tagName === 'INPUT') {
                input.addEventListener('input', function() {
                    if (hasBeenSubmitted) {
                        validateField(input);
                    }
                });
            }
            // For select, validate on change
            else if (input.tagName === 'SELECT') {
                input.addEventListener('change', function() {
                    if (hasBeenSubmitted) {
                        validateField(input);
                    }
                });
            }
        });

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            hasBeenSubmitted = true;

            // Hide success message if visible
            successContainer.style.display = 'none';
            successContainer.textContent = '';
            successContainer.style.color = '';

            // Clear previous validation errors
            clearValidationErrors(form);

            // Disable submit button
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            try {
                const formData = new FormData(form);
                
                // Get the form action URL
                const formAction = form.getAttribute('action') || form.action;
                
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response');
                }

                const result = await response.json();

                if (result.success) {
                    // Success - show success message and reset form
                    successContainer.textContent = result.message || 'Form submitted successfully!';
                    successContainer.style.display = 'block';
                    form.reset();
                    hasBeenSubmitted = false; // Reset flag on success
                    
                    // Scroll to success message
                    successContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    // Validation errors - display them
                    displayValidationErrors(form, result.errors);
                    
                    // Scroll to first error (without focus)
                    const firstError = form.querySelector('.callback-form-validation:not(:empty)');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
                successContainer.textContent = 'An error occurred. Please try again.';
                successContainer.style.display = 'block';
                successContainer.style.color = '#ef4444';
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });

        function validateField(input) {
            const fieldName = input.name;
            const rule = validationRules[fieldName];
            if (!rule) return;

            const value = input.value.trim();
            let isValid = true;
            let errorMessage = '';

            // Check required
            if (rule.required && !value) {
                isValid = false;
                errorMessage = rule.message;
            }
            // Check pattern
            else if (rule.pattern && value && !rule.pattern.test(value)) {
                isValid = false;
                errorMessage = rule.message;
            }

            // Update UI
            const fieldContainer = input.closest('.callback-form-field');
            if (fieldContainer) {
                let validationSpan = fieldContainer.querySelector('.callback-form-validation');
                if (!validationSpan) {
                    validationSpan = document.createElement('span');
                    validationSpan.className = 'callback-form-validation';
                    fieldContainer.appendChild(validationSpan);
                }

                if (isValid) {
                    input.classList.remove('input-validation-error');
                    validationSpan.textContent = '';
                } else {
                    input.classList.add('input-validation-error');
                    validationSpan.textContent = errorMessage;
                }
            }
        }

        function clearValidationErrors(form) {
            // Clear all validation error messages
            const errorSpans = form.querySelectorAll('.callback-form-validation');
            errorSpans.forEach(span => {
                span.textContent = '';
            });

            // Remove error classes from inputs
            const errorInputs = form.querySelectorAll('.input-validation-error');
            errorInputs.forEach(input => {
                input.classList.remove('input-validation-error');
            });
        }

        function displayValidationErrors(form, errors) {
            if (!errors) return;

            Object.keys(errors).forEach(fieldName => {
                const fieldErrors = errors[fieldName];
                if (!fieldErrors || fieldErrors.length === 0) return;

                // Find the input field
                const input = form.querySelector(`[name="${fieldName}"]`);
                if (!input) return;

                // Add error class to input
                input.classList.add('input-validation-error');

                // Find or create validation span
                const fieldContainer = input.closest('.callback-form-field');
                if (fieldContainer) {
                    let validationSpan = fieldContainer.querySelector('.callback-form-validation');
                    if (!validationSpan) {
                        validationSpan = document.createElement('span');
                        validationSpan.className = 'callback-form-validation';
                        fieldContainer.appendChild(validationSpan);
                    }
                    
                    // Display first error message
                    validationSpan.textContent = fieldErrors[0];
                }
            });
        }
    });
})();

