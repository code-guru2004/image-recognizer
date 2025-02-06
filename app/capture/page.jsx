'use client'
import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image'; 

function Capture() {
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null)
    const videoConstraints = {
        facingMode: "user" // or "environment" for back camera
      };
      const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
      }, [webcamRef]);
    
      const retake = () => {
        setCapturedImage(null);
      };
  return (
    <div>
    <Webcam
      audio={false} // Set to true if you want to capture audio as well
      ref={webcamRef}
      screenshotFormat="image/jpeg" // You can change the format
      videoConstraints={videoConstraints}
      mirrored={true}
    />
    <button onClick={capture}>Capture Image</button>

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

export default Capture