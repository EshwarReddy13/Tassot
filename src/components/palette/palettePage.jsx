import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSun, HiMoon } from 'react-icons/hi';

const PalettePage = () => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Define all the colors from your CSS theme
  const darkThemeColors = {
    backgrounds: {
      'Primary Background': '#292830',
      'Secondary Background': '#3a3a44', 
      'Card Background': '#17171b',
      'Dark Background': '#17171b'
    },
    accents: {
      'Primary Accent': '#9674da',
      'Accent Hover': '#7e5cb7'
    },
    text: {
      'Primary Text': '#ffffff',
      'Secondary Text': '#a0a0a0',
      'Placeholder Text': '#6b7280'
    },
    status: {
      'Error': '#f87171',
      'Warning': '#f87171',
      'Info': '#3b82f6',
      'Success': '#34d399'
    }
  };

  const lightThemeColors = {
    backgrounds: {
      'Primary Background': '#f8fafc',
      'Secondary Background': '#f1f5f9', 
      'Card Background': '#ffffff',
      'Dark Background': '#e2e8f0'
    },
    accents: {
      'Primary Accent': '#7c3aed',
      'Accent Hover': '#6d28d9'
    },
    text: {
      'Primary Text': '#1e293b',
      'Secondary Text': '#64748b',
      'Placeholder Text': '#94a3b8'
    },
    status: {
      'Error': '#ef4444',
      'Warning': '#f59e0b',
      'Info': '#3b82f6',
      'Success': '#10b981'
    }
  };

  const themeColors = isDarkMode ? darkThemeColors : lightThemeColors;
  const currentTheme = isDarkMode ? 'Dark' : 'Light';

  const ColorSwatch = ({ name, color, category }) => (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedColor({ name, color, category })}
    >
      <div 
        className="w-full h-24 rounded-xl glass-hover border-2 border-transparent hover:border-accent-primary/50 transition-all duration-300"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono drop-shadow-lg text-white bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
            {color}
          </span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-text-primary text-sm font-medium">{name}</p>
        <p className="text-text-secondary text-xs font-mono">{color}</p>
      </div>
    </motion.div>
  );

  const ColorCategory = ({ title, colors, category }) => (
    <motion.div 
      className="glass-card p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <h3 className="text-text-primary text-xl font-bold">{title}</h3>
        <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full font-medium">
          {Object.keys(colors).length}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Object.entries(colors).map(([name, color]) => (
          <ColorSwatch 
            key={name} 
            name={name} 
            color={color} 
            category={category}
          />
        ))}
      </div>
    </motion.div>
  );

  const PreviewCard = () => {
    return (
      <motion.div 
        className="glass-card p-6 space-y-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎨</span>
          <h3 className="text-text-primary text-xl font-bold">{currentTheme} Theme Preview</h3>
        </div>
        
        {/* Card Preview */}
        <div className="glass-secondary p-4 rounded-xl space-y-4">
          <h4 className="text-text-primary font-semibold">Sample Card</h4>
          <p className="text-text-secondary text-sm">
            This is how cards look with your {isDarkMode ? 'dark' : 'light'} theme
          </p>
          <div className="flex gap-3">
            <button className="bg-accent-primary hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Primary Button
            </button>
            <button className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-text-primary">
              Secondary
            </button>
          </div>
        </div>

        {/* Text Preview */}
        <div className="glass-tertiary p-4 rounded-xl space-y-3">
          <h4 className="text-text-primary font-semibold mb-2">Text Styles</h4>
          <p className="text-text-primary">Primary text color</p>
          <p className="text-text-secondary">Secondary text color</p>
          <p className="text-text-tertiary">Tertiary text color</p>
        </div>

        {/* Status Colors */}
        <div className="glass-tertiary p-4 rounded-xl space-y-3">
          <h4 className="text-text-primary font-semibold mb-2">Status Colors</h4>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-success text-sm font-medium">Success message</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <span className="text-error text-sm font-medium">Error message</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-info"></div>
            <span className="text-info text-sm font-medium">Info message</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-warning text-sm font-medium">Warning message</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const ColorDetails = () => {
    if (!selectedColor) {
      return (
        <motion.div 
          className="glass-card p-6 text-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-text-tertiary text-6xl mb-4">🎯</div>
          <p className="text-text-secondary mb-2">Select a color</p>
          <p className="text-text-tertiary text-sm">Click on any color swatch to see details</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <h3 className="text-text-primary text-xl font-bold">Color Details</h3>
        </div>
        
        <div className="space-y-4">
          <div className="glass-tertiary p-4 rounded-xl">
            <p className="text-text-secondary text-sm mb-1">Name</p>
            <p className="text-text-primary font-semibold">{selectedColor.name}</p>
          </div>
          
          <div className="glass-tertiary p-4 rounded-xl">
            <p className="text-text-secondary text-sm mb-1">Category</p>
            <p className="text-text-primary font-semibold capitalize">{selectedColor.category}</p>
          </div>
          
          <div className="glass-tertiary p-4 rounded-xl">
            <p className="text-text-secondary text-sm mb-1">Hex Value</p>
            <p className="text-text-primary font-mono font-semibold">{selectedColor.color}</p>
          </div>
          
          <div className="glass-tertiary p-4 rounded-xl">
            <p className="text-text-secondary text-sm mb-3">Color Preview</p>
            <div 
              className="w-full h-20 rounded-xl border-2 border-white/20 shadow-lg"
              style={{ backgroundColor: selectedColor.color }}
            ></div>
          </div>

          <button 
            className="glass-button w-full py-3 rounded-xl text-text-primary font-medium"
            onClick={() => navigator.clipboard.writeText(selectedColor.color)}
          >
            Copy Color Code
          </button>
        </div>
      </motion.div>
    );
  };

  const ThemeToggle = () => (
    <motion.button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="glass-button flex items-center gap-3 px-6 py-3 rounded-xl text-text-primary font-medium"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isDarkMode ? (
        <>
          <HiSun className="w-5 h-5 text-yellow-400" />
          <span>Switch to Light Mode</span>
        </>
      ) : (
        <>
          <HiMoon className="w-5 h-5 text-blue-400" />
          <span>Switch to Dark Mode</span>
        </>
      )}
    </motion.button>
  );

  const GlassUtilitiesSection = () => (
    <motion.div 
      className="glass-card p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">✨</span>
        <h3 className="text-text-primary text-xl font-bold">Glass Utilities Preview</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-primary p-4 rounded-xl">
          <h4 className="text-text-primary font-medium mb-2">glass-primary</h4>
          <p className="text-text-secondary text-sm">Strong glass effect for main containers</p>
        </div>
        
        <div className="glass-secondary p-4 rounded-xl">
          <h4 className="text-text-primary font-medium mb-2">glass-secondary</h4>
          <p className="text-text-secondary text-sm">Medium glass effect for secondary elements</p>
        </div>
        
        <div className="glass-tertiary p-4 rounded-xl">
          <h4 className="text-text-primary font-medium mb-2">glass-tertiary</h4>
          <p className="text-text-secondary text-sm">Subtle glass effect for minor elements</p>
        </div>
        
        <div className="glass-card p-4 rounded-xl">
          <h4 className="text-text-primary font-medium mb-2">glass-card</h4>
          <p className="text-text-secondary text-sm">Cards with hover effects</p>
        </div>
        
        <div className="glass-dark p-4 rounded-xl">
          <h4 className="text-text-primary font-medium mb-2">glass-dark</h4>
          <p className="text-text-secondary text-sm">Dark background with glass effects</p>
        </div>
        
        <div className="glass-nav p-4 rounded-xl">
          <h4 className="text-text-primary font-medium mb-2">glass-nav</h4>
          <p className="text-text-secondary text-sm">Navigation-optimized glass effect</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h1 className="text-text-primary text-4xl font-bold">Theme Palette</h1>
            <div className="w-24 h-0.5 bg-accent-primary rounded-full mx-auto"></div>
            <p className="text-text-secondary text-lg">
              Explore and visualize your {isDarkMode ? 'dark' : 'light'} theme colors
            </p>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Color Categories */}
          <div className="xl:col-span-3 space-y-8">
            <ColorCategory 
              title="Background Colors" 
              colors={themeColors.backgrounds} 
              category="background"
            />
            
            <ColorCategory 
              title="Accent Colors" 
              colors={themeColors.accents} 
              category="accent"
            />
            
            <ColorCategory 
              title="Text Colors" 
              colors={themeColors.text} 
              category="text"
            />
            
            <ColorCategory 
              title="Status Colors" 
              colors={themeColors.status} 
              category="status"
            />

            <GlassUtilitiesSection />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-8">
            <PreviewCard />
            <ColorDetails />
          </div>
        </div>

        {/* CSS Variables Section */}
        <motion.div 
          className="glass-card p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💻</span>
            <h3 className="text-text-primary text-xl font-bold">CSS Variables ({currentTheme} Mode)</h3>
          </div>
          <div className="glass-dark p-6 rounded-xl overflow-x-auto">
            <pre className="text-sm font-mono text-text-secondary">
{isDarkMode ? `@theme {
  --color-bg-primary: #292830;
  --color-bg-secondary: #3a3a44;
  --color-bg-card: #17171b;
  --color-bg-dark: #17171b;
  
  --color-accent-primary: #9674da;
  --color-accent-hover: #7e5cb7;
  
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-text-placeholder: #6b7280;
  
  --color-error: #f87171;
  --color-warning: #f87171;
  --color-info: #3b82f6;
  --color-success: #34d399;
}` : `@theme {
  --color-bg-primary: #f8fafc;
  --color-bg-secondary: #f1f5f9;
  --color-bg-card: #ffffff;
  --color-bg-dark: #e2e8f0;
  
  --color-accent-primary: #7c3aed;
  --color-accent-hover: #6d28d9;
  
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-placeholder: #94a3b8;
  
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;
  --color-success: #10b981;
}`}
            </pre>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PalettePage; 