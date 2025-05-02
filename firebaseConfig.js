const firebaseConfig = {
  apiKey: "AIzaSyB4d-b6-cjBA7MHsubkqnnYUx4RIlZa26g",
  authDomain: "fog-safty.firebaseapp.com",
  databaseURL: "https://fog-safty-default-rtdb.firebaseio.com",
  projectId: "fog-safty",
  storageBucket: "fog-safty.appspot.com",
  messagingSenderId: "273866133545",
  appId: "1:273866133545:web:b33a2115297f8df2a44c38",
  measurementId: "G-XXD83G2VJ3"
};

firebase.initializeApp(firebaseConfig);

try {
  const firebaseApp = firebase.initializeApp(firebaseConfig);
} catch (err) {
  if (!/already exists/.test(err.message)) {
      console.error('Firebase initialization error', err.stack);
  }
}