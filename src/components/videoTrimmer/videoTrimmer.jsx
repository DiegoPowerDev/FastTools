"use client";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { getAuth } from "firebase/auth";
import { Upload, Download, Trash2, Play, Pause, Scissors } from "lucide-react";
import { Button } from "../ui/button";

export default function VideoTrimmer({ theme, textTheme }) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  const [videoUrl, setVideoUrl] = useState(null);
  const [orientation, setOrientation] = useState("horizontal");
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formatExport, setFormatExport] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef(null);

  // Load temp video if exists
  useEffect(() => {
    async function load() {
      if (!uid) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/get-temp-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });

        const data = await res.json();

        if (data.exists) {
          setVideoUrl(data.url);
        }
      } catch (error) {
        console.error("Error loading video:", error);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [uid]);

  // Detect orientation and setup video
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleLoadedMetadata = () => {
      const videoDuration = video.duration;
      setDuration(videoDuration);
      setCutEnd(videoDuration);

      if (video.videoWidth < video.videoHeight) {
        setOrientation("vertical");
      } else {
        setOrientation("horizontal");
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // Auto pause at cutEnd
      if (video.currentTime >= cutEnd) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoUrl, cutEnd]);

  const uploadTemp = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", uid);

    try {
      const res = await fetch("/api/upload-temp-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setVideoUrl(data.secure_url);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error al subir el video. Intenta de nuevo.");
    }
  };

  const deleteTemp = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este video?")) return;

    try {
      await fetch("/api/delete-temp-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      setVideoUrl(null);
      setCutStart(0);
      setCutEnd(0);
      setDuration(0);
      setCurrentTime(0);
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Error al eliminar el video.");
    }
  };

  const exportVideo = async (format) => {
    setIsExporting(true);

    try {
      const url = `https://res.cloudinary.com/${
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      }/video/upload/so_${cutStart.toFixed(2)},eo_${cutEnd.toFixed(
        2
      )}/f_${format}/fasttools/${uid}/temp/video.${format}`;

      // Create a download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `video_trimmed_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting video:", error);
      alert("Error al exportar el video.");
    } finally {
      setIsExporting(false);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Start from cutStart if before it
      if (videoRef.current.currentTime < cutStart) {
        videoRef.current.currentTime = cutStart;
      }
      videoRef.current.play();
    }
  };

  const seekToStart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = cutStart;
    }
  };

  const seekToEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = cutEnd;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartChange = (value) => {
    const newStart = Number(value);
    if (newStart < cutEnd) {
      setCutStart(newStart);
      if (videoRef.current && videoRef.current.currentTime < newStart) {
        videoRef.current.currentTime = newStart;
      }
    }
  };

  const handleEndChange = (value) => {
    const newEnd = Number(value);
    if (newEnd > cutStart) {
      setCutEnd(newEnd);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className="bg-black/30 flex flex-col h-full rounded-xl overflow-hidden"
    >
      <div
        style={{ backgroundColor: theme }}
        className="relative h-14 items-center justify-center grid grid-cols-6 grid-rows-1 w-full"
      >
        <div className="col-start-1 col-end-6 text-xl w-full font-bold uppercase flex justify-center items-center">
          VIDEO TRIMMER
        </div>
        <button
          onClick={deleteTemp}
          className="active:scale-110 duration-200 md:col-start-6 border-2 border-black bg-white text-black font-bold md:col-end-7 flex justify-center items-center gap-4 p-2 rounded md:m-4 hover:opacity-80 cursor-pointer transition-opacity"
        >
          CLEAR
        </button>
      </div>
      <div
        className={`container mx-auto p-4 flex flex-col ${
          orientation === "vertical" ? "lg:flex-row" : "lg:flex-col"
        } gap-6`}
      >
        {/* Video Preview */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
          {!videoUrl ? (
            <CldUploadWidget
              uploadPreset="unsigned"
              onUpload={(res) => {
                if (res.event === "success") {
                  uploadTemp(res.info.secure_url);
                }
              }}
              options={{
                resourceType: "video",
                folder: `fasttools/${uid}/temp`,
                maxFileSize: 100000000, // 100MB
                sources: ["local", "url", "camera"],
              }}
            >
              {({ open }) => (
                <div className="text-center p-8">
                  <button
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-3 mx-auto"
                    onClick={() => open()}
                  >
                    <Upload size={24} />
                    Subir Video
                  </button>
                  <p className="mt-4 text-gray-400 text-sm">
                    Soporta MP4, MOV, AVI y más
                  </p>
                </div>
              )}
            </CldUploadWidget>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-32 md:max-h-64 max-w-full rounded"
              />
            </div>
          )}
        </div>

        {/* Controls Panel */}
        {videoUrl && (
          <div className="flex-1 bg-gray-800 rounded-lg p-6 shadow-2xl flex flex-col gap-6">
            {/* Playback Controls */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  {isPlaying ? "Pausar" : "Reproducir"}
                </button>

                <button
                  onClick={seekToStart}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  Ir al inicio
                </button>

                <button
                  onClick={seekToEnd}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  Ir al final
                </button>
              </div>

              <div className="w-full flex justify-between">
                <div className="text-sm text-gray-400">
                  Tiempo actual: {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-400">
                  Duración: {formatTime(cutEnd - cutStart)}
                </div>
              </div>
            </div>

            {/* Trim Controls */}
            <div className="flex flex-col gap-6 bg-gray-700 p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold">Inicio</label>
                  <span className="text-blue-400">{formatTime(cutStart)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={cutStart}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold">Final</label>
                  <span className="text-blue-400">{formatTime(cutEnd)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={cutEnd || 0}
                  onChange={(e) => handleEndChange(e.target.value)}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Export Options */}
            <div className="flex gap-2 items-center justify-center">
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-lg">Exportar como:</h3>
                <Select style={{ color: textTheme }}>
                  <SelectTrigger
                    style={{ color: textTheme, border: `1px solid ${theme}` }}
                    className="w-[100px] md:w-[140px]"
                  >
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent
                    style={{ color: textTheme, backgroundColor: "black" }}
                  >
                    <SelectItem
                      className="flex gap-2 w-full"
                      onClick={() => setFormatExport("mp4")}
                      value="MP4"
                    >
                      <Download size={20} /> MP4
                    </SelectItem>
                    <SelectItem
                      className="flex gap-2 w-full"
                      onClick={() => setFormatExport("webm")}
                      value="WEBM"
                    >
                      <Download size={20} /> WEBM
                    </SelectItem>
                    <SelectItem
                      className="flex gap-2 w-full"
                      onClick={() => setFormatExport("gif")}
                      value="GIF"
                    >
                      <Download size={20} /> GIF
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isExporting && (
                  <p className="text-center text-sm text-gray-400">
                    Preparando descarga...
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center">
                <Button onClick={() => exportVideo(formatExport)}>
                  download
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
