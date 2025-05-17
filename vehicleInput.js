
    let selectedType = "";

    function selectVehicle(type, element) {
      selectedType = type;
      const cards = document.querySelectorAll(".vehicle-card");
      cards.forEach(card => card.classList.remove("selected"));
      element.classList.add("selected");
    }
     setTimeout(() => {
      document.getElementById("splashScreen").style.display = "none";
    }, 7000); // 7 seconds



    function submitVehicleInfo() {
      const number = document.getElementById('vehicleNumber').value.trim();

      if (!number || !selectedType) {
        alert("Please enter all fields!");
        return;
      }

      localStorage.setItem('vehicleNumber', number);
      localStorage.setItem('vehicleType', selectedType);

      window.location.href = "index.html";
    }
  
    
   
  
    // Firebase Auth check
    firebase.auth().onAuthStateChanged(user => {
      if (!user) window.location.href = "login.html";
    });
  