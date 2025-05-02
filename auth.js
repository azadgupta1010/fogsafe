const auth = firebase.auth();

// Common Auth Functions
function handleAuthError(error) {
  const authError = document.getElementById('authError');
  authError.style.display = 'block';
  
  switch(error.code) {
    case 'auth/email-already-in-use':
      authError.textContent = 'Email already in use';
      break;
    case 'auth/invalid-email':
      authError.textContent = 'Invalid email format';
      break;
    case 'auth/weak-password':
      authError.textContent = 'Password should be at least 6 characters';
      break;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      authError.textContent = 'Invalid email or password';
      break;
    default:
      authError.textContent = 'Authentication failed. Please try again.';
  }
}

// Login
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = 'vehicleInput.html';
    } catch (error) {
      handleAuthError(error);
    }
  });
}

// Registration
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    const vehicleType = document.getElementById('vehicleType').value;

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      // Save vehicle info to user profile
      await userCredential.user.updateProfile({
        displayName: vehicleNumber
      });

      // Store additional info in database
      const db = firebase.database();
      await db.ref(`users/${userCredential.user.uid}`).set({
        vehicleNumber,
        vehicleType
      });

      window.location.href = 'vehicleInput.html';
    } catch (error) {
      handleAuthError(error);
    }
  });
}

// Auth State Listener
auth.onAuthStateChanged(user => {
  if (window.location.pathname.includes('vehicleInput.html') || 
     window.location.pathname.includes('index.html')) {
    if (!user) window.location.href = 'login.html';
  }
});