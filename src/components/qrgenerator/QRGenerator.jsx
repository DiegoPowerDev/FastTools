"use client";
import { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function QRGenerator({ theme, textTheme }) {
  const canvasRef = useRef(null);
  const [text, setText] = useState("https://fasttools.vercel.app");
  const [size, setSize] = useState(512);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(20);
  const [svgData, setSvgData] = useState(null);
  const logoImgRef = useRef(null);

  const reset = () => {
    setText(" ");
    setSize(512);
    setFgColor("#000000");
    setBgColor("#ffffff");
    setLogo(null);
    setLogoSize(20);
    setSvgData(null);
    logoImgRef.current = null;
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        logoImgRef.current = img;
        setLogo({ file, preview, base64 });
      };
    };

    reader.readAsDataURL(file);
  };

  const generatePNG = async () => {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 1,
        errorCorrectionLevel: "H",
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => (img.onload = res));
      ctx.drawImage(img, 0, 0, size, size);

      if (logo?.base64 && logoImgRef.current) {
        const logoImg = logoImgRef.current;
        const maxLogoPx = (size * logoSize) / 100;
        const padding = maxLogoPx * 0.08;

        // Calcular dimensiones preservando aspect ratio
        const aspectRatio = logoImg.width / logoImg.height;
        let logoWidth, logoHeight;

        if (aspectRatio > 1) {
          // Imagen más ancha que alta
          logoWidth = maxLogoPx;
          logoHeight = maxLogoPx / aspectRatio;
        } else {
          // Imagen más alta que ancha o cuadrada
          logoHeight = maxLogoPx;
          logoWidth = maxLogoPx * aspectRatio;
        }

        // Fondo con padding uniforme alrededor del logo
        const bgWidth = logoWidth + padding * 2;
        const bgHeight = logoHeight + padding * 2;
        const bgX = (size - bgWidth) / 2;
        const bgY = (size - bgHeight) / 2;

        // Dibujar fondo blanco
        ctx.fillStyle = bgColor;
        ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

        // Centrar logo dentro del fondo
        const logoX = bgX + padding;
        const logoY = bgY + padding;

        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
      }
    } catch {
      console.log("Text or URL is required");
    }
  };

  const downloadPNG = () => {
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr.png";
    a.click();
  };

  const generateSVG = async () => {
    try {
      const svg = await QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: 1,
        errorCorrectionLevel: "H",
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      // Si no hay logo → guardar SVG normal
      if (!logo || !logoImgRef.current) {
        setSvgData(svg);
        return;
      }

      const logoImg = logoImgRef.current;
      const maxLogoPx = (size * logoSize) / 100;
      const padding = maxLogoPx * 0.08;

      // cálculos del logo
      const aspectRatio = logoImg.width / logoImg.height;
      let logoWidth, logoHeight;

      if (aspectRatio > 1) {
        logoWidth = maxLogoPx;
        logoHeight = maxLogoPx / aspectRatio;
      } else {
        logoHeight = maxLogoPx;
        logoWidth = maxLogoPx * aspectRatio;
      }

      const bgWidth = logoWidth + padding * 2;
      const bgHeight = logoHeight + padding * 2;
      const bgX = (size - bgWidth) / 2;
      const bgY = (size - bgHeight) / 2;

      const logoX = bgX + padding;
      const logoY = bgY + padding;

      // insertar rect + logo en el SVG
      const patchedSVG = svg.replace(
        /<\/svg>\s*$/i,
        `
        <rect 
          x="${bgX}" 
          y="${bgY}" 
          width="${bgWidth}" 
          height="${bgHeight}" 
          rx="8"
          fill="${bgColor}" 
        />
        <image
          href="${logo.base64}"
          width="${logoWidth}"
          height="${logoHeight}"
          x="${logoX}"
          y="${logoY}"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>`
      );

      setSvgData(patchedSVG);
    } catch (err) {
      console.log("SVG generation failed", err);
    }
  };

  const downloadSVG = () => {
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qr.svg";
    a.click();
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      generatePNG();
      generateSVG();
    }, 200);

    return () => clearTimeout(timeout);
  }, [text, size, fgColor, bgColor, logo, logoSize]);

  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className={`bg-black/30 flex flex-col h-full border- rounded-xl overflow-hidden`}
    >
      <div
        style={{
          backgroundColor: theme,
        }}
        className={`relative  h-14 items-center justify-center grid grid-cols-7 grid-rows-1 w-full`}
      >
        <div className="col-start-1 col-end-6 text-xl  w-full font-bold uppercase flex justify-center items-center">
          QR GENERATOR
        </div>
        <button
          onClick={() => reset()}
          className="md:col-start-6 border-2 border-black bg-white text-black font-bold md:col-end-7 col-span-2 flex justify-center items-center gap-4 p-2 rounded  md:m-4 hover:opacity-80"
        >
          CLEAR
        </button>
      </div>
      <div className="grid grid-cols-2 grid-rows-[6fr_1fr] md:grid-rows-[3fr_1fr] w-full h-full items-center justify-center gap-2">
        <div className="flex flex-col md:p-2 gap-2 items-center justify-center h-full w-full">
          <label className="font-bold">Text or URL</label>
          <Input
            style={{
              color: textTheme,
              border: `1px solid ${theme}`,
              placeholderTextColor: "red",
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://fasttools.vercel.app"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-1 w-full items-center justify-center">
            <div className=" flex md:grid md:grid-cols-2 md:grid-rows-2 w-full gap-1 md:gap-4 justify-center items-center">
              <label className="text-sm md:block hidden  font-bold">
                Size (px):
              </label>
              <Input
                type="text"
                style={{
                  color: textTheme,
                  border: `1px solid ${theme}`,
                }}
                value={size}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^0-9]/g, "");
                  const val = Number(sanitized);
                  if (!sanitized) {
                    setSize(0);
                  } else if (val > 2000) {
                    setSize(2000);
                  } else {
                    setSize(val);
                  }
                }}
                className="border rounded p-1 w-16"
              />
              <span className="md:hidden  font-bold">px</span>

              <label className="hidden md:block  font-bold">Colors:</label>
              <div className="flex">
                <input
                  type="color"
                  value={fgColor}
                  className="w-8 h-8"
                  onChange={(e) => setFgColor(e.target.value)}
                />
                <input
                  type="color"
                  value={bgColor}
                  className="w-8 h-8 p-0 m-0"
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-1 col-span-2 flex flex-col items-center gap-4 justify-center px-4">
              <div className="flex gap-4 items-center justify-center">
                <span className="text-sm  font-bold hidden md:block">
                  Logo:
                </span>
                <label htmlFor="QRLogo">
                  {logo ? (
                    <img
                      src={logo.preview}
                      style={{
                        border: `1px solid ${theme}`,
                      }}
                      className="w-12 h-12 rounded border object-cover"
                    />
                  ) : (
                    <div
                      style={{
                        color: textTheme,
                        border: `1px solid ${textTheme}`,
                      }}
                      className="bg-black h-12 w-12 flex justify-center items-center p-4 text-xs border-2 rounded"
                    >
                      LOGO
                    </div>
                  )}
                </label>

                <input
                  id="QRLogo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>

              <div className="w-full">
                <label className="text-sm  font-bold">
                  Logo Size: {logoSize}%
                </label>
                <Slider
                  style={theme}
                  disabled={!logo}
                  value={[logoSize]}
                  track="red"
                  onValueChange={(v) => setLogoSize(v[0])}
                  max={50}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="h-full w-full md:row-span-2 flex justify-center items-center">
          <canvas
            ref={canvasRef}
            className="max-h-40 md:max-h-64 rounded"
            width={size}
            height={size}
          />
        </div>
        <div className="col-span-2 md:col-span-1 flex gap-4 items-center justify-center">
          <Button
            style={{ backgroundColor: theme, color: textTheme }}
            onClick={downloadPNG}
            className="hover:opacity-80 font-bold ease-in-out hover:scale-105"
          >
            Download PNG
          </Button>

          <Button
            style={{ backgroundColor: theme, color: textTheme }}
            onClick={downloadSVG}
            className="hover:opacity-80 font-bold ease-in-out hover:scale-105"
            disabled={!svgData}
          >
            Download SVG
          </Button>
        </div>
      </div>
    </div>
  );
}
