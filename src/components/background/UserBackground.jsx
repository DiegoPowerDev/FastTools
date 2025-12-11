"use client";

import { useFireStore } from "@/store/fireStore";
import { useState, useEffect } from "react";

export default function UserBackgroundImage() {
  const { background, mobileBackground, backgroundType } = useFireStore();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Detectar si es móvil
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Función para optimizar URL de Cloudinary
  const getOptimizedVideoUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;

    // Parámetros de optimización para Cloudinary
    const transformations = isMobile
      ? "q_auto:low,w_800,c_scale,f_auto" // Móvil: menor calidad y resolución
      : "q_auto:eco,w_1920,c_scale,f_auto"; // Desktop: calidad económica

    // Insertar transformaciones en la URL de Cloudinary
    return url.replace("/upload/", `/upload/${transformations}/`);
  };

  // 1. Video de Fondo Optimizado
  if (backgroundType === "video" && background && !isMobile) {
    const optimizedUrl = getOptimizedVideoUrl(background);

    return (
      <div className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden">
        {/* Placeholder mientras carga */}
        {!isVideoLoaded && (
          <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse" />
        )}

        <video
          src={optimizedUrl}
          className={`fixed inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata" // Solo carga metadatos inicialmente
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={(e) => {
            console.error("Video load error:", e);
            setIsVideoLoaded(true); // Mostrar aunque haya error
          }}
        >
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
    );
  }

  // 2. Imagen de Fondo
  if (backgroundType === "image" || isMobile) {
    return (
      <picture className="fixed inset-0 -z-10 pointer-events-none select-none">
        <source media="(max-width: 767px)" srcSet={mobileBackground} />
        <source media="(min-width: 768px)" srcSet={background} />
        <img
          src={background}
          alt="Background"
          className="fixed inset-0 w-full max-w-screen h-full object-cover
                   -z-10 select-none pointer-events-none"
          fetchPriority="high"
        />
      </picture>
    );
  }

  return null;
}
