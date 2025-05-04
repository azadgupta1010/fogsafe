// Main authentication check wrapper
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
      window.location.href = "login.html";
      return;
  }

  // Get vehicle info from localStorage
  const vehicleNumber = localStorage.getItem('vehicleNumber');
  const vehicleType = localStorage.getItem('vehicleType');
  
  // Check vehicle information exists
  if (!vehicleNumber || !vehicleType) {
      window.location.href = "vehicleInput.html";
      return;
  }

  // Initialize Firebase database
  const db = firebase.database();
  let map, myMarker;
  let myLocation = { lat: 0, lng: 0 };
  let otherMarkers = {};

  function handleEmergency() {
    if (!myLocation) {
      alert("Location not available.");
      return;
    }
  
    const emergencyNumber = "112"; // Change as needed (India's emergency number)
    const emergencyContacts = [
      "+918053317489",
      "+917015277924"
    ];
  
    // Trigger phone call
    window.open(`tel:${emergencyNumber}`, '_self');
  
    // Send location to contacts (via a backend or SMS API fallback)
    const message = `🚨 Emergency! Vehicle Breakdown. Location: https://www.google.com/maps?q=${myLocation.lat},${myLocation.lng}`;
    
   }
   window.handleEmergency = handleEmergency; // <- Add this line  kyuki baaki firebase m h 
  
   function markBreakdown() {
    if (!myLocation || !vehicleNumber) {
      alert("Vehicle info not available.");
      return;
    }
  
    db.ref(`vehicles/${vehicleNumber}`).update({
      breakdown: true
    });
  
    alert("Breakdown marked. Nearby vehicles will be alerted.");
  }
  window.markBreakdown = markBreakdown; // <- Add this line
 
  // to start camera 
  function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        document.getElementById('video').srcObject = stream;
      })
      .catch(err => console.error('Camera error:', err));
  }
  
  // Map initialization function
  function initMap() {
    document.getElementById('loadingScreen').style.display = 'flex';
      navigator.geolocation.getCurrentPosition(pos => {
          // Success callback
          myLocation = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
          };
        

          initializeMap(myLocation);
          setupMapFeatures();
          startLocationUpdates();
  document.getElementById('loadingScreen').style.display = 'none';
        map.setCenter(myLocation);

          // 🔍 Call the petrol pump finder function (make sure it's defined)
          findNearbyPetrolPump(new google.maps.LatLng(myLocation.lat, myLocation.lng));
           

}, (err) => {
          // Error callback
          console.error("Geolocation error:", err);
          alert("Please enable GPS to continue!");
          // Fallback to default location (New Delhi)
          myLocation = { lat: 28.6139, lng: 77.2090 };
          initializeMap(myLocation);
          setupMapFeatures();
      }, { enableHighAccuracy: true });
  }
    window.initMap=initMap;

    function findNearbyPetrolPump(location) {
        const service = new google.maps.places.PlacesService(map);
      
        const request = {
          location: location,
          radius: 10000, // 10 km
          type: ['gas_station']
        };
      
        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Clear previous info
            document.getElementById('petrolInfo').innerHTML = '';
      
            // Loop through up to 5 petrol pumps and display them
            const maxResults = 5;
            for (let i = 0; i < Math.min(results.length, maxResults); i++) {
              const nearest = results[i];
              const pumpLocation = nearest.geometry.location;
      
              // Add marker for each petrol pump
              new google.maps.Marker({
                map: map,
                position: pumpLocation,
                title: nearest.name,
                icon: 'https://maps.google.com/mapfiles/ms/icons/gas.png'
              });
      
              // Calculate distance from current location
              const distance = getDistance(
                { lat: location.lat(), lng: location.lng() },
                { lat: pumpLocation.lat(), lng: pumpLocation.lng() }
              );
      
              // Append info to the div
              const petrolInfoDiv = document.getElementById('petrolInfo');
              petrolInfoDiv.innerHTML += `
                <p>⛽ <strong>${nearest.name}</strong><br>
                   📏 Distance: ${distance.toFixed(2)} km</p>`;
            }
          } else {
            console.error("Places API Error:", status);
            document.getElementById('petrolInfo').innerText = 'Failed to find petrol pumps.';
          }
        });
      }
      
      window.findNearbyPetrolPump=findNearbyPetrolPump;

      function handleFindPetrolPump() {
        // Get current location
        navigator.geolocation.getCurrentPosition(position => {
            const myLoc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
    
            // Call the function to find petrol pumps near the current location
            findNearbyPetrolPump(myLoc);
        }, error => {
            alert("Error getting your location. Please try again.");
            console.error(error);
        });
    }
    
      window.handleFindPetrolPump = handleFindPetrolPump;
      

  function initializeMap(location) {
      map = new google.maps.Map(document.getElementById("map"), {
          center: location,
          zoom: 16,
          mapTypeControl: true,
          streetViewControl: false,
          styles: [
              { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] }
          ]
      });

      myMarker = new google.maps.Marker({
          position: location,
          map: map,
          title: vehicleNumber,
          icon: getVehicleIcon(vehicleType)
      });
  }
   window.initializeMap=initializeMap;

  function setupMapFeatures() {
      updateLocation();
      watchNearbyCars();
  }
  window.setupMapFeatures = setupMapFeatures; // <- Add this line

  function startLocationUpdates() {
    let lastLocation = null;
    let lastUpdateTime = null;

      navigator.geolocation.watchPosition(position => {
        const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        const now = Date.now();
          // Calculate speed if possible
       if (lastLocation && lastUpdateTime) {
        const distance = getDistance(lastLocation, newLocation); // in km
        const timeDiff = (now - lastUpdateTime) / 3600000; // in hours
        const speed = timeDiff > 0 ? (distance / timeDiff).toFixed(1) : 0;
        document.getElementById('speedCard').textContent = `Speed: ${speed} km/h`;
       }
        lastLocation = newLocation;
        lastUpdateTime = now;
        myLocation = newLocation;
          if (myMarker) myMarker.setPosition(myLocation);
          map.setCenter(myLocation);
          updateLocation();
          document.getElementById('coordCard').textContent =
        `Lat: ${myLocation.lat.toFixed(4)}, Lng: ${myLocation.lng.toFixed(4)}`;
      }, error => {
          console.error("Error getting location updates:", error);
      }, { enableHighAccuracy: true, maximumAge: 0 });
  }
   window.startLocationUpdates=startLocationUpdates;

  // Helper functions
  const getVehicleIcon = (type) => {
      const icons = {
          car: 'https://maps.google.com/mapfiles/kml/shapes/bus.png',
          bus: 'https://maps.google.com/mapfiles/kml/shapes/bus.png',
          truck: 'https://maps.google.com/mapfiles/kml/shapes/truck.png',
          bike: 'https://maps.google.com/mapfiles/kml/shapes/cycling.png'
      };
      return icons[type] || icons.car;
  };

  const updateLocation = () => {
      db.ref(`vehicles/${vehicleNumber}`).set({
          location: myLocation,
          vehicleType: vehicleType,
           timestamp: firebase.database.ServerValue.TIMESTAMP
      });
  };

  const watchNearbyCars = () => {
    
      db.ref('vehicles').on('value', snapshot => {
          let nearby = false;
          let nearbyCount = 0;
          const now = Date.now();
          
          snapshot.forEach(child => {
              if (child.key !== vehicleNumber) {
                  const data = child.val();

                  if (now - data.timestamp > 12000) {
                      db.ref(`vehicles/${child.key}`).remove();
                      return;
                  }

                  const distance = getDistance(myLocation, data.location);
                  updateVehicleMarker(child.key, data, distance);
                  
                  if (distance < 1){
                     nearby = true;

                  if (data.breakdown) {
                    document.getElementById('alertBox').textContent = "⚠️ Breakdown Vehicle Ahead!";
                }
            } 
                nearbyCount++;
              }
          });

          updateAlertSystem(nearby);
          cleanupOldMarkers(snapshot);
          document.getElementById('nearbyCard').textContent =
            `Nearby Vehicles: ${nearbyCount}`;
            
      });
      
  };

  const updateVehicleMarker = (vehicleId, data, distance) => {
    const isBreakdown = data.breakdown;
 
    if (!otherMarkers[vehicleId]) {
          otherMarkers[vehicleId] = new google.maps.Marker({
              position: data.location,
              map: map,
              title: `${vehicleId} (${data.vehicleType})${isBreakdown ? " - BREAKDOWN" : ""}`,
              icon: isBreakdown 
              ? 'https://maps.google.com/mapfiles/kml/shapes/mechanic.png' // breakdown icon
              : getVehicleIcon(data.vehicleType) });
      } else {
          otherMarkers[vehicleId].setPosition(data.location);
          otherMarkers[vehicleId].setIcon(
            isBreakdown
              ? 'https://maps.google.com/mapfiles/kml/shapes/mechanic.png'
              : getVehicleIcon(data.vehicleType)
            );
            }
      otherMarkers[vehicleId].setVisible(distance < 2);
  };

  const cleanupOldMarkers = (snapshot) => {
      Object.keys(otherMarkers).forEach(vehicleId => {
          if (!snapshot.hasChild(vehicleId)) {
              otherMarkers[vehicleId].setMap(null);
              delete otherMarkers[vehicleId];
          }
      });
  };

  const updateAlertSystem = (nearby) => {
    console.log(nearby); 
    const alertBox = document.getElementById('alertBox');
    const alertSound = document.getElementById('alertSound');
    
    if (nearby) {
        alertBox.classList.add('active'); // Add active class to show the alert
        if (alertSound.paused) alertSound.play();
    } else {
        alertBox.classList.remove('active'); // Remove active class to hide the alert
        alertSound.pause();
        alertSound.currentTime = 0;
    }
};


  const getDistance = (loc1, loc2) => {
      const toRad = x => x * Math.PI / 180;
      const R = 6371; // Earth's radius in KM
      const dLat = toRad(loc2.lat - loc1.lat);
      const dLon = toRad(loc2.lng - loc1.lng);
      const a = Math.sin(dLat/2) ** 2 +
              Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
              Math.sin(dLon/2) ** 2;
      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // Initialize the map after all checks
  initMap();
});
async function startVideoAndDetect() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  
    const video = document.getElementById('videoFeed');
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => video.srcObject = stream);
  
    video.addEventListener('play', () => monitorEyes(video));
  }
  

// Initialize the application when window loads
window.onload = () => {
    console.log("Window loaded, waiting for Firebase auth...");
    startVideoAndDetect();
    let eyesClosedCounter = 0;

async function monitorEyes(video) {
  const alertDiv = document.getElementById('drowsyAlert');
  const beep = document.getElementById('drowsyBeep');

  setInterval(async () => {
    const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (result) {
      const landmarks = result.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      
      const isClosed = areEyesClosed(leftEye, rightEye);

      if (isClosed) {
        eyesClosedCounter++;
        if (eyesClosedCounter > 15) {
          alertDiv.style.display = 'block';
          if (beep.paused) beep.play();
        }
      } else {
        eyesClosedCounter = 0;
        alertDiv.style.display = 'none';
        beep.pause();
        beep.currentTime = 0;
      }
    }
  }, 200);
}

function areEyesClosed(leftEye, rightEye) {
  const eyeAspectRatio = (eye) => {
    const a = distance(eye[1], eye[5]);
    const b = distance(eye[2], eye[4]);
    const c = distance(eye[0], eye[3]);
    return (a + b) / (2.0 * c);
  };
  return (eyeAspectRatio(leftEye) + eyeAspectRatio(rightEye)) / 2 < 0.22;
}

function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

  // This will trigger the auth check and subsequent initialization
};