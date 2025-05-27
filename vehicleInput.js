
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



    function validateVehicleNumber() {
    const vehicleInput = document.getElementById("vehicleNumber").value.trim();
    const regex = /^[A-Z]{2}\s\d{2}\s[A-Z]{1}\s\d{4}$/;

    if (!regex.test(vehicleInput)) {
      alert("Please enter the vehicle number in the correct format: HR 35 V 8754");
      return false;
    }

    return true;
  }


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
  