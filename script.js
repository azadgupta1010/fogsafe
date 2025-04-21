const db = firebase.database();

let myCarId = prompt("Enter your car ID (e.g., car1 or car2)");
let map, myMarker, otherMarker;

function initMap(lat, lng) {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng },
    zoom: 15,
    styles: [ // dark style
      { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] }
    ]
  });

  myMarker = new google.maps.Marker({
    position: { lat, lng },
    map,
    label: myCarId,
    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
  });
}

function updateLocation(lat, lng) {
  db.ref("cars/" + myCarId).set({ lat, lng });
}

function watchOtherCar() {
  const otherCarId = myCarId === "car1" ? "car2" : "car1";

  db.ref("cars/" + otherCarId).on("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const otherLat = data.lat;
      const otherLng = data.lng;

      if (otherMarker) {
        otherMarker.setPosition({ lat: otherLat, lng: otherLng });
      } else {
        otherMarker = new google.maps.Marker({
          position: { lat: otherLat, lng: otherLng },
          map,
          label: otherCarId,
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        });
      }

      checkDistance(otherLat, otherLng);
    }
  });
}

function checkDistance(lat2, lng2) {
  const lat1 = myMarker.getPosition().lat();
  const lng1 = myMarker.getPosition().lng();

  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  const alertBox = document.getElementById("alertBox");
  if (d < 1) {
    alertBox.style.display = "block";
  } else {
    alertBox.style.display = "none";
  }
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

navigator.geolocation.watchPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    if (!map) {
      initMap(lat, lng);
    }

    myMarker.setPosition({ lat, lng });
    updateLocation(lat, lng);
  },
  (error) => {
    alert("Please allow location access.");
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  }
);

watchOtherCar();
