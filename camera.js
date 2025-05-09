let isCameraOn = false;

document.getElementById('toggleCameraBtn').addEventListener('click', () => {
  const video = document.getElementById('driverCam');

  
  if (!isCameraOn) {
    // Start camera
    video.style.display = 'block';
    video.style.transform = 'scaleX(-1)';
    startDrowsyDetection();
    document.getElementById('toggleCameraBtn').textContent = 'Stop Driver Camera';
  } else {
    // Stop camera
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    video.style.display = 'none';
    document.getElementById('toggleCameraBtn').textContent = 'Start Driver Camera';
  }

  isCameraOn = !isCameraOn;
});
async function startDrowsyDetection() {
    const video = document.getElementById('driverCam');
  
    // Get camera access
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  
    // Load face-api models (make sure models are hosted in /models folder)
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  
    // Create overlay for drawing
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.top = video.offsetTop + 'px';
    canvas.style.left = video.offsetLeft + 'px';
  
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
  
    let eyeClosedTime = null;
    const beepSound = document.getElementById('drowsyBeep'); 

  
    setInterval(async () => {
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
  
      if (detection) {
        const resized = faceapi.resizeResults(detection, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
  
        const leftEye = detection.landmarks.getLeftEye();
        const rightEye = detection.landmarks.getRightEye();
  
        const eyesOpen = areEyesOpen(leftEye) && areEyesOpen(rightEye);
  
        if (!eyesOpen) {
          if (!eyeClosedTime) eyeClosedTime = Date.now();
          else if (Date.now() - eyeClosedTime > 4000) {
            // Show alert box
            const alertBox = document.getElementById('drowsyAlertBox');
            alertBox.style.display = 'block';
          
            // Play sound
            beepSound.play();
          
            // Hide after 5 seconds or if eyes open
            setTimeout(() => {
              alertBox.style.display = 'none';
            }, 5000);
          
            eyeClosedTime = null;
          }
          
        } else {
          eyeClosedTime = null;
        }
      }
    }, 500);
  }
  
  // Helper to check if eyes are open
  function areEyesOpen(eye) {
    const vertical = Math.hypot(eye[1].y - eye[5].y, eye[1].x - eye[5].x);
    const horizontal = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    return (vertical / horizontal) > 0.25; // Adjust sensitivity if needed
  }
 