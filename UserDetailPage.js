
  function toggleSetting(settingName, value) {
    localStorage.setItem(settingName, value);
    console.log(`${settingName} set to: ${value}`);
    if (settingName === 'darkMode') {
      document.body.style.background = value 
        ? '#000' 
        : 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
    }
  }


function submitFeedback() {
    const name = document.getElementById('feedbackName').value.trim();
    const email = document.getElementById('feedbackEmail').value.trim();
    const message = document.getElementById('feedbackMessage').value.trim();
    const user = firebase.auth().currentUser;

    if (!message) {
      alert("Please enter your feedback.");
      return;
    }

    const feedbackData = {
      name: name || "Anonymous",
      email: email || "Not provided",
      message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (user) {
      feedbackData.userId = user.uid;
    }

    firebase.firestore().collection("feedback").add(feedbackData)
      .then(() => {
        alert("✅ Thanks for your feedback!");
        document.getElementById('feedbackName').value = "";
        document.getElementById('feedbackEmail').value = "";
        document.getElementById('feedbackMessage').value = "";
      })
      .catch((error) => {
        console.error("Error submitting feedback:", error);
        alert("❌ Error: " + error.message);
      });
  }


  function changeLanguage(lang) {
    const buttons = document.querySelectorAll('.language-select-btn');
    buttons.forEach(button => button.classList.remove('selected'));
    
    const selectedButton = Array.from(buttons).find(button => button.textContent.toLowerCase() === lang);
    selectedButton.classList.add('selected');
    
    // For now, just log the selected language
    console.log('Language selected:', lang);
    // In a real-world scenario, you would replace the page content based on the selected language
  }

  function editProfile() {
    document.getElementById('editName').value = document.getElementById('profileName').textContent;
    document.getElementById('editEmail').value = document.getElementById('profileEmail').textContent;
    document.getElementById('editPhone').value = document.getElementById('profilePhone').textContent;
    document.getElementById('editVehicle').value = document.getElementById('profileVehicle').textContent;
    
    document.getElementById('profileModal').style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('profileModal').style.display = 'none';
  }
 
  function saveProfile() {
  const name = document.getElementById('editName').value;
  const email = document.getElementById('editEmail').value;
  const phone = document.getElementById('editPhone').value;
  const vehicle = document.getElementById('editVehicle').value;
  const profilePic = localStorage.getItem('profilePic') || '';

  const user = firebase.auth().currentUser;
  if (!user) {
    alert('User not logged in.');
    return;
  }

  const userId = user.uid;

  // ✅ Logging before writing to check values
  console.log("Saving profile for UID:", userId, { name, email, phone, vehicle, profilePic });

  firebase.firestore().collection('users').doc(userId).set({
    name,
    email,
    phone,
    vehicle,
    profilePic
  }, { merge: true }) // ✅ merge true prevents overwriting whole doc
  .then(() => {
    console.log("Profile saved successfully");
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = email;
    document.getElementById('profilePhone').textContent = phone;
    document.getElementById('profileVehicle').textContent = vehicle;
    closeModal();
  })
  .catch((error) => {
    console.error("Error saving profile:", error);
    alert("Error saving profile: " + error.message); // ✅ alerts user if permission error etc.
  });
}


  function logout() {
   
    window.location.href = "splash.html";
  }

  function updateProfilePic(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgElement = document.getElementById('profileImage');
      imgElement.src = e.target.result;
      imgElement.classList.add('updated-glow'); // Animation effect

      localStorage.setItem('profilePic', e.target.result);

      setTimeout(() => {
        imgElement.classList.remove('updated-glow');
      }, 1000);
    };
    reader.readAsDataURL(file);
  }
}

// Auto-load from localStorage on page load
window.onload = function() {
    firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    const userId = user.uid;

    firebase.firestore().collection('users').doc(userId).get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        document.getElementById('profileName').textContent = data.name;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profilePhone').textContent = data.phone;
        document.getElementById('profileVehicle').textContent = data.vehicle;
        document.getElementById('profileImage').src = data.profilePic;

        localStorage.setItem('profilePic', data.profilePic); // optional
      }
    }).catch((error) => {
      console.error("Error getting user profile:", error);
    });
  }
});
};

