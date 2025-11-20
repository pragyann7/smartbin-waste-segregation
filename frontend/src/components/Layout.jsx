import Sidebar from "./Sidebar";

const Layout = ({ getAreaAlerts, children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar getAreaAlerts={getAreaAlerts} />
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
};

export default Layout;
