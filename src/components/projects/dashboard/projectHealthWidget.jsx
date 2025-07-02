import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { HiOutlineExclamationCircle, HiOutlineUsers, HiOutlineViewGridAdd, HiOutlineCollection } from 'react-icons/hi';

const COLORS = {
  'To Do': '#3b82f6',
  'In Progress': '#f97316',
  'Done': '#22c55e',
  'Backlog': '#a855f7',
  'Review': '#eab308',
  'Default': '#6b7280'
};

const KpiCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-bg-secondary p-4 rounded-lg flex items-center gap-4 border border-bg-tertiary">
    <div className={`p-3 rounded-full ${colorClass}`}>
      {React.createElement(icon, { className: 'h-6 w-6 text-text-primary' })}
    </div>
    <div>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
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
          stroke="var(--color-bg-card)"
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
                    <li key={`item-${index}`} className="flex items-center gap-3 text-sm">
                        <div style={{ width: '14px', height: '14px', backgroundColor: color, borderRadius: '3px' }}></div>
                        <span className="text-text-secondary">{name}:</span>
                        <span className="font-semibold text-text-primary">{value}</span>
                    </li>
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
            <div className="text-center">
                <p className="text-lg font-bold" style={{ color: COLORS[activeEntry.name] || COLORS['Default'] }}>
                    {activeEntry.name}
                </p>
                <p className="text-sm text-text-secondary">
                    {`${activeEntry.value} Tasks`}
                </p>
            </div>
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
    <div className="p-6 bg-bg-card rounded-xl border border-bg-secondary">
      <h2 className="text-xl font-bold text-text-primary mb-6">Project Health</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 flex items-center justify-center min-h-[250px] relative">
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
                  stroke="var(--color-bg-card)"
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
          <div className="absolute top-1/2 left-0 -translate-y-1/2" style={{ transform: 'translate( calc(40% - 50%), -50% )'}}>
            <ChartCenterLabel 
                activeIndex={activeIndex}
                data={chartData}
                totalTasks={kpis.totalTasks}
                isEmpty={isChartEmpty}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
          <KpiCard title="Total Tasks" value={kpis.totalTasks} icon={HiOutlineCollection} colorClass="bg-blue-500/20" />
          <KpiCard title="Overdue" value={kpis.overdueTasks} icon={HiOutlineExclamationCircle} colorClass="bg-red-500/20" />
          <KpiCard title="Unassigned" value={kpis.unassignedTasks} icon={HiOutlineViewGridAdd} colorClass="bg-yellow-500/20" />
          <KpiCard title="Team Members" value={kpis.totalMembers} icon={HiOutlineUsers} colorClass="bg-green-500/20" />
        </div>
      </div>
    </div>
  );
};

export default ProjectHealthWidget;