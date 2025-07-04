import { motion } from 'framer-motion';

const AIToolCard = ({ tool, onClick }) => (
  <motion.div
    className="bg-bg-card border border-border-secondary rounded-xl p-4 hover:border-border-primary transition-all duration-300 hover:shadow-lg cursor-pointer group"
    whileHover={{ y: -2 }}
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${tool.color} text-lg`}>
        {tool.icon}
      </div>
      <div className="flex-1">
        <h3 className="text-text-primary font-semibold text-sm mb-1 group-hover:text-accent-primary transition-colors">
          {tool.name}
        </h3>
        <p className="text-text-secondary text-xs leading-relaxed">
          {tool.description}
        </p>
      </div>
    </div>
  </motion.div>
);

const AITools = () => {
  const aiTools = [
    {
      id: 'task_creation',
      name: 'AI Task Creation',
      description: 'Generate tasks with AI assistance',
      icon: '🤖',
      color: 'bg-purple-500/20 text-purple-400',
      action: 'create_task'
    },
    {
      id: 'description_enhancement',
      name: 'Description Enhancement',
      description: 'Improve task descriptions with AI',
      icon: '✨',
      color: 'bg-blue-500/20 text-blue-400',
      action: 'enhance_description'
    },
    {
      id: 'name_enhancement',
      name: 'Name Enhancement',
      description: 'Optimize task names with AI',
      icon: '✏️',
      color: 'bg-green-500/20 text-green-400',
      action: 'enhance_name'
    },
    {
      id: 'ai_settings',
      name: 'AI Settings',
      description: 'Configure AI preferences',
      icon: '⚙️',
      color: 'bg-orange-500/20 text-orange-400',
      action: 'settings'
    }
  ];

  const handleToolClick = (tool) => {
    // Handle different AI tool actions
    switch (tool.action) {
      case 'create_task':
        console.log('Open AI task creation');
        break;
      case 'enhance_description':
        console.log('Open description enhancement');
        break;
      case 'enhance_name':
        console.log('Open name enhancement');
        break;
      case 'settings':
        console.log('Open AI settings');
        break;
      default:
        console.log('Tool clicked:', tool.name);
    }
  };

  return (
    <div 
      className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <h2 className="text-text-primary text-xl font-bold">AI Tools</h2>
          <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full font-medium">
            {aiTools.length}
          </span>
        </div>
        <motion.button
          className="text-accent-primary hover:text-accent-hover text-sm font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View All
        </motion.button>
      </div>

      <div className="space-y-3">
        {aiTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <AIToolCard tool={tool} onClick={() => handleToolClick(tool)} />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-accent-primary text-lg">💡</span>
          <h3 className="text-accent-primary font-medium text-sm">AI Tips</h3>
        </div>
        <p className="text-text-secondary text-xs leading-relaxed">
          Use AI tools to speed up your workflow. Try creating tasks with AI assistance or enhancing existing descriptions for better clarity.
        </p>
      </div>
    </div>
  );
};

export default AITools; 