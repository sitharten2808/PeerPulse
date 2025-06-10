import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Sun, Moon, Sparkles, BarChart, Users, Heart, MessageSquare, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user ? [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart },
    { href: '/feedback', label: 'Give Feedback', icon: Heart },
    { href: '/team', label: 'Team Health', icon: Users },
    { href: '/assignments', label: 'Assignments', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: Settings },
  ] : [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 ${
        theme === 'dark'
          ? 'bg-black border-b border-purple-500/20'
          : 'bg-white border-b border-purple-200'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <Sparkles className={`h-8 w-8 ${
              theme === 'dark' 
                ? 'text-purple-400' 
                : 'text-purple-600'
            }`} />
            <span className={`text-2xl font-bold ${
              theme === 'dark'
                ? 'text-white'
                : 'text-gray-900'
            }`}>
              PeerPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center space-x-2 ${
                    theme === 'dark'
                      ? 'text-purple-200 hover:text-purple-400'
                      : 'text-gray-700 hover:text-purple-600'
                  } transition-colors duration-300`}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                theme === 'dark'
                  ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              } transition-colors duration-300`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            {/* Auth Button */}
            {!user && (
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-full ${
                    theme === 'dark'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  } font-semibold transition-colors duration-300`}
                >
                  Get Started
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg ${
              theme === 'dark'
                ? 'hover:bg-purple-500/10 text-purple-400'
                : 'hover:bg-purple-100 text-purple-600'
            } transition-colors duration-300`}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className={`px-4 py-4 space-y-4 ${
              theme === 'dark' 
                ? 'bg-black border-t border-purple-500/20' 
                : 'bg-white border-t border-purple-200'
            }`}>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 py-2 ${
                      theme === 'dark'
                        ? 'text-purple-200 hover:text-purple-400'
                        : 'text-gray-700 hover:text-purple-600'
                    } transition-colors duration-300`}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-purple-500/20">
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center justify-center p-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  } transition-colors duration-300`}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-2" />
                      Dark Mode
                    </>
                  )}
                </button>
                {!user && (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className={`mt-4 block w-full text-center px-6 py-2 rounded-full ${
                      theme === 'dark'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    } font-semibold transition-colors duration-300`}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;