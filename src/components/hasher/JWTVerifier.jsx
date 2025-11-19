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
import { DialogClose } from "@radix-ui/react-dialog";

export default function JWTVerifier({ theme, textTheme }) {
  const [verifySecret, setVerifySecret] = useState("");
  const [verifyAlgorithm, setVerifyAlgorithm] = useState("HS256");
  const [verifyToken, setVerifyToken] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyPublicKey, setVerifyPublicKey] = useState("");

  const handleVerify = async () => {
    try {
      if (!verifyToken) return toast.error("Paste a token to verify");

      const parts = verifyToken.split(".");
      if (parts.length !== 3) throw new Error("Invalid token format");

      const headerJson = JSON.parse(
        atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"))
      );
      const algFromToken = headerJson.alg;

      let payloadVerified;

      if (algFromToken && algFromToken.startsWith("HS")) {
        if (!verifySecret)
          return toast.error("Secret required to verify HS tokens");
        const key = new TextEncoder().encode(verifySecret);
        const { payload: pl } = await jose.jwtVerify(verifyToken, key);
        payloadVerified = pl;
      } else if (algFromToken === "RS256") {
        if (!verifyPublicKey)
          return toast.error("Public key required to verify RS tokens");

        // Importar clave pública con encabezados PEM
        const pubKey = await jose.importSPKI(verifyPublicKey.trim(), "RS256");
        const { payload: pl } = await jose.jwtVerify(verifyToken, pubKey);
        payloadVerified = pl;
      } else {
        throw new Error("Unsupported algorithm in token");
      }

      setVerificationResult(payloadVerified);
      toast.success("Token valid!");
    } catch (err) {
      console.error("verify error:", err);
      setVerificationResult(null);
      toast.error("Invalid token or verification failed");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-4">
          <div className="w-3/4">
            <label className="text-sm font-bold ">Verify JWT</label>
            <input
              type="text"
              style={{ color: textTheme, border: `1px solid ${theme}` }}
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              className="p-2 rounded bg-transparent font-mono text-sm w-full"
              placeholder="Paste a JWT token here..."
            />
          </div>
          <div className="w-1/4">
            <label className="text-sm font-bold ">Algorithm</label>
            <Select
              style={{ color: textTheme }}
              value={verifyAlgorithm}
              onValueChange={setVerifyAlgorithm}
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
        </div>

        {verifyAlgorithm != "RS256" ? (
          <>
            <label className="text-sm font-bold ">Secret key</label>
            <input
              type="text"
              style={{ color: textTheme, border: `1px solid ${theme}` }}
              value={verifySecret}
              onChange={(e) => setVerifySecret(e.target.value)}
              className="p-2 rounded bg-transparent w-full"
              placeholder="Secret key"
            />
          </>
        ) : (
          <>
            <div className="w-full h-full flex items-center justify-center">
              <Dialog>
                <DialogTrigger
                  style={{
                    backgroundColor: theme,
                    color: textTheme,
                    boxShadow: `0px 0px 5px 1px ${textTheme}`,
                  }}
                  className="p-2 rounded w-3/4 md:w-1/4 font-semibold hover:opacity-80"
                >
                  Public Key
                </DialogTrigger>
                <DialogContent className="flex flex-col  justify-center gap-2 w-full md:w-80 h-[80vh] 2xl:h-[60vh] 2xl:w-[90vw] bg-black border-white border-2 text-white overflow-hidden">
                  <DialogHeader></DialogHeader>
                  <DialogTitle
                    className="text-center"
                    style={{ color: textTheme }}
                  >
                    Public Key
                  </DialogTitle>
                  <div
                    style={{ color: textTheme }}
                    className="flex flex-col gap-4"
                  >
                    <textarea
                      style={{ border: `1px solid ${theme}` }}
                      placeholder={`-----BEGIN PUBLIC KEY-----\n\n\n\n........\n\n\n\n\n\n\n-----END PUBLIC KEY-----`}
                      value={verifyPublicKey}
                      onChange={(e) => setVerifyPublicKey(e.target.value)}
                      className=" p-2 rounded bg-black font-mono text-xs w-full h-80 resize-none"
                    />
                    <DialogClose
                      style={{ backgroundColor: theme }}
                      className="flex w-full font-bold items-center justify-center hover:opacity-80 duration-300 p-2 rounded"
                    >
                      Close
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleVerify}
        style={{ backgroundColor: theme, color: textTheme }}
        className="rounded p-2 font-bold w-full mt-2 hover:opacity-90"
      >
        Verify
      </button>

      <div className="mt-2">
        <label className="text-sm font-bold ">Decoded Payload</label>
        <pre
          style={{
            "--theme": textTheme,
            border: `1px solid ${theme}`,
            color: textTheme,
          }}
          className={`bg-black/50 p-2 rounded overflow-auto text-xs break-all h-40 ${styles.scrollContainer}`}
        >
          {verificationResult && JSON.stringify(verificationResult, null, 2)}
        </pre>
      </div>
    </div>
  );
}
