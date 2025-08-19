"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { supabase } from "../lib/supabase";
import AttendanceList from "@/componens/rightside";

export default function Home() {

  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Loading models...");
  const [refreshAttendance, setRefreshAttendance] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      setStatus("Models loaded, ready!");
      startVideo();
    };
    loadModels();
  }, [setStatus]);

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const euclideanDistance = (a: number[], b: number[]) =>
    Math.sqrt(a.map((val, i) => (val - b[i]) ** 2).reduce((acc, v) => acc + v, 0));

  const handleAbsensi = async () => {
    if (!videoRef.current) return;

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("❌ Wajah tidak terdeteksi");
      return;
    }

    const descriptorArray = Array.from(detection.descriptor);

    // ambil semua karyawan dari supabase
    const { data: employees, error } = await supabase.from("employees").select("*");
    if (error) {
      setStatus("❌ Gagal ambil data: " + error.message);
      return;
    }

    async function deleteOldEmployees() {
  const { error } = await supabase
    .from('employees')
    .delete()
    .lt('created_at', new Date(Date.now() -  12 * 60 * 60 * 1000).toISOString()); // 12 jam

  if (error) console.error(error);
  else console.log('Old employees deleted');
}

deleteOldEmployees();

    let matchUser = null;
    let minDistance = 1.0;

    for (const emp of employees!) {
      const distance = euclideanDistance(emp.face_descriptor, descriptorArray);
      if (distance < 0.6 && distance < minDistance) {
        matchUser = emp;
        minDistance = distance;
      }
    }

    if (matchUser) {
      // catat absensi
      await supabase.from("attendance").insert({ employee_id: matchUser.id });
      setStatus(`✅ Absen berhasil: ${matchUser.name}`);
      setRefreshAttendance(prev => !prev);
    } else {
      setStatus("❌ Wajah tidak dikenali");
    }
  };
  return (
    <div className="flex">
      <AttendanceList refreshTrigger={refreshAttendance}/>
      <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Absensi Siswa</h1>
      <video ref={videoRef} autoPlay muted width="400" height="300" className="rounded-lg shadow" />
      <button
        onClick={handleAbsensi}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow cursor-pointer hover:!bg-blue-400"
      >
        Absen Sekarang
      </button>
      <p className="text-xl">{status}</p>
    </div>
    </div>
    
  );
}
