// @ts-nocheck
import React from "react";
import { motion } from "framer-motion";

// Badge Component
export function Badge({ children, className = "" }) {
  return (
    <motion.span
      className={`inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-medium ${className}`}
      whileHover={{
        scale: 1.05,
      }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      {children}
    </motion.span>
  );
}

// Main Title Component
export function MainTitle({ title, highlightText, className = "" }) {
  return (
    <motion.h1
      initial={{ y: 100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        delay: 0.3,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className={`text-5xl md:text-7xl font-bold text-white mb-8 leading-tight ${className}`}
    >
      {title}
      <br />
      <span className="text-blue-400">{highlightText}</span>
    </motion.h1>
  );
}

// Subtitle Component
export function Subtitle({ children, className = "" }) {
  return (
    <motion.p
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: 0.4,
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
      className={`text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed ${className}`}
    >
      {children}
    </motion.p>
  );
}

// CTA Button Component
export function CTAButton({ href, children, onClick, className = "" }) {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <motion.a
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      onClick={handleClick}
      className={`inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 ${className}`}
    >
      {children}
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </motion.a>
  );
}

// Feature Card Component
export function FeatureCard({ icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        delay: 0.6 + index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
    >
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

// Features Grid Component
export function FeaturesGrid({ features = [] }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: 0.6,
        staggerChildren: 0.1,
      }}
      className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
    >
      {features.map((feature, index) => (
        <FeatureCard key={feature.title} {...feature} index={index} />
      ))}
    </motion.div>
  );
}

// Complete Hero Section Component
export function HeroSection({
  user,
  AuthButtonComponent,
  title,
  highlightText,
  subtitle,
  features = [],
  onNavigateToDashboard,
}) {
  return (
    <main className="px-6 py-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="mb-8"
        >
          <Badge>🎓 Join thousands of students studying together</Badge>
        </motion.div>

        {/* Main Title */}
        <MainTitle title={title} highlightText={highlightText} />

        {/* Subtitle */}
        <Subtitle>{subtitle}</Subtitle>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 25,
          }}
          className="mb-16"
        >
          {user ? (
            <CTAButton href="/dashboard" onClick={onNavigateToDashboard}>
              Go to Dashboard
            </CTAButton>
          ) : (
            AuthButtonComponent && <AuthButtonComponent />
          )}
        </motion.div>

        {/* Features Grid */}
        <FeaturesGrid features={features} />
      </div>
    </main>
  );
}
