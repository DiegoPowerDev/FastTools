"use client";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  Upload,
  Download,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

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
  const [formatExport, setFormatExport] = useState("mp4");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(null);

  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const fileInputRef = useRef(null);

  async function load() {
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
      toast.error("Error loading video");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!timelineRef.current || !duration) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const newTime = percentage * duration;

      if (isDragging === "start") {
        if (newTime < cutEnd - 0.5) {
          setCutStart(newTime);
          if (videoRef.current) {
            videoRef.current.currentTime = newTime;
          }
        }
      } else if (isDragging === "end") {
        if (newTime > cutStart + 0.5) {
          setCutEnd(newTime);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, cutStart, cutEnd, duration]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }

    await uploadTemp(file);
  };

  const uploadTemp = async (file) => {
    setIsUploading(true);

    try {
      // 1. Obtener firma del servidor
      const sigResponse = await fetch("/api/get-upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      if (!sigResponse.ok) {
        throw new Error("Failed to get upload signature");
      }

      const { signature, timestamp, cloudName, apiKey, folder, publicId } =
        await sigResponse.json();

      // 2. Subir directamente a Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);
      formData.append("public_id", publicId);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await uploadResponse.json();

      console.log("Upload response:", data);

      if (data.secure_url) {
        setVideoUrl(data.secure_url);
        toast.success("Video uploaded successfully!");

        // Reset states
        setCutStart(0);
        setCurrentTime(0);
      } else {
        throw new Error("No URL returned from Cloudinary");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error(error.message || "Error uploading video, try again later.");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteTemp = async () => {
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
      setOrientation("horizontal");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Server Error.");
    }
  };

  const exportVideo = async (format) => {
    setIsExporting(true);

    try {
      const fileName = `video_trimmed_${Date.now()}.${format}`;

      // 1. Obtener URL de descarga
      const response = await fetch("/api/get-download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          cutStart: cutStart.toFixed(2),
          cutEnd: cutEnd.toFixed(2),
          format,
          fileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate download URL");
      }

      const { downloadUrl } = await response.json();

      console.log("Download URL:", downloadUrl); // Debug

      // 2. Descargar el video
      toast.loading("Preparing the download...", { id: "download" });

      const videoResponse = await fetch(downloadUrl);

      if (!videoResponse.ok) {
        throw new Error(`Download failed: ${videoResponse.status}`);
      }

      const blob = await videoResponse.blob();

      // 3. Crear descarga
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 4. Limpiar
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

      toast.success("Video downloaded successfully!", { id: "download" });
    } catch (error) {
      console.error("Error exporting video:", error);
      toast.error(error.message || "Error downloading video", {
        id: "download",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
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

  const handleTimelineClick = (e) => {
    if (!timelineRef.current || !videoRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    if (newTime >= cutStart && newTime <= cutEnd) {
      videoRef.current.currentTime = newTime;
    }
  };

  if (isLoading) {
    return (
      <div
        style={{ backgroundColor: theme, color: textTheme }}
        className="w-full h-screen flex items-center justify-center"
      >
        <div
          style={{ border: `2px solid ${textTheme}` }}
          className="animate-spin rounded-full h-6 w-6 border-t-transparent"
        ></div>
      </div>
    );
  }

  const startPercent = (cutStart / duration) * 100;
  const endPercent = (cutEnd / duration) * 100;
  const progressPercent = (currentTime / duration) * 100;

  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className="flex flex-col w-full h-full rounded-xl overflow-hidden"
    >
      <div
        style={{ backgroundColor: theme }}
        className="relative h-14 items-center flex justify-between w-full px-4"
      >
        <div className="col-end-6 text-xl w-full font-bold uppercase flex justify-center items-center">
          VIDEO TRIMMER
        </div>
        {videoUrl && (
          <button
            onClick={deleteTemp}
            className="active:scale-110 duration-200 border-2 border-black bg-white text-black font-bold flex justify-center items-center gap-4 p-2 rounded md:m-4 hover:opacity-80 cursor-pointer transition-opacity"
          >
            <Trash2 size={24} />
          </button>
        )}
      </div>

      <div
        style={{ "--theme": textTheme }}
        className={`container bg-black/50 mx-auto h-full flex flex-col ${
          orientation === "vertical" ? "lg:flex-row" : "lg:flex-col"
        }`}
      >
        {/* Video Preview */}
        <div className="flex-1 bg-black/50 h-full overflow-hidden shadow-2xl flex items-center justify-center">
          {!videoUrl ? (
            <div className="text-center p-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
                disabled={isUploading}
              />
              <label
                style={{ backgroundColor: theme, color: textTheme }}
                htmlFor="video-upload"
                className={cn(
                  "px-8 py-4 rounded-lg font-semibold hover:opacity-70 select-none active:scale-110 duration-300 flex items-center gap-3 mx-auto cursor-pointer",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload size={24} />
                {isUploading ? "Uploading..." : "Click to upload a video"}
              </label>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-32 md:max-h-[400px] max-w-full rounded"
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>

        {videoUrl && (
          <div
            className={cn(
              orientation !== "horizontal" && "justify-center",
              "flex-1 p-4 shadow-2xl flex flex-col gap-2"
            )}
          >
            <div className="flex flex-col">
              <div className="flex justify-center items-center gap-4 mt-2">
                <button
                  onClick={seekToStart}
                  style={{ backgroundColor: theme, color: textTheme }}
                  className="px-3 py-2 rounded-lg transition-colors active:scale-110 font-bold hover:opacity-70"
                >
                  <SkipBack size={20} />
                </button>
                <button
                  style={{ backgroundColor: textTheme, color: theme }}
                  onClick={togglePlayPause}
                  className="px-4 py-2 active:scale-110 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  style={{ backgroundColor: theme, color: textTheme }}
                  onClick={seekToEnd}
                  className="px-3 py-2 rounded-lg hover:opacity-70 active:scale-110 transition-colors text-sm"
                >
                  <SkipForward size={20} />
                </button>
              </div>
              <div className="w-full max-w-2xl flex flex-col gap-2">
                <div className="font-bold flex justify-between text-sm">
                  <span>{formatTime(cutStart)}</span>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(cutEnd)}</span>
                </div>
              </div>
              <div
                ref={timelineRef}
                style={{ border: `1px solid ${textTheme}` }}
                onClick={handleTimelineClick}
                className={cn(
                  orientation === "horizontal" ? "h-8" : "h-12",
                  "relative rounded-lg cursor-pointer overflow-hidden"
                )}
              >
                <div className="absolute inset-0 bg-gray-800" />

                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    backgroundColor: theme,
                    left: `${startPercent}%`,
                    right: `${100 - endPercent}%`,
                  }}
                />

                <div
                  className="absolute top-0 bottom-0 w-0.5 z-20"
                  style={{
                    left: `${progressPercent}%`,
                    backgroundColor: textTheme,
                  }}
                >
                  <div
                    style={{ backgroundColor: textTheme }}
                    className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                  />
                </div>

                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDragging("start");
                  }}
                  className="absolute top-0 bottom-0 w-4 cursor-ew-resize z-10 hover:opacity-70 transition-colors flex items-center justify-center"
                  style={{
                    left: `calc(${startPercent}% - 8px)`,
                    backgroundColor: textTheme,
                  }}
                >
                  <div className="w-0.5 h-6 bg-white rounded" />
                </div>

                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDragging("end");
                  }}
                  className="absolute top-0 bottom-0 w-4 cursor-ew-resize hover:opacity-70 z-10 transition-colors flex items-center justify-center"
                  style={{
                    left: `calc(${endPercent}% - 8px)`,
                    backgroundColor: textTheme,
                  }}
                >
                  <div className="w-0.5 h-6 bg-white rounded" />
                </div>
              </div>
              <div className="text-sm font-bold">
                DURATION: {formatTime(cutEnd - cutStart)}
              </div>
            </div>
            <div
              style={{ backgroundColor: theme }}
              className={cn(
                orientation === "horizontal" ? "" : "flex-col",
                "flex gap-4 items-center justify-between p-2 rounded-lg"
              )}
            >
              <h3 className="hidden md:flex font-semibold text-lg">
                EXPORT VIDEO
              </h3>
              <div className="flex gap-4 items-center">
                <Select value={formatExport} onValueChange={setFormatExport}>
                  <SelectTrigger
                    style={{ color: textTheme, border: `1px solid ${theme}` }}
                    className="w-[140px] bg-black"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ color: textTheme, backgroundColor: "black" }}
                  >
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="webm">WEBM</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => exportVideo(formatExport)}
                  disabled={isExporting}
                  className="px-6 py-2 bg-black text-white hover:opacity-70"
                >
                  <Download size={20} className={isExporting ? "mr-2" : ""} />
                  {isExporting ? "Loading..." : ""}
                </Button>
              </div>
              {isExporting && (
                <p className="text-center text-sm text-gray-400">
                  Preparing the download...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
