"use client";

import { useFireStore } from "@/store/fireStore";

export default function UserBackgroundImage() {
  const { background, mobileBackground, backgroundType } = useFireStore();

  // 1. Video de Fondo
  if (backgroundType === "video" && background) {
    return (
      <div className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden">
        <video
          src="https://res.cloudinary.com/dqaetlpog/video/upload/v1765462341/StarCraft_II_2025-12-11_00-10-18_f1uek2.mp4"
          className="fixed inset-0 w-full h-full object-cover"
          autoPlay // Inicia la reproducción automáticamente
          loop // Reproduce el video en bucle
          muted // Es crucial para la reproducción automática en muchos navegadores
          playsInline // Asegura que se reproduzca en línea en dispositivos móviles
        >
          {/* Fallback para navegadores que no soportan el tag <video> */}
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
    );
  }

  // 2. Imagen de Fondo
  if (backgroundType === "image") {
    return (
      <picture className="fixed inset-0 -z-10 pointer-events-none select-none">
        {/* Mobile: se usará cuando el viewport sea <= 767px */}
        <source media="(max-width: 767px)" srcSet={mobileBackground} />

        {/* Desktop: cuando sea >= 768px */}
        <source media="(min-width: 768px)" srcSet={background} />

        {/* Fallback */}
        <img
          src={background}
          alt="Background"
          className="fixed inset-0 w-full max-w-screen h-full object-contain
                   -z-10 select-none pointer-events-none"
          fetchPriority="high"
        />
      </picture>
    );
  }

  // 3. Si no hay tipo de fondo o backgroundType es desconocido, no renderizar nada
  return null;
}
