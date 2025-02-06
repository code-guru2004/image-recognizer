'use client'
import { useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import axios from 'axios';

export default function ImageRecognizer() {
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [info, setInfo] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load the MobileNet model
  const loadModel = async () => {
    const model = await mobilenet.load();
    return model;
  };

  // Capture image from the camera
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, 224, 224);
    const imageData = canvas.toDataURL('image/png');
    setImage(imageData);
    classifyImage(canvas);
  };

  // Classify the captured image
  const classifyImage = async (imageElement) => {
    const model = await loadModel();
    const predictions = await model.classify(imageElement);
    setPredictions(predictions);
    fetchImageInfo(predictions[0].className);
  };

  // Fetch information about the recognized object from Wikipedia
  const fetchImageInfo = async (query) => {
    try {
      const response = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      setInfo(response.data);
    } catch (error) {
      console.error('Error fetching information:', error);
      setInfo({ extract: 'No information found.' });
    }
  };

  // Start the camera
  const startCamera = async () => {
    const video = videoRef.current;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();
    }
  };

  return (
    <div>
      <h1>Image Recognizer</h1>
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureImage}>Capture Image</button>
      <div>
        <video ref={videoRef} width="224" height="224" style={{ display: 'block' }} />
        <canvas ref={canvasRef} width="224" height="224" style={{ display: 'none' }} />
      </div>
      {image && <img src={image} alt="Captured" width="224" height="224" />}
      <div>
        <h2>Predictions:</h2>
        <ul>
          {predictions.map((prediction, index) => (
            <li key={index}>
              {prediction.className} - {Math.round(prediction.probability * 100)}%
            </li>
          ))}
        </ul>
      </div>
      {info && (
        <div>
          <h2>Information:</h2>
          <p>{info.extract}</p>
          {info.thumbnail && (
            <img src={info.thumbnail.source} alt={info.title} width="200" />
          )}
          <p>
            <a href={info.content_urls.desktop.page} target="_blank" rel="noopener noreferrer">
              Read more on Wikipedia
            </a>
          </p>
        </div>
      )}
    </div>
  );
}