let isCameraOn = false;
let eyesClosedCounter = 0;
let detectionInterval;

document.getElementById('toggleCameraBtn').addEventListener('click', () => {
  const video = document.getElementById('driverCam');

  if (!isCameraOn) {
    video.style.display = 'block';
    video.style.transform = 'scaleX(-1)';
    startDrowsyDetection();
    document.getElementById('toggleCameraBtn').textContent = 'stop';
  } else {
    stopDrowsyDetection(video);
    document.getElementById('toggleCameraBtn').textContent = 'start';
  }

  isCameraOn = !isCameraOn;
});

async function startDrowsyDetection() {
  const video = document.getElementById('driverCam');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.appendChild(canvas);
  canvas.style.position = 'absolute';
  canvas.style.top = video.offsetTop + 'px';
  canvas.style.left = video.offsetLeft + 'px';
canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  const beep = document.getElementById('drowsyBeep');
  const alertBox = document.getElementById('drowsyAlertBox');

  detectionInterval = setInterval(async () => {
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detection) {
      const resized = faceapi.resizeResults(detection, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawFaceLandmarks(canvas, resized);

      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();

      const isClosed = areEyesClosed(leftEye, rightEye);

      if (isClosed) {
        eyesClosedCounter++;
        if (eyesClosedCounter >= 4) { // ~4 seconds if interval is 500ms
          alertBox.style.display = 'block';
          if (beep.paused) beep.play();
          logDrowsyEvent(); // Log to Firebase
        }
      } else {
        eyesClosedCounter = 0;
        alertBox.style.display = 'none';
        beep.pause();
        beep.currentTime = 0;
      }
    }
  }, 500);
}



function stopDrowsyDetection(video) {
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  video.srcObject = null;
  video.style.display = 'none';

  clearInterval(detectionInterval);
  document.getElementById('drowsyAlertBox').style.display = 'none';
  eyesClosedCounter = 0;
}

function areEyesClosed(leftEye, rightEye) {
  const getEyeRatio = (eye) => {
    const vertical = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
    const horizontal = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    const ratio = vertical / horizontal;
    return ratio;
  };

  const leftRatio = getEyeRatio(leftEye);
  const rightRatio = getEyeRatio(rightEye);
  const avgRatio = (leftRatio + rightRatio) / 2;

  console.log("Eye ratio (height/width):", avgRatio.toFixed(3));

  return avgRatio < 0.25; // You can adjust threshold here (0.25–0.30 works well)
}



// Firebase Logger for drowsy events
function logDrowsyEvent() {
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.firestore().collection("drowsyEvents").add({
      uid: user.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      type: "Drowsiness Detected"
    });
  }
}
