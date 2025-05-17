    // Password strength checker
    function checkPasswordStrength(password) {
      const strength = {
        0: { color: '#ff4444', width: '20%' },
        1: { color: '#ff4444', width: '40%' },
        2: { color: '#ffbb33', width: '60%' },
        3: { color: '#00C851', width: '80%' },
        4: { color: '#00C851', width: '100%' }
      };
      
      let score = 0;
      if (password.length >= 8) score++;
      if (password.match(/[A-Z]/)) score++;
      if (password.match(/[0-9]/)) score++;
      if (password.match(/[^A-Za-z0-9]/)) score++;
      
      return strength[Math.min(score, 4)];
    }

    // Real-time password validation
    document.getElementById('password').addEventListener('input', function(e) {
      const strength = checkPasswordStrength(e.target.value);
      const strengthBar = document.getElementById('passwordStrength');
      strengthBar.style.background = strength.color;
      strengthBar.style.width = strength.width;
    });

    // Password match checker
    document.getElementById('confirmPassword').addEventListener('input', function() {
      const password = document.getElementById('password').value;
      const confirm = this.value;
      const errorElement = document.getElementById('passwordError');
      
      if (password && confirm && password !== confirm) {
        errorElement.style.display = 'block';
        this.style.borderColor = '#ff4444';
      } else {
        errorElement.style.display = 'none';
        this.style.borderColor = 'rgba(255,255,255,0.1)';
      }
    });

    // Toggle password visibility
    function togglePasswordVisibility() {
      const show = document.getElementById('showPassword').checked;
      document.getElementById('password').type = show ? 'text' : 'password';
      document.getElementById('confirmPassword').type = show ? 'text' : 'password';
    }

    // Enhanced register function
    async function register() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const btn = document.getElementById('registerBtn');
      const buttonText = document.getElementById('buttonText');
      const loader = document.getElementById('buttonLoader');

      // Show loading state
      btn.disabled = true;
      buttonText.textContent = 'Creating Account...';
      loader.style.display = 'block';

      try {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match!");
        }

        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // Show success state
        document.getElementById('successMessage').style.display = 'block';
        btn.style.background = '#00C851';
        buttonText.textContent = 'Success!';
        
        // Redirect after delay
        setTimeout(() => {
          window.location.href = "vehicleInput.html";
        }, 1500);
        
      } catch (error) {
        document.getElementById('generalError').textContent = error.message;
        document.getElementById('generalError').style.display = 'block';
        document.querySelector('.form-container').style.animation = 'shake 0.5s';
      } finally {
        // Reset button state
        btn.disabled = false;
        buttonText.textContent = 'Create Account';
        loader.style.display = 'none';
      }
    }

    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-10px); }
      }
    `;
    document.head.appendChild(style);

    // Redirect if already logged in
    firebase.auth().onAuthStateChanged(user => {
      if (user) window.location.href = "vehicleInput.html";
    });
 