 const loginBtn = document.getElementById("loginBtn");
    const loader = document.getElementById("buttonLoader");
    const buttonText = document.getElementById("buttonText");
    const errorDisplay = document.getElementById("loginError");

    function login() {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        errorDisplay.textContent = "Please fill in both fields.";
        errorDisplay.style.display = "block";
        return;
      }

      loginBtn.disabled = true;
      loader.style.display = "inline-block";
      buttonText.style.opacity = "0.5";
     

  
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
          window.location.href = "vehicleInput.html";
        })
        .catch(error => {
          errorDisplay.textContent = error.message;
          errorDisplay.style.display = "block";
        })
        .finally(() => {
          loginBtn.disabled = false;
          loader.style.display = "none";
          buttonText.style.opacity = "1";
        });
    }
 
    firebase.auth().onAuthStateChanged(user => {
    if (user) {
      window.location.href = "vehicleInput.html";
    }
  });
  
    if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('✅ Service Worker registered'))
        .catch(err => console.log('❌ Service Worker failed', err));
    });
  }








    
    
  






 

   