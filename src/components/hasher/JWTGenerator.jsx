"use client";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import toast from "react-hot-toast";
import * as jose from "jose";
import styles from "../enlaces.module.css";
import { Input } from "../ui/input";

export default function JWTGenerator({ theme, textTheme }) {
  const [rsa, setRsa] = useState(false);
  const [payload, setPayload] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState("HS256");
  const [token, setToken] = useState("");
  const [expiration, setExpiration] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(60);

  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const formatJSON = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(payload), null, 2);
      setPayload(formatted);
      toast.success("Payload formatted!");
    } catch {
      toast.error("Invalid JSON in payload");
    }
  };

  // ✅ corregido y funcionando en componentes separados
  const generateRSAKeys = async () => {
    try {
      // ✅ Generar clave RSA extractable
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true, // ⬅️ permite exportarlas
        ["sign", "verify"]
      );

      // ✅ Exportar claves
      const publicKeyBuffer = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      const privateKeyBuffer = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );

      // ✅ Convertir a PEM
      const toPEM = (buffer, label) => {
        const base64 = window.btoa(
          String.fromCharCode(...new Uint8Array(buffer))
        );
        const formatted = base64.match(/.{1,64}/g).join("\n");
        return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
      };

      const publicPem = toPEM(publicKeyBuffer, "PUBLIC KEY");
      const privatePem = toPEM(privateKeyBuffer, "PRIVATE KEY");

      setPublicKey(publicPem);
      setPrivateKey(privatePem);

      toast.success("RSA keys generated successfully!");
    } catch (err) {
      console.error("RSA generation failed:", err);
      toast.error("Failed to generate RSA keys");
    }
  };
  const handleGenerate = async () => {
    try {
      const payloadObj = JSON.parse(payload);
      const now = Math.floor(Date.now() / 1000);
      const exp = now + expiryMinutes * 60;

      let signedJwt;
      let jwtBuilder = new jose.SignJWT(payloadObj).setProtectedHeader({
        alg: algorithm,
        typ: "JWT",
      });

      // ✅ Solo agregar expiración si el checkbox está activo
      if (expiration) {
        jwtBuilder = jwtBuilder.setExpirationTime(exp).setIssuedAt(now);
      }

      if (algorithm.startsWith("HS")) {
        if (!secret) return toast.error("Secret required");
        const key = new TextEncoder().encode(secret);
        signedJwt = await jwtBuilder.sign(key);
      } else if (algorithm === "RS256") {
        if (!privateKey) return toast.error("Private key required");
        const pk = await jose.importPKCS8(privateKey, "RS256");
        signedJwt = await jwtBuilder.sign(pk);
      } else {
        return toast.error("Unsupported algorithm");
      }

      setToken(signedJwt);
      toast.success("JWT generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate JWT");
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    toast.success("Token copied!");
  };
  const handleCopyPublic = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    toast.success("Public Key copied!");
  };
  const handlePrivate = async () => {
    if (!privateKey) return;
    await navigator.clipboard.writeText(privateKey);
    toast.success("Private Key copied!");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <label className="font-bold text-sm">Payload (JSON)</label>
        <button
          onClick={formatJSON}
          style={{ backgroundColor: theme, color: textTheme }}
          className="px-2 text-xs rounded hover:opacity-80 font-bold "
        >
          Format
        </button>
      </div>
      <div className="">
        <textarea
          style={{
            color: textTheme,
            border: `1px solid ${theme}`,
            "--theme": theme,
          }}
          rows={3}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className={`p-2 rounded bg-transparent font-mono text-sm w-full resize-none ${styles.scrollContainer}`}
          placeholder='{"name": "Diego", "age": 32}'
        />
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center justify-center">
            <label className="font-bold text-sm md:text-sm">Algorithm:</label>

            <Select
              style={{ color: textTheme }}
              value={algorithm}
              onValueChange={setAlgorithm}
              className="p-2 rounded w-full bg-transparent"
            >
              <SelectTrigger
                style={{ color: textTheme, border: `1px solid ${theme}` }}
                className=" w-[100px] md:w-[150px]"
              >
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent
                style={{ color: textTheme, backgroundColor: "black" }}
              >
                <SelectItem value="HS256">HS256 (SHA-256)</SelectItem>
                <SelectItem value="HS384">HS384 (SHA-384)</SelectItem>
                <SelectItem value="HS512">HS512 (SHA-512)</SelectItem>
                <SelectItem value="RS256">RS256 (RSA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <span className="font-bold ">Expiration?:</span>
            <input
              onChange={(e) => setExpiration(e.target.checked)}
              type="checkbox"
            />
          </div>
          <div className="flex gap-2 items-center justify-center">
            <label className="text-sm md:text-sm font-bold ">
              Expiry (minutes)
            </label>
            <Input
              type="number"
              min={0}
              style={{ color: textTheme, border: `1px solid ${theme}` }}
              disabled={!expiration}
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              className="disabled:opacity-40 p-1 w-12 rounded bg-transparent text-sm"
            />
            <span className="text-xs text-gray-400">({expiryMinutes} min)</span>
          </div>
        </div>
      </div>

      {algorithm.startsWith("HS") ? (
        <div>
          <label className="text-sm font-bold ">Secret key (HMAC)</label>
          <input
            type="text"
            value={secret}
            style={{
              color: textTheme,
              border: `1px solid ${theme}`,
              "--theme": theme,
            }}
            onChange={(e) => setSecret(e.target.value)}
            className="p-2 rounded bg-transparent w-full"
            placeholder="Secret for HS algorithms"
          />
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setRsa(true);
              }}
              style={{
                backgroundColor: theme,
                color: textTheme,
                boxShadow: `0px 0px 5px 1px ${textTheme}`,
              }}
              className="p-2 rounded font-semibold hover:opacity-80"
            >
              Generate RSA Keys
            </button>
          </div>
        </>
      )}

      <button
        onClick={handleGenerate}
        style={{ backgroundColor: theme, color: textTheme }}
        className="rounded p-2 font-bold hover:opacity-90"
      >
        Generate Token
      </button>

      <div className="">
        <span className="text-sm font-bold ">Generated JWT</span>

        <div className="flex gap-2 w-full ">
          <pre
            style={{
              "--theme": theme,
              border: `1px solid ${theme}`,
              color: textTheme,
            }}
            className={`bg-black font-bold p-2 w-full h-12 items-center rounded overflow-auto text-xs break-all ${styles.scrollContainer}`}
          >
            {token && <span>{token}</span>}
          </pre>

          <button
            onClick={handleCopy}
            style={{ backgroundColor: theme, color: textTheme }}
            className="p-2 text-xs rounded hover:opacity-80 font-bold "
          >
            Copy
          </button>
        </div>
      </div>
      <Dialog open={rsa} onOpenChange={setRsa}>
        <DialogContent className=" md:w-[60vw] 2xl:h-[70vh] h-[85vh] bg-black border-white border-2 text-white overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center" style={{ color: textTheme }}>
              RSA KEYS
            </DialogTitle>
            <div className="py-3 w-full flex justify-center items-center gap-4">
              <button
                onClick={generateRSAKeys}
                style={{ backgroundColor: theme, color: textTheme }}
                className="p-2 rounded font-semibold hover:opacity-80"
              >
                Generate RSA Keys
              </button>
              <button
                onClick={() => {
                  setPublicKey("");
                  setPrivateKey("");
                  toast.success("Keys cleared");
                }}
                className="p-2 rounded border"
              >
                Clear keys
              </button>
            </div>
            <div className="w-full     flex gap-2">
              <div className="w-full h-full flex flex-col gap-4">
                <textarea
                  style={{ border: `1px solid ${theme}`, color: textTheme }}
                  value={publicKey}
                  placeholder="Public Key (SPKI)"
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="p-2 rounded bg-black w-full font-mono text-xs resize-none 2xl:h-96 h-72"
                />
                <div className="w-full flex items-center justify-center">
                  <button
                    onClick={handleCopyPublic}
                    style={{ backgroundColor: theme, color: textTheme }}
                    className="p-2 font-bold w-3/4 rounded hover:opacity-80"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="w-full h-full flex flex-col gap-4">
                <textarea
                  style={{ border: `1px solid ${theme}`, color: textTheme }}
                  placeholder="Private Key (PKCS8)"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="p-2 rounded bg-black w-full font-mono text-xs resize-none 2xl:h-96 h-72"
                />
                <div className="w-full flex items-center justify-center">
                  <button
                    onClick={handlePrivate}
                    style={{ backgroundColor: theme, color: textTheme }}
                    className="p-2 w-3/4 font-bold  rounded hover:opacity-80"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
