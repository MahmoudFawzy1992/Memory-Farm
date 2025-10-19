import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState({});
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-teal-50/20 to-white">
        {/* Animated background elements */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ opacity }}
        >
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl"
            style={{ y: y1 }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
            style={{ y: y2 }}
          />
        </motion.div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Logo */}
            <motion.div 
              variants={fadeInUp}
              className="mb-8"
            >
              <img 
                src="/Logo.png" 
                alt="Memory Farm" 
                className="h-32 w-auto mx-auto drop-shadow-lg"
              />
            </motion.div>

            {/* Main heading */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="block text-gray-800">Your memories deserve</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                a home that understands you
              </span>
            </motion.h1>

            {/* Description */}
            <motion.div 
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto space-y-4"
            >
              <p>Every moment you live leaves a trace — thoughts, moods, decisions, reflections.</p>
              <p className="font-semibold text-gray-700">Memory Farm helps you turn those moments into meaning.</p>
              <p>Through smart analysis and gentle insight, it transforms your daily memories into clear patterns of growth and emotional understanding.</p>
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <span className="text-lg">Start your journey</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* What Memory Farm Does Section */}
      <section className="py-20 px-4 bg-gray-50" id="features" data-animate>
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              🌿 What Memory Farm Does
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                title: "Capture your moments",
                description: "Write freely — your ideas, your emotions, your story. Each memory you record becomes part of a living timeline that reflects your inner world.",
                icon: "✍️"
              },
              {
                number: "2",
                title: "Understand yourself deeper",
                description: "Our AI doesn't just summarize — it interprets. It finds the subtle patterns in your moods, habits, and choices, revealing how your experiences connect and evolve.",
                icon: "🧠"
              },
              {
                number: "3",
                title: "Grow with awareness",
                description: "Over time, Memory Farm shows you where you're thriving, what drains you, and what truly matters. It's like watching the story of your growth unfold before your eyes.",
                icon: "🌱"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-xl font-bold text-xl">
                      {feature.number}
                    </span>
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-20 px-4 bg-white" id="why-different" data-animate>
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible['why-different'] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              ✨ Why Memory Farm Is Different
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Not another journal. But A mirror for your mind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🌱", title: "AI insights that feel human", description: "Real reflections, written in a voice that understands your emotions." },
              { icon: "🔒", title: "Your space, your privacy", description: "What you write is yours. Always." },
              { icon: "📅", title: "Visual growth timeline", description: "See how your emotions, thoughts, and progress evolve over time." },
              { icon: "💫", title: "Insights that bring clarity", description: "Gentle reflections that help you see what's truly shaping your emotions and growth." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible['why-different'] ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100 hover:border-teal-300 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50 via-white to-blue-50" id="who" data-animate>
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible.who ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">
              ❤️ Who It's For
            </h2>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>People who want to know themselves better.</p>
              <p>Those building habits, healing, or creating something meaningful.</p>
              <p>Anyone who believes that reflection isn't slowing down — it's moving forward with purpose.</p>
              
              <div className="pt-8 pb-4">
                <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  Whether you're a dreamer, a builder, or someone finding their way — Memory Farm helps you see the story you've been living.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white" id="mission" data-animate>
        <div className="container mx-auto max-w-5xl">
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible.mission ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-8">
                🔮 Our Mission
              </h2>
              
              <div className="space-y-4 text-lg">
                <p>To make self-understanding simple, private, and powerful.</p>
                <p>To help every person grow through what they've already lived.</p>
                
                <div className="pt-8">
                  <p className="text-xl font-semibold text-teal-100">
                    Because memory isn't just the past — it's the soil of who you're becoming.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-teal-50" id="cta" data-animate>
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible.cta ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              🚀 Start Growing Through Your Memories
            </h2>
            
            <div className="space-y-3 text-lg text-gray-600 mb-12">
              <p>Reflection is how we evolve.</p>
              <p className="font-semibold text-gray-700">Your story is waiting to be understood.</p>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-2xl text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 group"
              >
                <span>Join Memory Farm</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}