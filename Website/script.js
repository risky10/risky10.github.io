document.querySelector('.login-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    let hasError = false;

    // Clear previous error messages
    document.getElementById('username-error').textContent = '';
    document.getElementById('password-error').textContent = '';

    // Validate Username
    if (username === '') {
        document.getElementById('username-error').textContent = 'Please enter your username.';
        hasError = true;
    }

    // Validate Password
    if (password === '') {
        document.getElementById('password-error').textContent = 'Please enter your password.';
        hasError = true;
    }

    if (!hasError) {
        window.location.href = 'main.html';
        // Here you would normally handle the login (e.g., send data to a server)
    }
});

// Toggle password visibility
document.getElementById('password').insertAdjacentHTML('afterend', '<span class="toggle-password">Show</span>');

document.querySelector('.toggle-password').addEventListener('click', function() {
    const passwordField = document.getElementById('password');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        this.textContent = 'Hide';
    } else {
        passwordField.type = 'password';
        this.textContent = 'Show';
    }
});
