"use client";
import { motion } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  IconVolume,
  IconScreenShare,
  IconPlayerStop,
} from "@tabler/icons-react";

export default function Recorder({ theme, textTheme }) {
  const [filmando, setFilmando] = useState("");
  const [grabando, setGrabando] = useState("");
  const [recordingType, setRecordingType] = useState(null);
  const [dotCount, setDotCount] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const date = new Date();
  const fecha = date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const hora = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const concate = `${fecha}-${hora}`;

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDataAvailable = (e) => {
    chunksRef.current.push(e.data);
  };

  const handleStop = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${concate}.webm`;
    link.click();
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    setGrabando("");
    setFilmando("");
    setRecordingType(null);
  };

  const videoRecorder = async () => {
    try {
      toast("SE GRABARÁ VIDEO SIN AUDIO");
      const media = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
      });
      const mediaRecorder = new MediaRecorder(media, {
        mimeType: "video/webm;codecs=vp8,opus",
      });
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setGrabando("bg-white");
      setRecordingType("video");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const videoAndAudioRecorder = async () => {
    try {
      toast("SE GRABARÁ VIDEO CON AUDIO");
      const media = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(media, {
        mimeType: "video/webm;codecs=vp8,opus",
      });
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setFilmando("bg-white");
      setRecordingType("videoaudio");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!grabando) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [grabando]);

  useEffect(() => {
    if (!filmando) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [filmando]);

  return (
    <>
      <div
        style={{ border: `2px solid ${theme}` }}
        className={`h-full border- rounded-xl overflow-hidden flex flex-col`}
      >
        <div
          style={{
            backgroundColor: theme,
            color: textTheme,
          }}
          className="h-14 items-center justify-center flex w-full"
        >
          <div className="text-xl font-bold uppercase">Screen Recorder</div>
        </div>

        <div className="h-full p-4 grid grid-cols-2 md:gap-x-5 gap-x-4">
          <div className="flex items-center justify-center">
            <button
              style={{
                backgroundColor: theme,
              }}
              onClick={videoRecorder}
              className={`flex h-full flex-col w-full items-center justify-center transform duration-300 bg-red-800 rounded-lg font-bold hover:scale-105  hover:text-white text-black hover:opacity-70 ${grabando}`}
            >
              <div className="bg-white rounded-full p-2">
                <IconScreenShare
                  className="h-10 w-10"
                  color="black"
                  stroke={2}
                />
              </div>
              {grabando && (
                <div className="text-center" style={{ color: textTheme }}>
                  Recording{" "}
                  <motion.span
                    key={dotCount}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {".".repeat(dotCount)}
                  </motion.span>
                </div>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              style={{
                backgroundColor: theme,
              }}
              onClick={videoAndAudioRecorder}
              className={`flex h-full flex-col w-full items-center justify-center transform duration-300 bg-red-800 rounded-lg font-bold hover:scale-105  hover:text-white hover:opacity-70 text-black ${filmando}`}
            >
              <div className="flex items-center gap-2 bg-white rounded-full p-2">
                <IconScreenShare
                  className="h-10 w-10"
                  color="black"
                  stroke={2}
                />
                <div className="text-black text-3xl">+</div>
                <IconVolume className="h-10 w-10" color="black" stroke={2} />
              </div>
              {filmando && (
                <div className="text-center" style={{ color: textTheme }}>
                  Recording{" "}
                  <motion.span
                    key={dotCount}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {".".repeat(dotCount)}
                  </motion.span>
                </div>
              )}
            </button>
          </div>
        </div>

        {recordingType && (
          <div className="p-4 flex justify-center">
            <button
              onClick={stopRecording}
              style={{ backgroundColor: theme, color: textTheme }}
              className="px-6 py-2 rounded-lg flex items-center gap-2 transform duration-300 hover:opacity-70"
            >
              <IconPlayerStop className="w-6 h-6" /> Detener grabación
            </button>
          </div>
        )}
      </div>
    </>
  );
}
