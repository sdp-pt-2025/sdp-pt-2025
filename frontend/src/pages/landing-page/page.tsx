// @ts-nocheck
import { motion } from "framer-motion";
import { useAuthContext } from "@/provider";
import { AuthButton, UserMenu } from "@/components/auth/auth";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";

import features from "@/constants/features";

export default function ModernLandingPage() {
  const { user } = useAuthContext();

  const feat = features;

  const handleNavigateToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 w-full">
      {/* Header */}
      <Header user={user} UserMenuComponent={UserMenu} />

      {/* Hero Section */}
      <HeroSection
        user={user}
        AuthButtonComponent={AuthButton}
        title="Find Your Perfect"
        highlightText="Study Partner"
        subtitle="Connect with students in your courses, form study groups, and transform your university experience through collaborative learning."
        features={feat}
        onNavigateToDashboard={handleNavigateToDashboard}
      />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 px-6 py-12 border-t border-gray-700"
      >
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} StudyBuddy. Empowering students to
            learn together.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
