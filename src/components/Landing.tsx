'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowDown, Sparkles, Users, BookOpen, Trophy, Star, 
  MessageSquare, Zap, Heart, Target, Award, Lightbulb,
  TrendingUp, Shield, Clock, Smile, UserPlus, Github,
  Linkedin, Twitter, Instagram, Mail, Code, Palette,
  Smartphone, Rocket, Brain, FileText
} from 'lucide-react';

export function Landing() {
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const opacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 51, 234, ${particle.opacity})`;
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const gradientStyle = {
    background: `radial-gradient(circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, 
      hsl(var(--purple-light) / 0.15), 
      hsl(var(--purple-medium) / 0.15), 
      hsl(var(--purple-dark) / 0.15))`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-black dark:to-black text-gray-900 dark:text-white overflow-x-hidden relative">
      {/* Particle Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 opacity-30 dark:opacity-50"
      />

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-purple-100/50 to-white/80 dark:from-black dark:via-purple-900/20 dark:to-black" />
        
        <motion.div 
          style={{ opacity, scale }}
          className="container mx-auto px-4 z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-500 dark:to-cyan-500">
                PeerPulse
              </h1>
            </motion.div>
            <motion.p 
              className="text-2xl md:text-3xl text-black font-bold dark:text-purple-200 mb-8 font-light tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Level Up Your Learning Journey with Peer Power! 🚀
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to={user ? "/dashboard" : "/auth"}>
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-600 dark:via-pink-500 dark:to-cyan-500 text-white font-semibold text-lg tracking-wider relative overflow-hidden group cyberpunk-button"
                >
                  <span className="relative z-10">{user ? "Go to Dashboard" : "Get Started"}</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-500 dark:via-pink-500 dark:to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full border-2 border-purple-500/30 text-purple-700 dark:text-purple-200 font-semibold text-lg tracking-wider hover:bg-purple-500/10 transition-all duration-300"
                onClick={() => scrollToSection('features')}
              >
                Explore More
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ArrowDown className="h-8 w-8 text-purple-600/50 dark:text-purple-400/50" />
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        id="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-32 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50 to-white dark:from-black dark:via-purple-900/10 dark:to-black" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-10 bg-clip-text cyberpunk-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-500 dark:to-cyan-500">
              Why Choose PeerPulse?
            </h2>
            <p className="text-xl text-gray-700 dark:text-purple-200/80 max-w-2xl mx-auto font-light tracking-wider">
              Join the next generation of learners and transform your educational journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Team Collaboration',
                description: 'Manage teams, track assignments, and collaborate effectively with your peers',
                icon: Users,
                gradient: 'from-purple-600 to-pink-600 dark:from-purple-600 dark:to-pink-500',
              },
              {
                title: 'Assignment Management',
                description: 'Create, track, and submit assignments with detailed task management',
                icon: FileText,
                gradient: 'from-pink-600 to-cyan-600 dark:from-pink-500 dark:to-cyan-500',
              },
              {
                title: 'Peer Feedback',
                description: 'Give and receive constructive feedback to improve team performance',
                icon: MessageSquare,
                gradient: 'from-cyan-600 to-purple-600 dark:from-cyan-500 dark:to-purple-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <div 
                  className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl blur-xl bg-gradient-to-br ${feature.gradient}`}
                />
                <div className="p-8 rounded-xl bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cyberpunk-card shadow-lg dark:shadow-none">
                  <div 
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r ${feature.gradient}`}
                  >
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-purple-200">{feature.title}</h3>
                  <p className="text-gray-700 dark:text-purple-200/70 font-light tracking-wide">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-32 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50 to-white dark:from-black dark:via-purple-900/10 dark:to-black" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6 font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-500 dark:to-cyan-500">
              How It Works
            </h2>
            <p className="text-xl text-gray-700 dark:text-purple-200/80 max-w-2xl mx-auto font-light tracking-wider">
              Three simple steps to start your peer learning journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Set up your account and join your team',
                icon: UserPlus,
                gradient: 'from-purple-600 to-pink-600 dark:from-purple-600 dark:to-pink-500',
              },
              {
                step: '2',
                title: 'Join Your Team',
                description: 'Connect with your team members and start collaborating',
                icon: Users,
                gradient: 'from-pink-600 to-cyan-600 dark:from-pink-500 dark:to-cyan-500',
              },
              {
                step: '3',
                title: 'Manage Assignments',
                description: 'Create tasks, track progress, and submit your work',
                icon: FileText,
                gradient: 'from-cyan-600 to-purple-600 dark:from-cyan-500 dark:to-purple-600',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="p-8 rounded-xl bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cyberpunk-card shadow-lg dark:shadow-none">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-6 mx-auto`}>
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-purple-200">{step.title}</h3>
                  <p className="text-gray-700 dark:text-purple-200/70 text-center font-light tracking-wide">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-32 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50 to-white dark:from-black dark:via-purple-900/10 dark:to-black" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6 font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-500 dark:to-cyan-500">
              What Our Learners Say
            </h2>
            <p className="text-xl text-gray-700 dark:text-purple-200/80 max-w-2xl mx-auto font-light tracking-wider">
              Join thousands of satisfied students who transformed their learning experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The team collaboration features are amazing. It's made managing our group projects so much easier!",
                author: "Sarah",
                role: "Team Leader",
                icon: Users,
                gradient: 'from-purple-600 to-pink-600 dark:from-purple-600 dark:to-pink-500',
              },
              {
                quote: "The assignment management system is intuitive and helps us stay organized.",
                author: "Mike",
                role: "Project Manager",
                icon: FileText,
                gradient: 'from-pink-600 to-cyan-600 dark:from-pink-500 dark:to-cyan-500',
              },
              {
                quote: "The peer feedback system has really improved our team's communication and performance.",
                author: "Emma",
                role: "Team Member",
                icon: MessageSquare,
                gradient: 'from-cyan-600 to-purple-600 dark:from-cyan-500 dark:to-purple-600',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-8 rounded-xl bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cyberpunk-card shadow-lg dark:shadow-none"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center mb-6`}>
                  <testimonial.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg mb-6 italic text-gray-700 dark:text-purple-200/90 font-light tracking-wide">"{testimonial.quote}"</p>
                <div className="font-semibold text-gray-900 dark:text-purple-200">{testimonial.author}</div>
                <div className="text-sm text-gray-600 dark:text-purple-200/70">{testimonial.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-32 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50 to-white dark:from-black dark:via-purple-900/20 dark:to-black" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-6 font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-500 dark:to-cyan-500 cyberpunk-text">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl text-gray-700 dark:text-purple-200/80 mb-12 font-light tracking-wider">
              Join thousands of students who are already learning smarter with PeerPulse
            </p>
            <Link to={user ? "/dashboard" : "/auth"}>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-600 dark:via-pink-500 dark:to-cyan-500 text-white font-semibold text-xl tracking-wider relative overflow-hidden group cyberpunk-button"
              >
                <span className="relative z-10">{user ? "Go to Dashboard" : "Get Started"}</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 dark:from-cyan-500 dark:via-pink-500 dark:to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 relative border-t border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-gray-600 dark:text-purple-200/60 text-sm">
              © 2024 PeerPulse. All rights reserved.
            </div>
            <div className="flex gap-6">
              {[
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ 
                    scale: 1.1,
                    color: "rgb(147, 51, 234)",
                  }}
                  className="text-gray-600 hover:text-purple-600 dark:text-purple-200/60 dark:hover:text-purple-400 transition-colors duration-300"
                >
                  <social.icon className="h-6 w-6" />
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
