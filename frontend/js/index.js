document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user) {
        // Redirect based on role
        if (user.role === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (user.role === 'lecturer') {
            window.location.href = 'lecturer-dashboard.html';
        } else if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        }
    }
    
    // Login form submission
    document.getElementById("loginForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const role = document.getElementById("role").value.toLowerCase();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const loginButton = document.querySelector("#loginForm button[type='submit']");
        const errorMessage = document.getElementById("errorMessage");

        // Reset error message
        errorMessage.textContent = "";
        errorMessage.style.display = "none";

        // Basic form validation
        if (!role || !email || !password) {
            errorMessage.textContent = "Please fill in all fields.";
            errorMessage.style.display = "block";
            return;
        }

        // Disable button and show loading state
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging in...';

        try {
            const response = await fetch("https://cesstig-sms.onrender.com/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // Redirect based on role
                if (data.user.role === 'student') {
                    window.location.href = "student-dashboard.html";
                } else if (data.user.role === 'lecturer') {
                    window.location.href = "lecturer-dashboard.html";
                } else if (data.user.role === 'admin') {
                    window.location.href = "admin-dashboard.html";
                }
            } else {
                errorMessage.textContent = data.message;
                errorMessage.style.display = "block";
            }
        } catch (error) {
            console.error("Login error:", error);
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.style.display = "block";
        } finally {
            // Re-enable button
            loginButton.disabled = false;
            loginButton.innerHTML = "Login";
        }
    });

    // Password visibility toggle
    document.getElementById("togglePassword").addEventListener("click", function () {
        const passwordField = document.getElementById("password");
        const toggleIcon = this.querySelector("i");

        if (passwordField.type === "password") {
            passwordField.type = "text";
            toggleIcon.classList.remove("fa-eye");
            toggleIcon.classList.add("fa-eye-slash");
        } else {
            passwordField.type = "password";
            toggleIcon.classList.remove("fa-eye-slash");
            toggleIcon.classList.add("fa-eye");
        }
    });
    
    // Forgot password link
    document.getElementById("forgotPassword").addEventListener("click", function(e) {
        e.preventDefault();
        
        const email = document.getElementById("email").value;
        
        if (!email) {
            alert("Please enter your email address first.");
            return;
        }
        
        if (confirm(`A password reset link will be sent to ${email}. Continue?`)) {
            fetch("https://cesstig-sms.onrender.com/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred. Please try again.");
            });
        }
    });
});