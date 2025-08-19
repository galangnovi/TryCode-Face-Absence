"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, StarOff } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

interface Attendance {
  id: string;
  employee_name: string;
  arrival_time: string; // iso string
  score?: number; // optional, nanti pakai untuk bintang
}
interface AttendanceListProps {
  refreshTrigger?: boolean; // kalau berubah, fetch ulang
}

interface Employee {
  id: string;
  name: string;
  face_descriptor: number[];
}

interface AttendanceDB {
  id: string;
  created_at: string;
  employees: Employee[]; // note: array
}


export default function AttendanceList({ refreshTrigger }: AttendanceListProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
            id,
            created_at,
            employees!inner(name)
        `);

      if (error) {
        console.error("Gagal fetch attendance:", error);
        setLoading(false);
        return;
      }

      const formatted = (data as AttendanceDB[]).map((item: any) => ({
        id: item.id,
        employee_name: item.employees.name,
        arrival_time: item.created_at,
        score: calculateScore(item.created_at),
      }));

      setAttendances(formatted);
      setLoading(false);
    };

    fetchAttendance();
  }, [refreshTrigger]);

 

  // Hitung score berdasarkan jam kedatangan
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const calculateScore = (arrivalTime: string) => {
    // Convert UTC → WIB
    const arrivalWIB = dayjs.utc(arrivalTime).tz("Asia/Jakarta");

    // Limit jam 07:00 WIB di tanggal yang sama
    const limit = arrivalWIB.hour(7).minute(0).second(0);

    return arrivalWIB.isBefore(limit) || arrivalWIB.isSame(limit) ? 5 : 3;
    };

  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= score) stars.push(<Star key={i} className="inline text-yellow-400" />);
      else stars.push(<StarOff key={i} className="inline text-gray-300" />);
    }
    return stars;
  };

  if (loading) return <p>Loading attendance...</p>;

  return (
    <div className="grid grid-flow-row auto-rows-max grid-cols-3 gap-3 p-2 w-full">
  {attendances.length === 0 && <p>No attendance records</p>}

  {attendances.map((att) => {
    const status = att.score===5 ? "Tepat Waktu" : "Terlambat";

    return (
      <Card key={att.id} className="shadow-lg">
        <CardHeader>
          <CardTitle>{att.employee_name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            {dayjs.utc(att.arrival_time).tz("Asia/Jakarta").format("HH:mm")} - {status}
          </p>
          <div className="flex">{renderStars(att.score || 0)}</div>
        </CardContent>
      </Card>
    );
  })}
</div>

  );
}
