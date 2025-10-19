import { LogOut } from "lucide-react";
import { menuItems } from "../../lib/constants/features";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signOutUser } from "../../firebase/auth";
import { toast } from "sonner";


export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const navigation = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        !(event.target.closest(".sidebar-container")) &&
        !(event.target.closest(".mobile-menu-btn"))
      ) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileOpen]);

  const handleSignOut = async () => {
    // console.log("Signing out...");
    return (
      navigation('/'),
      await signOutUser()
      .then(() => toast.success("Successfully signed out!") )
      
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMobileOpen(!isMobileOpen);
        }}
        className="md:hidden fixed top-4 right-4 z-9000 !bg-white flex flex-col justify-center items-center space-y-1.5 w-10 h-10 rounded-lg  transition-colors"
        aria-label="Toggle menu"
      >
        <div
          className={`h-0.5 w-6 bg-slate-900 rounded transition-all duration-300 ${
            isMobileOpen ? "rotate-45 translate-y-2 w-7 !bg-slate-900 " : "w-5"
          }`}
        />
        <div
          className={`h-0.5 bg-slate-900 rounded transition-all duration-300 ${
            isMobileOpen ? "opacity-0 w-0" : "w-7"
          }`}
        />
        <div
          className={`h-0.5 bg-slate-900 rounded transition-all duration-300 ${
            isMobileOpen
              ? "-rotate-45 -translate-y-2 w-7 !bg-slate-900 "
              : "w-4"
          }`}
        />
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out
          ${isDesktopCollapsed ? "md:w-20" : "md:w-54"}
          md:static md:translate-x-0 md:h-screen
          fixed top-0 left-0 z-40 h-full w-64
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <a href="/" className={isDesktopCollapsed ? "md:hidden" : ""}>
            <h4
              className={`text-xl font-bold cursor-pointer text-white duration-500${
                isDesktopCollapsed ? "md:hidden" : ""
              }`}
            >
              StudyBuddy
            </h4>
          </a>


          <button
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className="hidden md:block text-gray-400 hover:text-white transition-colors bg-transparent!"
            aria-label={
              isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isDesktopCollapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span
                className={`text-sm font-medium text-white ${
                  isDesktopCollapsed ? "md:hidden" : ""
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 text-xs text-gray-400">
          <Button className="bg-red-700! rounded-md! text-3xl hover:bg-red-600!" onClick={()=>(handleSignOut())}>
          {isDesktopCollapsed ?
          (<LogOut className="w-6 h-6 text-white"/> )  : ("Sign out")}
            
          </Button>
          
          
        </div>
      </div>
    </>
  );
}
