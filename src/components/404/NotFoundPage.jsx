/**
 * NotFoundPage Component
 * 
 * A 404 error page that displays when users navigate to undefined routes.
 * Features a modern design with animations and a link back to the home page.
 * 
 * @component
 * @returns {JSX.Element} The 404 not found page component
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import login_background from '../../assets/login_background.png';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex font-poppins w-full h-screen overflow-hidden">
      {/* 
        Main container with split layout:
        - Left side: 404 content with animations
        - Right side: Decorative background image
      */}

      {/* Left Content Section - Contains 404 message and navigation */}
      <motion.div
        className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 bg-bg-primary min-w-0 flex-shrink-0 overflow-y-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="w-full max-w-md mx-auto text-center">
          {/* 404 Number - Large animated display */}
          <motion.h1
            className="text-8xl sm:text-9xl font-bold text-accent-primary mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          >
            404
          </motion.h1>

          {/* Error Message - Animated entrance */}
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Page Not Found
          </motion.h2>

          {/* Description - Animated entrance */}
          <motion.p
            className="text-sm sm:text-base text-text-secondary mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Oops! The page you're looking for doesn't exist. 
            It might have been moved, deleted, or you entered the wrong URL.
          </motion.p>

          {/* Action Buttons - Animated entrance */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {/* Go Home Button - Primary action */}
            <motion.button
              className="bg-accent-primary text-text-primary px-6 py-3 rounded-md font-semibold hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
            >
              Go Back
            </motion.button>

            {/* Home Page Link - Secondary action */}
            <Link to="/home">
              <motion.button
                className="bg-bg-tertiary text-text-primary px-6 py-3 rounded-md font-semibold hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go Home
              </motion.button>
            </Link>
          </motion.div>

          {/* Additional Help Text - Animated entrance */}
          <motion.p
            className="mt-8 text-xs sm:text-sm text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Need help? Contact our support team or check out our{' '}
            <Link to="/help" className="underline text-accent-primary hover:text-accent-hover">
              help center
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* Right Image Section - Decorative background image */}
      <div className="w-full md:w-1/2 h-full bg-bg-primary p-4 hidden md:flex items-center justify-center transition-none min-w-0 flex-shrink-0">
        <img
          src={login_background}
          alt="Decorative 404 background"
          className="w-full h-full object-cover rounded-lg scale-100 transition-none"
        />
      </div>
    </div>
  );
} 