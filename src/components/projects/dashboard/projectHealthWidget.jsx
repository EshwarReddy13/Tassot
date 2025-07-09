import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { HiOutlineExclamationCircle, HiOutlineUsers, HiOutlineViewGridAdd, HiOutlineCollection } from 'react-icons/hi';
import { motion } from 'framer-motion';

const COLORS = {
  'To Do': '#3b82f6',
  'In Progress': '#f97316',
  'Done': '#22c55e',
  'Backlog': '#a855f7',
  'Review': '#eab308',
  'Default': '#6b7280'
};

const KpiCard = ({ title, value, icon, colorClass }) => (
  <motion.div 
    className="glass-dark p-4 flex items-center gap-4"
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className={`p-3 rounded-xl ${colorClass} backdrop-blur-sm`}>
      {React.createElement(icon, { className: 'h-6 w-6 text-white' })}
    </div>
    <div>
      <p className="text-sm text-text-secondary font-medium">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  </motion.div>
);

// --- THIS FUNCTION IS NOW FIXED ---
// It is now ONLY responsible for rendering the expanded shape, not the text.
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={2}
        />
      </g>
    );
};
// ------------------------------------

const CustomLegend = (props) => {
    const { payload } = props;
    if (!payload || !payload.length) return null;
    return (
        <ul className="flex flex-col gap-3 justify-center h-full">
            {payload.map((entry, index) => {
                const { color } = entry;
                const { name, value } = entry.payload; 
                return (
                    <motion.li 
                        key={`item-${index}`} 
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <div style={{ width: '14px', height: '14px', backgroundColor: color, borderRadius: '6px' }} className="shadow-lg"></div>
                        <span className="text-text-secondary">{name}:</span>
                        <span className="font-semibold text-text-primary">{value}</span>
                    </motion.li>
                );
            })}
        </ul>
    );
};

const ChartCenterLabel = ({ activeIndex, data, totalTasks, isEmpty }) => {
    if (isEmpty) {
        return (
            <div className="text-center">
                <p className="text-lg font-semibold text-text-secondary">No tasks yet</p>
            </div>
        );
    }
    if (activeIndex !== null) {
        const activeEntry = data[activeIndex];
        if (!activeEntry) return null;
        return (
            <motion.div 
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <p className="text-lg font-bold" style={{ color: COLORS[activeEntry.name] || COLORS['Default'] }}>
                    {activeEntry.name}
                </p>
                <p className="text-sm text-text-secondary">
                    {`${activeEntry.value} Tasks`}
                </p>
            </motion.div>
        )
    }
    return (
        <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">{totalTasks}</p>
            <p className="text-sm text-text-secondary">Total Tasks</p>
        </div>
    );
};


const ProjectHealthWidget = ({ summaryData }) => {
  if (!summaryData) return null;

  const [activeIndex, setActiveIndex] = useState(null);
  const { kpis, taskStatusSummary } = summaryData;
  const chartData = taskStatusSummary.map(item => ({ ...item, name: item.status, value: item.count }));

  const onPieEnter = (_, index) => { setActiveIndex(index); };
  const onPieLeave = () => { setActiveIndex(null); };

  const isChartEmpty = kpis.totalTasks === 0;

  const displayData = isChartEmpty 
    ? chartData.map(item => ({ ...item, visualValue: 1 }))
    : chartData.map(item => ({ ...item, visualValue: item.value }));

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary">Project Health</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 flex items-center justify-center min-h-[250px] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 rounded-xl blur-lg opacity-50"></div>
          <div className="relative z-10 w-full h-full">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                    data={displayData}
                    dataKey="visualValue"
                    cx="40%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={4}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                >
                    {displayData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS['Default']} />
                    ))}
                </Pie>
                <Legend
                  align="right"
                  verticalAlign="middle"
                  layout="vertical"
                  iconSize={0}
                  content={<CustomLegend />}
                />
                <Tooltip
                  cursor={false}
                  wrapperStyle={{ visibility: 'hidden' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 z-20" style={{ transform: 'translate( calc(40% - 50%), -50% )'}}>
            <ChartCenterLabel 
                activeIndex={activeIndex}
                data={chartData}
                totalTasks={kpis.totalTasks}
                isEmpty={isChartEmpty}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
          <KpiCard title="Total Tasks" value={kpis.totalTasks} icon={HiOutlineCollection} colorClass="bg-gradient-to-br from-blue-500/80 to-blue-600/60" />
          <KpiCard title="Overdue" value={kpis.overdueTasks} icon={HiOutlineExclamationCircle} colorClass="bg-gradient-to-br from-red-500/80 to-red-600/60" />
          <KpiCard title="Unassigned" value={kpis.unassignedTasks} icon={HiOutlineViewGridAdd} colorClass="bg-gradient-to-br from-yellow-500/80 to-yellow-600/60" />
          <KpiCard title="Team Members" value={kpis.totalMembers} icon={HiOutlineUsers} colorClass="bg-gradient-to-br from-green-500/80 to-green-600/60" />
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default ProjectHealthWidget;