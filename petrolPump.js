<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fuel Refill Stations</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      background: url('background.png') no-repeat center center fixed;
      background-size: cover;
      color: #e0e0e0;
      display: flex;
      flex-direction: column;
    }

    .back-btn {
      background: #1f1f1f;
      color: #00ffff;
      border: 2px solid #00ffff;
      padding: 8px 16px;
      margin: 12px;
      border-radius: 6px;
      cursor: pointer;
      align-self: flex-start;
      transition: background 0.2s;
    }
    .back-btn:hover {
      background: #00ffff;
      color: #0a0a0a;
    }

    #container {
      display: flex;
      flex: 1;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.7);
    }
    #map {
      flex: 2;
      height: 100%;
    }
    #sidebar {
      flex: 1;
      background: rgba(26, 26, 26, 0.9);
      border-left: 1px solid #333;
      padding: 20px;
      box-sizing: border-box;
      overflow-y: auto;
    }

    .slider-container {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    .slider-container label {
      flex: 1;
    }
    .slider-container input[type="range"] {
      flex: 3;
      margin: 0 10px;
    }
    .slider-value {
      width: 40px;
      text-align: center;
      font-weight: bold;
      color: #00ffff;
    }

    .station {
      background: #0f0f0f;
      border: 1px solid #333;
      border-left: 4px solid #00ffff;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 6px;
      transition: transform 0.2s;
    }
    .station:hover {
      transform: scale(1.02);
    }
    .station h4 {
      margin: 0 0 6px;
      color: #00ffff;
    }
    .station p {
      margin: 4px 0;
      font-size: 0.9em;
    }

    #loadingOverlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(10,10,10,0.8);
      color: #00ffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2em;
      z-index: 1000;
      display: none;
    }
  </style>
</head>
<body>
  <button class="back-btn" onclick="window.location.href='index.html'">← Back</button>
  <div id="container">
    <div id="map"></div>
    <div id="sidebar">
      <h2>Fuel Refill Stations</h2>
      <div class="slider-container">
        <label for="rangeSlider">Range (km):</label>
        <input type="range" id="rangeSlider" min="1" max="50" value="10">
        <span id="sliderValue" class="slider-value">10</span>
      </div>
      <div id="stationList"></div>
    </div>
  </div>

  <div id="loadingOverlay">Loading stations...</div>

  <script>
    let map, userLocation, service;
    let range = 10;

    function showLoading() {
      document.getElementById('loadingOverlay').style.display = 'flex';
    }
    function hideLoading() {
      document.getElementById('loadingOverlay').style.display = 'none';
    }

    function initMap() {
      showLoading();
      navigator.geolocation.getCurrentPosition(pos => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map = new google.maps.Map(document.getElementById('map'), { center: userLocation, zoom: 14 });
        new google.maps.Marker({ position: userLocation, map, title: 'You Are Here', icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' });
        service = new google.maps.places.PlacesService(map);
        fetchStations();
      }, () => {
        alert('Location access denied.'); hideLoading();
      });

      document.getElementById('rangeSlider').addEventListener('input', e => {
        range = e.target.value;
        document.getElementById('sliderValue').textContent = range;
        fetchStations();
      });
    }

    function fetchStations() {
      showLoading();
      service.nearbySearch({ location: userLocation, radius: range * 1000, type: ['gas_station'] }, (results, status) => {
        hideLoading();
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;
        document.getElementById('stationList').innerHTML = '';
        results.forEach(place => {
          new google.maps.Marker({ map, position: place.geometry.location, title: place.name });
          const card = document.createElement('div');
          card.className = 'station';
          card.innerHTML = `<h4>${place.name}</h4><p><strong>Address:</strong> ${place.vicinity}</p>${place.rating ? `<p><strong>Rating:</strong> ${place.rating}</p>` : ''}`;
          card.addEventListener('click', () => map.panTo(place.geometry.location));
          document.getElementById('stationList').appendChild(card);
        });
      });
    }
  </script>
  <script async src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCeQ_yL8idO59wW7s8qlmZb3bKkJnjK1D8&libraries=places&callback=initMap"></script>
</body>
</html>