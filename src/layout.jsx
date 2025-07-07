import { useEffect, useState, useRef } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useUser } from './contexts/UserContext.jsx';
import { useNavbar } from './contexts/NavbarContext.jsx';
import { auth } from './firebase.js';
import Navbar from './components/navbar/Navbar.jsx';

// This is a small, invisible component whose only job is to handle the
// post-login invitation flow. It lives here because Layout.jsx is inside
// the BrowserRouter and has access to navigation hooks.
const InvitationHandler = () => {
  const { userData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const acceptPendingInvite = async () => {
      const token = localStorage.getItem('pending_invite_token');
      // Run only if a token exists and the user's data has been loaded.
      if (token && userData) {
        try {
          toast.loading('Accepting your invitation...', { id: 'invite-toast' });
          
          const idToken = await auth.currentUser.getIdToken();
          const res = await fetch('/api/invitations/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}`},
            body: JSON.stringify({ token }),
          });
          
          const data = await res.json();
          localStorage.removeItem('pending_invite_token');
          
          if (!res.ok) {
            throw new Error(data.error || 'Could not accept invitation.');
          }

          toast.success('Welcome to the project!', { id: 'invite-toast' });
          navigate(`/projects/${data.project_url}`);
          
        } catch (err) {
          toast.error(err.message, { id: 'invite-toast' });
        }
      }
    };
    
    acceptPendingInvite();
  }, [userData, navigate]);

  return null; // This component renders nothing.
};

// Simple debounce function
const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Advanced Dynamic Background Circles Component
const DynamicBackgroundCircles = () => {
  const [circles, setCircles] = useState([]);
  const location = useLocation();
  const viewportRef = useRef({ width: 0, height: 0 });

  // Circle configuration with pixel-based sizing
  const circleConfig = [
    { sizeClass: 'w-64 h-64', radiusVW: 8, radiusPx: 128 },
    { sizeClass: 'w-72 h-72', radiusVW: 9, radiusPx: 144 },
    { sizeClass: 'w-80 h-80', radiusVW: 10, radiusPx: 160 },
    { sizeClass: 'w-96 h-96', radiusVW: 12, radiusPx: 192 },
    { sizeClass: 'w-56 h-56', radiusVW: 7, radiusPx: 112 }
  ];

  // Very subtle color palette for background
  const colors = [
    'bg-purple-900/20',
    'bg-blue-900/20',
    'bg-indigo-900/20',
    'bg-violet-900/20',
    'bg-slate-800/20',
    'bg-gray-800/20',
    'bg-stone-800/20',
    'bg-zinc-800/20',
    'bg-neutral-800/20',
    'bg-emerald-900/15',
    'bg-teal-900/15',
    'bg-cyan-900/15',
    'bg-sky-900/15',
    'bg-rose-900/15',
    'bg-pink-900/15'
  ];

  // Spatial partitioning grid for efficient collision detection
  const createSpatialGrid = (cellSize) => {
    const grid = {};
    const getCellKey = (x, y) => `${Math.floor(x/cellSize)},${Math.floor(y/cellSize)}`;
    
    return {
      add: (circle) => {
        const minX = circle.x - circle.radius - circle.maxMoveDistance;
        const maxX = circle.x + circle.radius + circle.maxMoveDistance;
        const minY = circle.y - circle.radius - circle.maxMoveDistance;
        const maxY = circle.y + circle.radius + circle.maxMoveDistance;
        
        for (let x = minX; x <= maxX; x += cellSize) {
          for (let y = minY; y <= maxY; y += cellSize) {
            const key = getCellKey(x, y);
            if (!grid[key]) grid[key] = [];
            grid[key].push(circle);
          }
        }
      },
      checkCollision: (circle) => {
        const minX = circle.x - circle.radius - circle.maxMoveDistance;
        const maxX = circle.x + circle.radius + circle.maxMoveDistance;
        const minY = circle.y - circle.radius - circle.maxMoveDistance;
        const maxY = circle.y + circle.radius + circle.maxMoveDistance;
        
        for (let x = minX; x <= maxX; x += cellSize) {
          for (let y = minY; y <= maxY; y += cellSize) {
            const key = getCellKey(x, y);
            if (grid[key]) {
              for (const other of grid[key]) {
                if (other === circle) continue;
                
                // Check collision throughout movement paths
                if (wouldPathsCollide(circle, other)) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      }
    };
  };

  // Check if two circles' movement paths would ever collide
  const wouldPathsCollide = (circle1, circle2) => {
    const safeDistance = circle1.radius + circle2.radius + 50; // 50px buffer
    const checkPoints = 12; // Check more points for accuracy
    
    for (let i = 0; i < checkPoints; i++) {
      const t = i / checkPoints;
      
      // Calculate positions along Bézier paths
      const pos1 = getBezierPoint(circle1.path, t);
      const pos2 = getBezierPoint(circle2.path, t);
      
      const distance = Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) + 
        Math.pow(pos1.y - pos2.y, 2)
      );
      
      if (distance < safeDistance) {
        return true;
      }
    }
    
    return false;
  };

  // Get point on Bézier curve at parameter t (0 to 1)
  const getBezierPoint = (path, t) => {
    const { x, y } = path;
    // Cubic Bézier curve formula
    const x1 = x[0], y1 = y[0]; // Start point
    const x2 = x[1], y2 = y[1]; // Control point 1
    const x3 = x[2], y3 = y[2]; // Control point 2
    const x4 = x[3], y4 = y[3]; // End point
    
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    return {
      x: uuu * x1 + 3 * uu * t * x2 + 3 * u * tt * x3 + ttt * x4,
      y: uuu * y1 + 3 * uu * t * y2 + 3 * u * tt * y3 + ttt * y4
    };
  };

  // Generate smooth Bézier path for circle movement with collision-free validation
  const generateBezierPath = (centerX, centerY, radius, viewportWidth, viewportHeight) => {
    const maxMoveDistance = Math.min(radius * 1.5, 100); // Limit movement range
    
    // Generate random control points within safe bounds
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = angle1 + Math.PI/2 + (Math.random() - 0.5) * Math.PI/2;
    
    const distance1 = maxMoveDistance * (0.4 + Math.random() * 0.6);
    const distance2 = maxMoveDistance * (0.4 + Math.random() * 0.6);
    
    // Ensure control points stay within viewport bounds
    const cp1x = Math.max(radius, Math.min(viewportWidth - radius, 
      centerX + distance1 * Math.cos(angle1)));
    const cp1y = Math.max(radius, Math.min(viewportHeight - radius, 
      centerY + distance1 * Math.sin(angle1)));
    
    const cp2x = Math.max(radius, Math.min(viewportWidth - radius, 
      centerX + distance2 * Math.cos(angle2)));
    const cp2y = Math.max(radius, Math.min(viewportHeight - radius, 
      centerY + distance2 * Math.sin(angle2)));
    
    return {
      x: [centerX, cp1x, cp2x, centerX],
      y: [centerY, cp1y, cp2y, centerY],
      maxDistance: Math.max(distance1, distance2)
    };
  };

  // Generate collision-free circles with optimized positioning
  const generateCircles = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    viewportRef.current = { width: viewportWidth, height: viewportHeight };
    
    const gridCellSize = Math.max(viewportWidth, viewportHeight) * 0.15;
    const grid = createSpatialGrid(gridCellSize);
    const newCircles = [];
    
    // Shuffle circle configs for variety
    const shuffledConfigs = [...circleConfig].sort(() => Math.random() - 0.5);
    
    // Try to place each circle with multiple attempts
    for (const config of shuffledConfigs) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Generate candidate position with proper bounds
        const radius = config.radiusPx;
        const maxMoveDistance = Math.min(radius * 1.5, 100);
        const margin = radius + maxMoveDistance;
        
        const x = margin + Math.random() * (viewportWidth - 2 * margin);
        const y = margin + Math.random() * (viewportHeight - 2 * margin);
        
        // Generate movement path
        const path = generateBezierPath(x, y, radius, viewportWidth, viewportHeight);
        
        const candidate = {
          x,
          y,
          radius,
          maxMoveDistance,
          sizeClass: config.sizeClass,
          color: colors[Math.floor(Math.random() * colors.length)],
          path
        };
        
        // Check for collisions using spatial grid
        if (!grid.checkCollision(candidate)) {
          grid.add(candidate);
          
          newCircles.push({
            ...candidate,
            id: newCircles.length,
            delay: Math.random() * 2,
            duration: 2.5 + Math.random() * 1.5,
            moveDuration: 25 + Math.random() * 20, // 25-45 seconds
            pulseDuration: 6 + Math.random() * 4,
            pulseDelay: Math.random() * 3
          });
          
          placed = true;
        }
      }
    }
    
    setCircles(newCircles);
  };

  // Handle viewport resize with debounce
  useEffect(() => {
    const handleResize = debounce(() => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      // Only regenerate if significant size change
      if (Math.abs(newWidth - viewportRef.current.width) > 100 || 
          Math.abs(newHeight - viewportRef.current.height) > 100) {
        generateCircles();
      }
    }, 300);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate on mount and route change
  useEffect(() => {
    generateCircles();
  }, [location.pathname]);

  // Also regenerate on window focus (when user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      generateCircles();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
      {/* Collision-free circles with Bézier movement and advanced positioning */}
      {circles.map((circle) => (
        <motion.div
          key={`${circle.id}-${location.pathname}`}
          className={`absolute ${circle.sizeClass} ${circle.color} rounded-full blur-[100px]`}
          style={{
            left: circle.x - circle.radius,
            top: circle.y - circle.radius,
            willChange: 'transform, opacity'
          }}
          initial={{ 
            scale: 0,
            opacity: 0
          }}
          animate={{ 
            scale: 1,
            opacity: 1
          }}
          transition={{ 
            duration: circle.duration,
            delay: circle.delay,
            ease: "easeOut"
          }}
        >
          {/* Pulsing glow effect */}
          <motion.div
            className="w-full h-full rounded-full"
            style={{
              willChange: 'transform, opacity'
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: circle.pulseDuration,
              delay: circle.pulseDelay,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop"
            }}
          />

          {/* Smooth Bézier curve movement */}
          <motion.div
            className="w-full h-full rounded-full"
            style={{
              willChange: 'transform'
            }}
            animate={{
              x: circle.path.x,
              y: circle.path.y
            }}
            transition={{
              duration: circle.moveDuration,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop"
            }}
          />
        </motion.div>
      ))}
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

// Your main Layout component
const Layout = () => {
  const location = useLocation();
  const { isNavbarExpanded } = useNavbar();

  // Check if the current URL starts with /projects/ (same logic as in Navbar)
  const isProjectsRoute = location.pathname.startsWith('/projects/');
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  useEffect(() => {
    setIsSubmenuOpen(isProjectsRoute);
  }, [location.pathname, isProjectsRoute]);

  // Determine navbar state (same logic as in Navbar)
  const getNavbarState = () => {
    if (isProjectsRoute && isSubmenuOpen) return 'fullExpanded';
    if (isNavbarExpanded) return 'expanded';
    return 'collapsed';
  };

  // Calculate the navbar's width based on state (matching Navbar.jsx)
  const getNavbarWidth = () => {
    const state = getNavbarState();
    if (state === 'expanded') return '10rem'; // When user clicks expand
    if (state === 'fullExpanded') return '16rem'; // When subnavbar opens
    return '4.5rem'; // collapsed
  };

  const navbarWidth = getNavbarWidth();

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Advanced Dynamic Background Pattern */}
      <DynamicBackgroundCircles />
      
      <Navbar />
      <InvitationHandler />
      <motion.div 
        className="flex-1 h-full min-h-0 overflow-auto relative z-10"
        animate={{ marginLeft: navbarWidth }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default Layout;