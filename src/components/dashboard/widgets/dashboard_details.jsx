import { motion } from 'framer-motion';

const DashboardDetails = ({ userData, error }) => {
  return (
    <main
      className="mt-[4rem] ml-[16rem] mr-4 mb-4 p-6 bg-[#1f1e25] rounded-lg min-h-[calc(100vh-4rem)]"
      aria-label="Dashboard content"
    >
      {error && (
        <motion.p
          className="text-red-400 text-sm mb-4 text-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}

      {userData && (
        <div className="space-y-4 justify-center items-center flex flex-col">
          <motion.h2
            className="text-3xl font-bold text-white text-center"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome to Your Dashboard
          </motion.h2>
          <motion.p
            className="text-white text-lg text-center"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Hello, {userData.firstName} {userData.lastName}
          </motion.p>
          <motion.p
            className="text-white text-md text-center"
            style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Email: {userData.email}
          </motion.p>
        </div>
      )}
    </main>
  );
};

export default DashboardDetails;