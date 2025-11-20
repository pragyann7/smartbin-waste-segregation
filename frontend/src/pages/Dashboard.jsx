import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

const generateHistoricalData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    metal: Math.floor(Math.random() * 100) + 50,
    plastic: Math.floor(Math.random() * 150) + 100,
    bio: Math.floor(Math.random() * 120) + 80,
  }));
};

const Dashboard = () => {
  const [bins, setBins] = useState([]);
  const [historicalData] = useState(generateHistoricalData());

  useEffect(() => {
    const interval = setInterval(() => {
      setBins((prevBins) =>
        prevBins.map((bin) => ({
          ...bin,
          fill_level: Math.min(100, bin.fill_level + Math.random() * 2),
          timestamp: new Date().toISOString(),
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   const fetchSmartBin = async () => {
  //     try {
  //       const res = await axios.get("http://127.0.0.1:8000/latest-readings/");
  //       setBins(res.data || res);
  //       console.log("Data:", res);
  //     } catch (error) {
  //       console.error("Error fetching smart bin data:", error);
  //     }
  //   };
  //   fetchSmartBin();
  // }, []);

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

  const getAreaAlerts = () => {
    const areaMap = {};

    bins.forEach((bin) => {
      if (!areaMap[bin.area]) {
        areaMap[bin.area] = {
          area: bin.area,
          bins: [],
          totalFillLevel: 0,
          binCount: 0,
        };
      }
      areaMap[bin.area].bins.push(bin);
      areaMap[bin.area].totalFillLevel += bin.fill_level;
      areaMap[bin.area].binCount += 1;
    });

    const areas = Object.values(areaMap).map((areaData) => ({
      ...areaData,
      avgFillLevel: areaData.totalFillLevel / areaData.binCount,
      centerLocation: {
        lat:
          areaData.bins.reduce((sum, b) => sum + b.location.lat, 0) /
          areaData.binCount,
        lng:
          areaData.bins.reduce((sum, b) => sum + b.location.lng, 0) /
          areaData.binCount,
      },
    }));

    return areas
      .filter((area) => area.avgFillLevel >= 60)
      .sort((a, b) => b.avgFillLevel - a.avgFillLevel);
  };

  const outletContext = {
    bins,
    historicalData,
    getStatusColor,
    getStatusBadge,
    getAreaAlerts,
  };

  return (
    <Layout getAreaAlerts={getAreaAlerts}>
      <Outlet context={outletContext} />
    </Layout>
  );
};

export default Dashboard;
