import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Vortex } from "../../components/ui/vortex";
import { CanvasRevealEffect } from "../../components/ui/canvas-reveal-effect";
import { LampContainer } from "../../components/ui/lamp";
import { InfiniteMovingCards } from "../../components/ui/infinite-moving-cards";
import { AuthButton, UserMenu } from "../../components/auth/auth";
import { Header } from "../../components/header";
import { SparklesCore} from "../../components/ui/sparkles"
import features, { Testimonials } from "../../lib/constants/features";
import { auth } from "../../firebase/init";
import { signInWithGoogle } from "../../firebase/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { FlipWords } from "@/components/ui/flip-words";

export default function StudyBuddyLanding() {
  const { user } = useAuthContext();
  const [hoveredCard, setHoveredCard] = useState(null);
  const words = [
    "collaborative learning",
    "smart study groups",
    "mentorship", 
    "academic excellence",
    "peer connections",
    "interactive sessions",
    "goal achievement",
    "knowledge sharing",
    "study optimization"
  ];
  
  
 

  const studyFeatures = features

  const testimonials = Testimonials

  const navigate = useNavigate()

  const handleClick = async () => {
    if (user) {
       navigate("/dashboard");
    } else {
     await signInWithGoogle()
    }
  }



  return (
    <div className="min-h-screen bg-blue-900 overflow-hidden">
      <Header user={user} UserMenuComponent={UserMenu} className="z-800!"/>  
      
      <section className="relative h-screen flex items-center justify-center">
        
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>

        
        <div className="relative z-10 flex items-center justify-center h-full w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center px-8 max-w-6xl mx-auto"
          >
            <motion.h1 
              className="text-white text-4xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% 100%",
              }}
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              StudyBuddy
            </motion.h1>
            
            <motion.p 
              className="text-cyan-200 text-lg md:text-3xl max-w-4xl mx-auto mb-12 font-light leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Transform your university experience through 
              <span className="text-gradient bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent font-semibold"> <FlipWords className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl text-white" words={words} /> <br /></span>. 
              Find your perfect study partners and unlock your academic potential.
            </motion.p>

            {/* <ContainerTextFlip
            className="mb-8"
                words={["Intuitive", "Stunning", "Fast", "Try It"]}
            /> */}
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-6 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 rounded-full text-white text-xl font-semibold shadow-2xl shadow-cyan-500/25 border border-cyan-400/30"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClick}
              >
                {user ? "Go to Dashboard" : "Start Matching"}
              </motion.button>
              
              <motion.button 
                className="px-8 py-4 text-white text-xl font-semibold border-2 border-white/20 rounded-full hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 backdrop-blur-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={()=> toast.success("Demo coming soon!",{duration:5000})}
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
          
       
        
      </section>

      
      <section className="py-32 bg-gradient-to-b from-gray-900 to-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <motion.h2 
            className="text-5xl md:text-7xl font-bold text-center mb-20 bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Revolutionary Features
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {studyFeatures.map((feature, index) => (
              <FeatureCard 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lamp Section */}
      <section className="relative">
        <LampContainer>
          <motion.div
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-8 text-center"
          >
            <h2 className="bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-5xl md:text-8xl font-medium tracking-tight text-transparent mb-8">
              Study Smarter<br />Together
            </h2>
            <p className="text-slate-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Join thousands of students who have revolutionized their learning experience through collaborative study partnerships.
            </p>
          </motion.div>
        </LampContainer>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-blue-900">
        <motion.h2 
          className="text-4xl md:text-6xl font-bold text-center mb-12 text-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Student Success Stories
        </motion.h2>
        <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
      </section>

      
      <section className="py-32 bg-gradient-to-r from-cyan-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto text-center px-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-7xl font-bold text-white mb-8">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-cyan-200 text-xl md:text-2xl mb-12 leading-relaxed">
            Join the community of high-achieving students who study together, succeed together.
          </p>
          <motion.button
            className="px-12 py-6 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 transition-all duration-300 rounded-full text-white text-2xl font-bold shadow-2xl shadow-pink-500/25"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px rgba(236, 72, 153, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-black py1-1 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center px-8">
          <p className="text-gray-400 text-md">
            © {new Date().getFullYear()} StudyBuddy. Empowering students to learn together.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
const FeatureCard = ({ title, description, icon, index }) => {
  const [hovered, setHovered] = useState(false);
  
  const colors = [
    [[34, 197, 94]], // Green
    [[168, 85, 247]], // Purple  
    [[59, 130, 246]]  // Blue
  ];

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="border border-gray-700 group/canvas-card flex items-center justify-center max-w-sm w-full mx-auto p-8 relative h-[25rem] rounded-3xl backdrop-blur-sm bg-gray-900/50 overflow-hidden">
        {/* Corner decorations */}
        <div className="absolute h-6 w-6 -top-3 -left-3 text-cyan-400">
          <PlusIcon />
        </div>
        <div className="absolute h-6 w-6 -bottom-3 -left-3 text-cyan-400">
          <PlusIcon />
        </div>
        <div className="absolute h-6 w-6 -top-3 -right-3 text-cyan-400">
          <PlusIcon />
        </div>
        <div className="absolute h-6 w-6 -bottom-3 -right-3 text-cyan-400">
          <PlusIcon />
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0"
            >
              <CanvasRevealEffect
                animationSpeed={3}
                containerClassName="bg-black"
                colors={colors[index]}
                dotSize={2}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-20 text-center">
  <motion.div
    className="md:group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center text-6xl mb-6"
    whileHover={{ scale: 1.1 }}
  >
    {icon}
  </motion.div>
  <h3 className="text-white text-2xl opacity-100 md:opacity-0 group-hover/canvas-card:opacity-100 relative z-10 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 mb-4">
    {title}
  </h3>
  <p className="text-gray-300 text-sm opacity-100 md:opacity-0 group-hover/canvas-card:opacity-100 group-hover/canvas-card:-translate-y-2 transition duration-200 leading-relaxed">
    {description}
  </p>
</div>
      </div>
    </motion.div>
  );
};

// Icons
const BrainIcon = () => (
  <svg className="w-16 h-16 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const GroupIcon = () => (
  <svg className="w-16 h-16 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v-3c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v3h3v4H4zm12-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1v-4z"/>
  </svg>
);

const ChartIcon = () => (
  <svg className="w-16 h-16 text-green-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
  </svg>
);

const PlusIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);