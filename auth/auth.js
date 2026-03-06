// Authentication Logic
// Uses global supabaseClient from supabaseClient.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Check if user is already logged in
    checkExistingSession();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Show loading state
        loginButton.disabled = true;
        loginButton.textContent = 'Signing in...';
        hideMessages();

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            // Successful login
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            
            let userFriendlyMessage = 'Login failed. Please try again.';
            
            if (error.message.includes('Invalid login credentials')) {
                userFriendlyMessage = 'Invalid email or password.';
            } else if (error.message.includes('Too many requests')) {
                userFriendlyMessage = 'Too many login attempts. Please try again later.';
            } else if (error.message.includes('Email not confirmed')) {
                userFriendlyMessage = 'Please confirm your email address before logging in.';
            }
            
            showError(userFriendlyMessage);
            
            // Reset button state
            loginButton.disabled = false;
            loginButton.textContent = 'Sign In';
        }
    });
});

// Check if user is already logged in
async function checkExistingSession() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (session && !error) {
            // User is already logged in, redirect to admin
            window.location.href = 'admin.html';
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}
