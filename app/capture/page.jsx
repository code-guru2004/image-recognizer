"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';

export default function Capture() {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [videoConstraints, setVideoConstraints] = useState({ facingMode: "user" }); // Start with front camera
  const [backCameraAvailable, setBackCameraAvailable] = useState(false);

  useEffect(() => {
    async function checkCameraAvailability() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const isBackCam = devices.some(device => device.kind === 'videoinput' && device.label.includes('back'));
        setBackCameraAvailable(isBackCam);
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    }

    checkCameraAvailability();
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot(); // Check if webcamRef.current exists
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
  };

  const enableBackCamera = () => {
    if (backCameraAvailable) {
      setVideoConstraints({ facingMode: "environment" });
    } else {
      alert("Back camera not available on this device.");
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
      <button onClick={capture}>Capture Image</button>
      <button onClick={enableBackCamera} disabled={!backCameraAvailable}>
        Enable Back Camera
      </button>
    {capturedImage && (
      <div>
        <h2>Captured Image:</h2>
        <Image src={capturedImage} alt="Captured" width={300} height={300} />
        <button onClick={retake}>Retake</button>
      </div>
    )}
  </div>
  )
}

