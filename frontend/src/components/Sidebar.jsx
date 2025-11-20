import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Trash2,
  Activity,
  MapPin,
  TrendingUp,
  Bell,
  LogOut,
  User,
} from "lucide-react";

const Sidebar = ({ getAreaAlerts }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get username from localStorage
  const username = localStorage.getItem("username") || "User";

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    navigate("/login", { replace: true });
  };

  // Determine active view based on current route
  const getActiveView = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/overview")
      return "overview";
    if (path === "/dashboard/bins") return "bins";
    if (path === "/dashboard/map") return "map";
    if (path === "/dashboard/analytics") return "analytics";
    if (path === "/dashboard/alerts") return "alerts";
    return "overview";
  };

  const activeView = getActiveView();

  const handleNavigation = (view) => {
    if (view === "overview") {
      navigate("/dashboard/overview");
    } else {
      navigate(`/dashboard/${view}`);
    }
  };

  return (
    <div className="w-64 bg-white text-slate-900 shadow-lg border-r border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Trash2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Smart Waste</h1>
            <p className="text-xs text-slate-500 font-medium">
              Management System
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => handleNavigation("overview")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeView === "overview"
              ? "bg-emerald-50 text-emerald-700 font-semibold"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="font-medium">Overview</span>
        </button>

        <button
          onClick={() => handleNavigation("bins")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeView === "bins"
              ? "bg-emerald-50 text-emerald-700 font-semibold"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <Trash2 className="w-5 h-5" />
          <span className="font-medium">Bin Status</span>
        </button>

        <button
          onClick={() => handleNavigation("analytics")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeView === "analytics"
              ? "bg-emerald-50 text-emerald-700 font-semibold"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">Analytics</span>
        </button>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200 space-y-3">
        {/* User Info */}
        <div className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">Logged in as</p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {username}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
