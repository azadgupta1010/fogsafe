
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

// Optional if you plan to use these in other scripts
const auth = firebase.auth();
const db = firebase.firestore();


// Google login
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      alert(`Google login successful! Welcome ${user.displayName}`);
      // Do post-login stuff here (redirect, save user info, etc)
    })
    .catch(error => {
      alert('Google login failed: ' + error.message);
    });
}

// Facebook login
function facebookLogin() {
  const provider = new firebase.auth.FacebookAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      alert(`Facebook login successful! Welcome ${user.displayName}`);
    })
    .catch(error => {
      alert('Facebook login failed: ' + error.message);
    });
}

// GitHub login
function githubLogin() {
  const provider = new firebase.auth.GithubAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      alert(`GitHub login successful! Welcome ${user.displayName}`);
    })
    .catch(error => {
      alert('GitHub login failed: ' + error.message);
    });
}