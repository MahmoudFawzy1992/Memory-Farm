import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: "🧠",
      title: "Smart Memory Journaling",
      description: "Capture your thoughts with intelligent emotion tracking and mood analysis.",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      icon: "📊",
      title: "Mood Analytics",
      description: "Visualize your emotional patterns with beautiful charts and insights.",
      gradient: "from-blue-400 to-purple-400"
    },
    {
      icon: "🌍",
      title: "Social Discovery",
      description: "Connect with others through shared experiences and public memories.",
      gradient: "from-green-400 to-blue-400"
    },
    {
      icon: "🎯",
      title: "Personal Growth",
      description: "Track your emotional journey and discover patterns for better wellbeing.",
      gradient: "from-orange-400 to-red-400"
    }
  ];

  const futureFeatures = [
    { icon: "🤖", title: "AI-Powered Insights", description: "Smart recommendations based on your patterns" },
    { icon: "🎵", title: "Memory Soundscapes", description: "Audio memories with mood-based music" },
    { icon: "🌟", title: "Achievement System", description: "Unlock badges for consistent journaling" },
    { icon: "👥", title: "Memory Circles", description: "Private groups for sharing with close friends" }
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute top-1/2 right-0 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-6">
              Memory Farm
            </h1>
            <div className="text-2xl md:text-4xl text-gray-700 mb-8 font-light">
              🌱 Grow Your{" "}
              <span className="inline-block">
                <motion.span
                  key={currentFeature}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`text-transparent bg-clip-text bg-gradient-to-r ${features[currentFeature].gradient}`}
                >
                  {features[currentFeature].title.split(' ')[1]}
                </motion.span>
              </span>{" "}
              Journey
            </div>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your daily experiences into meaningful insights. Track emotions, 
            discover patterns, and connect with a community of mindful individuals.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              🚀 Start Your Journey
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-purple-600 font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-200"
            >
              🔐 Welcome Back
            </Link>
          </motion.div>

          {/* Animated Memory Cards */}
          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={containerVariants}
          >
            {[
              { emoji: "😊", text: "Had an amazing coffee today!", color: "from-yellow-400 to-orange-400" },
              { emoji: "🌱", text: "Started my meditation practice", color: "from-green-400 to-teal-400" },
              { emoji: "💡", text: "Great idea for my project!", color: "from-blue-400 to-purple-400" }
            ].map((memory, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className={`p-6 bg-gradient-to-br ${memory.color} rounded-xl shadow-lg text-white transform transition-all duration-300`}
                style={{
                  transform: `rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.01}deg)`
                }}
              >
                <div className="text-4xl mb-2">{memory.emoji}</div>
                <p className="text-lg font-medium">{memory.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="py-20 px-4 bg-white/50 backdrop-blur-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            variants={itemVariants}
            className="text-5xl font-bold text-center text-gray-800 mb-16"
          >
            ✨ Powerful Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                onMouseEnter={() => setCurrentFeature(index)}
              >
                <div className={`text-6xl mb-4 p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} inline-block text-white group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        id="how-it-works"
        className="py-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            variants={itemVariants}
            className="text-5xl font-bold text-center text-gray-800 mb-16"
          >
            🚀 How It Works
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Capture", description: "Write down your daily experiences and emotions", icon: "✍️" },
              { step: "2", title: "Analyze", description: "Watch as patterns emerge from your mood data", icon: "📊" },
              { step: "3", title: "Grow", description: "Use insights to improve your mental wellbeing", icon: "🌱" }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <div className="absolute -top-2 -right-2 text-4xl group-hover:animate-bounce">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Future Updates Section */}
      <motion.section 
        id="future"
        className="py-20 px-4 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 text-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h2 
            variants={itemVariants}
            className="text-5xl font-bold text-center mb-4"
          >
            🔮 The Future Awaits
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-center text-purple-200 mb-16 max-w-3xl mx-auto"
          >
            We're constantly innovating to bring you the most advanced memory journaling experience.
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {futureFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotateY: 10 }}
                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-5xl mb-4 animate-pulse">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-purple-200">{feature.description}</p>
                <div className="mt-4 text-sm text-purple-300">Coming Soon...</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.h2 
          variants={itemVariants}
          className="text-5xl font-bold mb-8"
        >
          Ready to Start Growing?
        </motion.h2>
        <motion.p 
          variants={itemVariants}
          className="text-xl mb-12 max-w-2xl mx-auto"
        >
          Join thousands of users who are already transforming their daily experiences into meaningful insights.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link
            to="/signup"
            className="px-12 py-6 bg-white text-purple-600 font-bold rounded-full text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 inline-block"
          >
            🌱 Plant Your First Memory
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}