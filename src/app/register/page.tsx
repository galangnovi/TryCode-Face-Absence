"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Loading models...");

  useEffect(() => {
    const loadModels = async () => {
      const faceapi = await import("@vladmandic/face-api");
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      setStatus("Models loaded, ready!");
      startVideo();
    };
    loadModels();
  }, []);

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const handleRegister = async () => {
    console.log("sampai disini")
    if (!videoRef.current || !name) return;
    const faceapi = await import("@vladmandic/face-api");
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
    const detection = await faceapi
      .detectSingleFace(videoRef.current, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("❌ Wajah tidak terdeteksi");
      return;
    }
    if (!detection || !detection.descriptor) {
  setStatus("❌ Wajah terdeteksi tapi descriptor gagal dibuat (cek model faceRecognitionNet)");
  return;
}


    const descriptorArray = Array.from(detection.descriptor); // simpan ke Supabase
    const { error } = await supabase.from("employees").insert({
      name,
      face_descriptor: descriptorArray,
    });

    if (error) setStatus("❌ Gagal simpan: " + error.message);
    else setStatus(`✅ Registrasi berhasil untuk ${name}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Registrasi Siswa</h1>
      <input
        type="text"
        placeholder="Nama karyawan"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-3 py-2 rounded"
      />
      <video ref={videoRef} autoPlay muted width="400" height="300" className="rounded-lg shadow" />
      <button
        onClick={handleRegister}
        className="px-4 py-2 bg-green-600 text-white rounded-lg shadow cursor-pointer hover:!bg-green-400"
      >
        Daftar Wajah
      </button>
      <p className="text-xl">{status}</p>
    </div>
  );
}
