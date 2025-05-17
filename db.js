function saveUserData(userDetails) {
  const user = auth.currentUser;

  if (!user) {
    console.log("No user is logged in");
    return;
  }

  db.collection('users').doc(user.uid).set({
    name: userDetails.name || user.displayName || "Safe Raahi User",
    email: user.email,
    vehicle: userDetails.vehicle || {},
    emergencyContacts: userDetails.emergencyContacts || [],
    settings: userDetails.settings || {},
    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true })  // merge true to update without deleting existing fields
  .then(() => {
    console.log("User data saved successfully!");
  })
  .catch((error) => {
    console.error("Error saving user data: ", error);
  });
}

auth.signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    const user = userCredential.user;

    // Prepare your user data details here
    const userDetails = {
      name: "Azad Gupta",
      vehicle: {
        number: "DL01AB1234",
        type: "Sedan"
      },
      emergencyContacts: ["+919999999999", "+918888888888"],
      settings: {
        fogAlerts: true,
        drowsyDetection: true
      }
    };

    saveUserData(userDetails);
  })
  .catch((error) => {
    console.error("Login failed:", error);
  });




  function getUserData() {
  const user = auth.currentUser;

  if (!user) {
    console.log("No user logged in");
    return;
  }

  db.collection('users').doc(user.uid).get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        console.log("User data:", data);
        // Use this data to populate UI or app state
      } else {
        console.log("No user data found");
      }
    })
    .catch((error) => {
      console.error("Error getting user data:", error);
    });
}
