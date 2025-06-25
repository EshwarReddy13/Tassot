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
        className="w-full h-24 rounded-lg border-2 border-gray-700 hover:border-accent-primary/50 transition-colors"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-mono drop-shadow-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {color}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{name}</p>
        <p className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{color}</p>
      </div>
    </motion.div>
  );

  const ColorCategory = ({ title, colors, category }) => (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold border-b pb-2 ${
        isDarkMode ? 'text-white border-gray-700' : 'text-gray-900 border-gray-300'
      }`}>
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(colors).map(([name, color]) => (
          <ColorSwatch 
            key={name} 
            name={name} 
            color={color} 
            category={category}
          />
        ))}
      </div>
    </div>
  );

  const PreviewCard = () => {
    const bgColor = isDarkMode ? '#17171b' : '#ffffff';
    const borderColor = isDarkMode ? '#374151' : '#e5e7eb';
    const textColor = isDarkMode ? '#ffffff' : '#1e293b';
    const secondaryTextColor = isDarkMode ? '#a0a0a0' : '#64748b';
    const primaryButtonBg = isDarkMode ? '#9674da' : '#7c3aed';
    const primaryButtonHover = isDarkMode ? '#7e5cb7' : '#6d28d9';
    const secondaryButtonBg = isDarkMode ? '#3a3a44' : '#f1f5f9';
    const secondaryButtonHover = isDarkMode ? '#4a4a54' : '#e2e8f0';

    return (
      <div className={`rounded-lg p-6 border transition-colors ${
        isDarkMode ? 'bg-[#17171b] border-gray-700' : 'bg-white border-gray-300'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {currentTheme} Theme Preview
        </h3>
        
        {/* Card Preview */}
        <div className={`rounded-lg p-4 border mb-4 transition-colors`}
             style={{ backgroundColor: bgColor, borderColor: borderColor }}>
          <h4 className={`font-semibold mb-2`} style={{ color: textColor }}>Sample Card</h4>
          <p className={`text-sm mb-3`} style={{ color: secondaryTextColor }}>
            This is how cards look with your {isDarkMode ? 'dark' : 'light'} theme
          </p>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 text-white rounded text-sm transition-colors"
              style={{ 
                backgroundColor: primaryButtonBg,
                ':hover': { backgroundColor: primaryButtonHover }
              }}
            >
              Primary Button
            </button>
            <button 
              className="px-3 py-1 rounded text-sm transition-colors"
              style={{ 
                backgroundColor: secondaryButtonBg,
                color: textColor,
                ':hover': { backgroundColor: secondaryButtonHover }
              }}
            >
              Secondary
            </button>
          </div>
        </div>

        {/* Text Preview */}
        <div className="space-y-2">
          <p style={{ color: textColor }}>Primary text color</p>
          <p style={{ color: secondaryTextColor }}>Secondary text color</p>
          <p style={{ color: isDarkMode ? '#6b7280' : '#94a3b8' }}>Placeholder text color</p>
        </div>

        {/* Status Colors */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isDarkMode ? '#34d399' : '#10b981' }}></div>
            <span className="text-sm" style={{ color: isDarkMode ? '#34d399' : '#10b981' }}>Success message</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isDarkMode ? '#f87171' : '#ef4444' }}></div>
            <span className="text-sm" style={{ color: isDarkMode ? '#f87171' : '#ef4444' }}>Error message</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-sm" style={{ color: '#3b82f6' }}>Info message</span>
          </div>
        </div>
      </div>
    );
  };

  const ColorDetails = () => {
    if (!selectedColor) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg p-6 border transition-colors ${
          isDarkMode ? 'bg-[#17171b] border-gray-700' : 'bg-white border-gray-300'
        }`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Color Details
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</p>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedColor.name}</p>
          </div>
          
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</p>
            <p className={`font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedColor.category}</p>
          </div>
          
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hex Value</p>
            <p className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedColor.color}</p>
          </div>
          
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preview</p>
            <div 
              className="w-full h-16 rounded-lg border mt-2"
              style={{ 
                backgroundColor: selectedColor.color,
                borderColor: isDarkMode ? '#374151' : '#e5e7eb'
              }}
            ></div>
          </div>
        </div>
      </motion.div>
    );
  };

  const ThemeToggle = () => (
    <motion.button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#17171b] border-gray-700 text-white hover:bg-[#1f1f23]' 
          : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isDarkMode ? (
        <>
          <HiSun className="w-5 h-5" />
          <span>Switch to Light Mode</span>
        </>
      ) : (
        <>
          <HiMoon className="w-5 h-5" />
          <span>Switch to Dark Mode</span>
        </>
      )}
    </motion.button>
  );

  return (
    <div className={`min-h-screen p-6 transition-colors ${
      isDarkMode ? 'bg-[#292830]' : 'bg-[#f8fafc]'
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="space-y-1">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Theme Palette
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Explore and visualize your {isDarkMode ? 'dark' : 'light'} theme colors
            </p>
          </div>
        </div>
        <div className="flex justify-center">
            <ThemeToggle />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Color Categories */}
          <div className="lg:col-span-2 space-y-8">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PreviewCard />
            <ColorDetails />
          </div>
        </div>

        {/* CSS Variables Section */}
        <div className={`rounded-lg p-6 border transition-colors ${
          isDarkMode ? 'bg-[#17171b] border-gray-700' : 'bg-white border-gray-300'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            CSS Variables ({currentTheme} Mode)
          </h3>
          <div className={`rounded-lg p-4 overflow-x-auto ${
            isDarkMode ? 'bg-[#292830]' : 'bg-gray-100'
          }`}>
            <pre className={`text-sm font-mono ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
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
        </div>
      </div>
    </div>
  );
};

export default PalettePage; 