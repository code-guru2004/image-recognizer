"use client";
import React, { useCallback, useEffect, useRef } from 'react'
import { useState } from "react";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Webcam from 'react-webcam';


function ImageRecognize() {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

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
      
  const identifyImage = async (additionalPrompt = "") => {
    if (!image) return;

    setLoading(true);
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    try {
      //const imageParts = await fileToGenerativePart(image);
      const result = await model.generateContent([
        `Identify this image and provide its name and important information including a brief explanation about that image. Don't give any key points just give "information" withing 4-5 lines. ${additionalPrompt}`,
        image,
      ]);
      const response = await result.response;
      const text = response
        .text()
        .trim()
        .replace(/```/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/\n\s*\n/g, "\n");
      setResult(text);
     console.log(text);
     
     
    } catch (error) {
      console.error("Error identifying image:", error);
      if (error instanceof Error) {
        setResult(`Error identifying image: ${error.message}`);
      } else {
        setResult("An unknown error occurred while identifying the image.");
      }
    } finally {
      setLoading(false);
    }
  };

  
  async function fileToGenerativePart(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        
        
        const base64Content = base64data.split(",")[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className='w-screen h-screen flex items-center justify-center flex-col'>
        <div className=''>
            <Webcam
            audio={false} // Set to true if you want to capture audio as well
            ref={webcamRef}
            screenshotFormat="image/png" // You can change the format
            videoConstraints={videoConstraints}
            
            
            />
            <button onClick={capture}>Capture Image</button>
            <button onClick={enableBackCamera} disabled={!backCameraAvailable}>
                Enable Back Camera
            </button>
            {image && (
              <div className="mb-8 flex justify-center">
                <Image
                  src={image}
                  alt="Uploaded image"
                  width={300}
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            )}
             <button
              onClick={() => identifyImage()}
              disabled={!image || loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? "Identifying..." : "Identify Image"}
            </button>
        </div>
        <div>
            {
                result&&(
                    <h2>{result}</h2>
                )
            }
        </div>
    </div>
  )
}

export default ImageRecognize