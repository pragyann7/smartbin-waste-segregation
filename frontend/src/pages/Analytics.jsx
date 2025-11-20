import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const generateDummyBins = () => [
  {
    bin_id: "CHT001",
    location: { lat: 27.678, lng: 84.432 },
    metal: 35,
    plastic: 55,
    bio: 20,
    fill_level: 75,
    timestamp: "2025-11-06T10:20:00Z",
    status: "warning",
    address: "Pokhara City Center",
  },
  {
    bin_id: "CHT002",
    location: { lat: 27.685, lng: 84.425 },
    metal: 45,
    plastic: 30,
    bio: 25,
    fill_level: 92,
    timestamp: "2025-11-06T10:18:00Z",
    status: "critical",
    address: "Mahendrapul Area",
  },
  {
    bin_id: "CHT003",
    location: { lat: 27.672, lng: 84.44 },
    metal: 20,
    plastic: 40,
    bio: 40,
    fill_level: 45,
    timestamp: "2025-11-06T10:22:00Z",
    status: "good",
    address: "Lakeside Road",
  },
  {
    bin_id: "CHT004",
    location: { lat: 27.69, lng: 84.435 },
    metal: 30,
    plastic: 45,
    bio: 25,
    fill_level: 68,
    timestamp: "2025-11-06T10:19:00Z",
    status: "warning",
    address: "Prithvi Chowk",
  },
  {
    bin_id: "CHT005",
    location: { lat: 27.665, lng: 84.428 },
    metal: 15,
    plastic: 35,
    bio: 50,
    fill_level: 30,
    timestamp: "2025-11-06T10:21:00Z",
    status: "good",
    address: "Birauta",
  },
];
const generateHistoricalData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    metal: Math.floor(Math.random() * 100) + 50,
    plastic: Math.floor(Math.random() * 150) + 100,
    bio: Math.floor(Math.random() * 120) + 80,
  }));
};

const Analytics = () => {
  const [bins, setBins] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest readings (one per bin) to show composition per bin
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://127.0.0.1:8000/latest-readings/");
        const data = res.data || [];

        // Normalize readings to a shape expected by charts
        const normalized = data.map((r) => {
          // r.bin might be an object or an id depending on serializer
          const binObj = r.bin && typeof r.bin === "object" ? r.bin : null;
          const bin_id = binObj
            ? binObj.bin_id || binObj.id
            : r.bin || r.bin_id || "unknown";
          const address = binObj ? binObj.address || "" : r.address || "";

          return {
            bin_id,
            metal: typeof r.metal === "number" ? r.metal : Number(r.metal) || 0,
            plastic:
              typeof r.plastic === "number"
                ? r.plastic
                : Number(r.plastic) || 0,
            bio: typeof r.bio === "number" ? r.bio : Number(r.bio) || 0,
            fill_level:
              typeof r.fill_level === "number"
                ? r.fill_level
                : Number(r.fill_level) || 0,
            timestamp: r.timestamp,
            status:
              r.status ||
              (r.fill_level >= 80
                ? "critical"
                : r.fill_level >= 60
                ? "warning"
                : "good"),
            address,
          };
        });

        setBins(normalized);
      } catch (err) {
        console.error("Error fetching latest readings:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  // Fetch historical waste readings and aggregate by day for last 7 days
  useEffect(() => {
    const fetchHistorical = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/wasteread/");
        const data = res.data || [];

        // build 7-day labels (oldest -> newest)
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          days.push(d);
        }

        const aggregated = days.map((d) => {
          const label = d.toLocaleDateString(undefined, { weekday: "short" });
          // sum readings that occurred on the same date
          const sums = data.reduce(
            (acc, r) => {
              const ts = r.timestamp ? new Date(r.timestamp) : null;
              if (!ts) return acc;
              if (
                ts.getFullYear() === d.getFullYear() &&
                ts.getMonth() === d.getMonth() &&
                ts.getDate() === d.getDate()
              ) {
                acc.metal += Number(r.metal) || 0;
                acc.plastic += Number(r.plastic) || 0;
                acc.bio += Number(r.bio) || 0;
              }
              return acc;
            },
            { metal: 0, plastic: 0, bio: 0 }
          );

          return {
            day: label,
            metal: sums.metal,
            plastic: sums.plastic,
            bio: sums.bio,
          };
        });

        setHistoricalData(aggregated);
      } catch (err) {
        console.error("Error fetching historical readings:", err);
      }
    };

    fetchHistorical();
  }, []);
  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-bold text-slate-900">Waste Analytics</h2>
          <p className="text-slate-600 mt-1 font-medium">
            Real-time waste management monitoring for Pokhara Municipality
          </p>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          {/* Weekly Trends */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Weekly Waste Collection Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="metal"
                  stroke="#64748b"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="plastic"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="bio"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Waste Composition by Bin
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={bins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="metal" fill="#64748b" />
                <Bar dataKey="plastic" fill="#3b82f6" />
                <Bar dataKey="bio" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
