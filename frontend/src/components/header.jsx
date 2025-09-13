import React from "react";
import { motion } from "framer-motion";

// Logo Component
export function Logo({ className = "" }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-3 ${className}`}
        >
            <div className="w-10 h-10 bg-blue-600! rounded-lg flex items-center justify-center">
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                </svg>
            </div>
            <span className="text-xl font-bold text-white">StudyBuddy</span>
        </motion.div>
    );
}

// Header Component
export function Header({ user, UserMenuComponent }) {
    // console.log('Header rendering with:', { user, UserMenuComponent });
    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-900 px-6 py-6"
            // style={{ backgroundColor: 'red' }}
        >
            <nav className="max-w-6xl mx-auto flex items-center justify-between">
                <Logo />
                {user && UserMenuComponent && <UserMenuComponent user={user} />}
                {/* yes */}
            </nav>
        </motion.header>
    );
}