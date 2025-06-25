import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PalettePage = () => {
  const [selectedColor, setSelectedColor] = useState(null);

  // Define all the colors from your CSS theme
  const themeColors = {
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
          <span className="text-xs font-mono text-white drop-shadow-lg">
            {color}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-gray-400 font-mono">{color}</p>
      </div>
    </motion.div>
  );

  const ColorCategory = ({ title, colors, category }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
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

  const PreviewCard = () => (
    <div className="bg-[#17171b] rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Theme Preview</h3>
      
      {/* Card Preview */}
      <div className="bg-[#17171b] rounded-lg p-4 border border-gray-700 mb-4">
        <h4 className="text-white font-semibold mb-2">Sample Card</h4>
        <p className="text-gray-400 text-sm mb-3">This is how cards look with your current theme</p>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-[#9674da] hover:bg-[#7e5cb7] text-white rounded text-sm transition-colors">
            Primary Button
          </button>
          <button className="px-3 py-1 bg-[#3a3a44] hover:bg-[#4a4a54] text-white rounded text-sm transition-colors">
            Secondary
          </button>
        </div>
      </div>

      {/* Text Preview */}
      <div className="space-y-2">
        <p className="text-white">Primary text color</p>
        <p className="text-gray-400">Secondary text color</p>
        <p className="text-gray-500">Placeholder text color</p>
      </div>

      {/* Status Colors */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#34d399]"></div>
          <span className="text-[#34d399] text-sm">Success message</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#f87171]"></div>
          <span className="text-[#f87171] text-sm">Error message</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
          <span className="text-[#3b82f6] text-sm">Info message</span>
        </div>
      </div>
    </div>
  );

  const ColorDetails = () => {
    if (!selectedColor) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#17171b] rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Color Details</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">Name</p>
            <p className="text-white font-medium">{selectedColor.name}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Category</p>
            <p className="text-white font-medium capitalize">{selectedColor.category}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Hex Value</p>
            <p className="text-white font-mono">{selectedColor.color}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Preview</p>
            <div 
              className="w-full h-16 rounded-lg border border-gray-700 mt-2"
              style={{ backgroundColor: selectedColor.color }}
            ></div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#292830] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Theme Palette</h1>
          <p className="text-gray-400">Explore and visualize your current theme colors</p>
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
        <div className="bg-[#17171b] rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">CSS Variables</h3>
          <div className="bg-[#292830] rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300 font-mono">
{`@theme {
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
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalettePage; 