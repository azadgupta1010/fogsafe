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

  function initializeMap(location) {
      map = new google.maps.Map(document.getElementById("map"), {
          center: location,
          zoom: 14,
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

  function setupMapFeatures() {
      updateLocation();
      watchNearbyCars();
  }

  function startLocationUpdates() {
      navigator.geolocation.watchPosition(position => {
          myLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
          };
          if (myMarker) myMarker.setPosition(myLocation);
          map.setCenter(myLocation);
          updateLocation();
      }, error => {
          console.error("Error getting location updates:", error);
      }, { enableHighAccuracy: true, maximumAge: 0 });
  }

  // Helper functions
  const getVehicleIcon = (type) => {
      const icons = {
          car: 'https://maps.google.com/mapfiles/kml/shapes/car.png',
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
          const now = Date.now();
          
          snapshot.forEach(child => {
              if (child.key !== vehicleNumber) {
                  const data = child.val();
                  if (now - data.timestamp > 120000) {
                      db.ref(`vehicles/${child.key}`).remove();
                      return;
                  }

                  const distance = getDistance(myLocation, data.location);
                  updateVehicleMarker(child.key, data, distance);
                  
                  if (distance < 1) nearby = true;
              }
          });

          updateAlertSystem(nearby);
          cleanupOldMarkers(snapshot);
      });
  };

  const updateVehicleMarker = (vehicleId, data, distance) => {
      if (!otherMarkers[vehicleId]) {
          otherMarkers[vehicleId] = new google.maps.Marker({
              position: data.location,
              map: map,
              title: `${vehicleId} (${data.vehicleType})`,
              icon: getVehicleIcon(data.vehicleType)
          });
      } else {
          otherMarkers[vehicleId].setPosition(data.location);
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
      const alertBox = document.getElementById('alertBox');
      const alertSound = document.getElementById('alertSound');
      
      if (nearby) {
          alertBox.style.display = 'block';
          if (alertSound.paused) alertSound.play();
      } else {
          alertBox.style.display = 'none';
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

// Initialize the application when window loads
window.onload = () => {
  // This will trigger the auth check and subsequent initialization
};