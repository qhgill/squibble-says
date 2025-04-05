"use client";
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
// Import the WebGL backend
import "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";
import { drawHand } from "./utilities";

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean | null>(null);

  const runHandpose = async () => {
    try {
      // Set the backend to WebGL
      await tf.setBackend("webgl");
      console.log("TensorFlow.js backend set to WebGL");
      const net = await handpose.load();
      console.log("Handpose model loaded.");
      setModelLoaded(true);

      const intervalId = setInterval(() => {
        detect(net);
      }, 100);

      return () => clearInterval(intervalId);
    } catch (error) {
      console.error("Error loading Handpose model:", error);
      setModelLoaded(false);
      return () => {};
    }
  };

  const detect = async (net) => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      if (canvasRef.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        try {
          const hand = await net.estimateHands(video);
          console.log(hand);

          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            drawHand(hand, ctx);
          }
        } catch (error) {
          console.error("Error during hand detection:", error);
        }
      }
    }
  };

  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;
    const startHandpose = async () => {
      cleanupFunction = await runHandpose();
    };
    startHandpose();

    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {modelLoaded === false && (
          <div style={{ color: "red", position: "absolute", top: "10px" }}>
            Failed to load Handpose model!
          </div>
        )}
        {modelLoaded === null && (
          <div style={{ color: "blue", position: "absolute", top: "10px" }}>
            Loading Handpose model...
          </div>
        )}
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
