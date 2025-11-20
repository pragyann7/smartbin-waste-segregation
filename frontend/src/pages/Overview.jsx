import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trash2, AlertCircle, Activity, TrendingUp } from "lucide-react";
import axios from "axios";

const Overview = () => {
  const [bins, setBins] = useState([]);
  const [latestData, setLatestData] = useState([]);
  const totalBins = bins.length;
  // Use latestData for status and fill level calculations
  const criticalBins = bins.filter((b) => b.status === "Critical").length;
  const warningBins = bins.filter((b) => b.status === "Warning").length;
  const avgFillLevel =
    latestData.length > 0
      ? (
          latestData.reduce(
            (sum, b) =>
              sum + (typeof b.fill_level === "number" ? b.fill_level : 0),
            0
          ) / latestData.length
        ).toFixed(1)
      : "0.0";

  useEffect(() => {
    try {
      const fetchSmartBin = async () => {
        const res = await axios.get("http://127.0.0.1:8000/smartbin/");
        setBins(res.data || res);
      };

      fetchSmartBin();
    } catch (error) {
      console.error("Error fetching smart bin data:", error);
    }
  }, []);
  useEffect(() => {
    try {
      const fetchSmartBin = async () => {
        const res = await axios.get("http://127.0.0.1:8000/latest-readings/");
        setLatestData(res.data || res);
        console.log("Data:", res);
      };

      fetchSmartBin();
    } catch (error) {
      console.error("Error fetching smart bin data:", error);
    }
  }, []);

  const wasteTypeData = [
    {
      name: "Metal",
      value: bins.reduce((sum, b) => sum + b.metal, 0),
      color: "#64748b",
    },
    {
      name: "Plastic",
      value: bins.reduce((sum, b) => sum + b.plastic, 0),
      color: "#3b82f6",
    },
    {
      name: "Biodegradable",
      value: bins.reduce((sum, b) => sum + b.bio, 0),
      color: "#22c55e",
    },
  ];
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

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Dashboard Overview
          </h2>
          <p className="text-slate-600 mt-1 font-medium">
            Real-time waste management monitoring for Pokhara Municipality
          </p>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">
                    Total Bins
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {totalBins}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50">
                  <Trash2 className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">
                    Critical Bins
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {criticalBins}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-50">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">
                    Warning Bins
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {warningBins}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">
                    Avg Fill Level
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {avgFillLevel}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/50 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                Recent Bin Updates
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Bin ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Fill Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Last Update
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
                  {latestData.map((reading) => {
                    const binObj =
                      reading.bin && typeof reading.bin === "object"
                        ? reading.bin
                        : null;
                    const binId = binObj
                      ? binObj.bin_id || binObj.id
                      : reading.bin || reading.bin_id || "unknown";
                    const address = binObj
                      ? binObj.full_address || ""
                      : reading.full_address || "";
                    const fillLevel = reading.fill_level || 0;
                    const timestamp =
                      reading.timestamp || new Date().toISOString();

                    return (
                      <tr
                        key={binId}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {binId}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {address}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-slate-200 rounded-full h-2.5 shadow-inner">
                              <div
                                className={`h-2.5 rounded-full transition-all duration-300 ${getStatusColor(
                                  fillLevel
                                )}`}
                                style={{ width: `${fillLevel}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">
                              {typeof fillLevel === "number"
                                ? fillLevel.toFixed(0)
                                : "0"}
                              %
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(
                              fillLevel
                            )} shadow-sm`}
                          >
                            {fillLevel >= 80
                              ? "Critical"
                              : fillLevel >= 60
                              ? "Warning"
                              : "Good"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {new Date(timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
