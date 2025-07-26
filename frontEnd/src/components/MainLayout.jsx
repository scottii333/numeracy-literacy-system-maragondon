import React, { useState } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import Modal from "./Modal";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { HiOutlineMenuAlt3, HiOutlineLogout, HiOutlineX } from "react-icons/hi";
import { FiHome, FiClipboard, FiDatabase, FiBarChart2 } from "react-icons/fi";

export const MainLayout = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const stay = () => setModal(false);

  useIdleTimer(logout, () => setModal(true));

  const navItems = [
    { label: "Home", path: "/main", icon: <FiHome /> },
    {
      label: "Student Entry",
      path: "/main/student-entry",
      icon: <FiClipboard />,
    },
    {
      label: "Student Gradings",
      path: "/main/student-gradings",
      icon: <FiClipboard />,
    },
    {
      label: "Student Data",
      path: "/main/student-data",
      icon: <FiDatabase />,
    },
    {
      label: "Data Summary",
      path: "/main/data-summary",
      icon: <FiBarChart2 />,
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-lime-100 text-gray-800 font-inter">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r transform transition-transform duration-300 ease-in-out shadow-md ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold text-green-700">
            Maragondon NHS
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <HiOutlineX size={22} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item, idx) => (
            <NavLink
              to={item.path}
              key={idx}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "hover:bg-emerald-100 hover:text-green-700"
                }`
              }
              end={item.path === "/main"}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="mt-6 flex items-center gap-3 px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
          >
            <HiOutlineLogout />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border rounded shadow-md"
          aria-label="Open sidebar"
        >
          <HiOutlineMenuAlt3 size={22} />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 overflow-auto">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Inactivity Modal */}
      <Modal visible={modal} onStay={stay} />
    </div>
  );
};
