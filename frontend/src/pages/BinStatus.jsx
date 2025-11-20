import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import axios from "axios";

const generateHistoricalData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    metal: Math.floor(Math.random() * 100) + 50,
    plastic: Math.floor(Math.random() * 150) + 100,
    bio: Math.floor(Math.random() * 120) + 80,
  }));
};

const getStatusColor = (fillLevel) => {
  if (fillLevel >= 80) return "bg-red-500";
  if (fillLevel >= 60) return "bg-orange-500";
  return "bg-green-500";
};

const getStatusBadge = (fillLevel) => {
  if (fillLevel >= 80) return "text-red-600 bg-red-100";
  if (fillLevel >= 60) return "text-orange-600 bg-orange-100";
  return "text-green-600 bg-green-100";
};

const BinStatus = () => {
  const [bins, setBins] = useState([]);
  const [historicalData] = useState(generateHistoricalData());

  useEffect(() => {
    try {
      const fetchSmartBin = async () => {
        const res = await axios.get("http://127.0.0.1:8000/wasteread/");
        setBins(res.data || res);
        console.log("Data:", res);
      };

      fetchSmartBin();
    } catch (error) {
      console.error("Error fetching smart bin data:", error);
    }
  }, []);
  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Bin Status Monitor
          </h2>
          <p className="text-slate-600 mt-1 font-medium">
            Real-time waste management monitoring for Pokhara Municipality
          </p>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bins.map((bin) => (
            <div
              key={bin.bin}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`h-1.5 ${getStatusColor(bin.fill_level)}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {"CH00" + bin.bin}
                  </h3>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(
                      bin.fill_level
                    )} shadow-sm`}
                  >
                    {bin.fill_level >= 80
                      ? "Critical"
                      : bin.fill_level >= 60
                      ? "Warning"
                      : "Good"}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4 flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {bin.full_address}
                </p>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                    <div className="text-center bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-600 font-semibold mb-1">
                        Metal
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {bin.metal}%
                      </p>
                    </div>
                    <div className="text-center bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-slate-600 font-semibold mb-1">
                        Plastic
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {bin.plastic}%
                      </p>
                    </div>
                    <div className="text-center bg-emerald-50 rounded-lg p-2">
                      <p className="text-xs text-slate-600 font-semibold mb-1">
                        Bio
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        {bin.bio}%
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-200 font-medium">
                    Updated: {new Date(bin.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BinStatus;
