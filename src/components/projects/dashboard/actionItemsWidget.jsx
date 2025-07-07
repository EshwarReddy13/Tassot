import React from 'react';
import { HiFire, HiClipboardCheck } from 'react-icons/hi';
import { differenceInDays, formatDistanceToNowStrict } from 'date-fns';
import { motion } from 'framer-motion';

// Utility function to format deadlines nicely
const formatDeadline = (deadline) => {
    const daysLeft = differenceInDays(new Date(deadline), new Date());
    if (daysLeft < 0) return 'Overdue';
    if (daysLeft === 0) return 'Today';
    if (daysLeft === 1) return 'Tomorrow';
    return `in ${formatDistanceToNowStrict(new Date(deadline))}`;
};

const ActionItemsWidget = ({ actionItems }) => {
    if (!actionItems) return null;
    
    const { upcomingDeadlines, myTasks } = actionItems;

    return (
        <motion.div 
            className="p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-text-primary">At a Glance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upcoming Deadlines Column */}
                <div>
                    <h3 className="flex items-center gap-2 font-semibold text-text-secondary mb-4">
                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <HiFire className="h-4 w-4 text-red-500" />
                        </div>
                        <span>Upcoming Deadlines</span>
                    </h3>
                    <div className="space-y-3">
                        {upcomingDeadlines.length > 0 ? (
                            upcomingDeadlines.map((task, index) => (
                                <motion.div 
                                    key={task.id} 
                                    className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-lg border border-white/20 p-4 flex justify-between items-center text-sm hover:shadow-lg transition-all duration-300"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                                        backdropFilter: 'blur(15px) saturate(180%)',
                                        WebkitBackdropFilter: 'blur(15px) saturate(180%)'
                                    }}
                                >
                                    <p className="text-text-primary truncate font-medium" title={task.task_name}>{task.task_name}</p>
                                    <span className="text-red-400 font-semibold flex-shrink-0 ml-2 px-2 py-1 bg-red-500/20 rounded-full text-xs">
                                        {formatDeadline(task.deadline)}
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                className="bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-xl rounded-lg border border-white/10 p-4 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                                    backdropFilter: 'blur(15px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(15px) saturate(180%)'
                                }}
                            >
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-text-secondary font-medium">No deadlines in the next 7 days</p>
                                <p className="text-xs text-text-placeholder mt-1">You're all caught up!</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* My Tasks Column */}
                <div>
                    <h3 className="flex items-center gap-2 font-semibold text-text-secondary mb-4">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <HiClipboardCheck className="h-4 w-4 text-blue-500" />
                        </div>
                        <span>My Open Tasks</span>
                    </h3>
                    <div className="space-y-3">
                        {myTasks.length > 0 ? (
                            myTasks.map((task, index) => (
                                <motion.div 
                                    key={task.id} 
                                    className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-lg border border-white/20 p-4 flex justify-between items-center text-sm hover:shadow-lg transition-all duration-300"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                                        backdropFilter: 'blur(15px) saturate(180%)',
                                        WebkitBackdropFilter: 'blur(15px) saturate(180%)'
                                    }}
                                >
                                    <p className="text-text-primary truncate font-medium" title={task.task_name}>{task.task_name}</p>
                                    <span className="bg-accent-primary/20 text-accent-primary text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                                        {task.status}
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                className="bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-xl rounded-lg border border-white/10 p-4 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                                    backdropFilter: 'blur(15px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(15px) saturate(180%)'
                                }}
                            >
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-text-secondary font-medium">Your plate is clear!</p>
                                <p className="text-xs text-text-placeholder mt-1">No open tasks assigned to you</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ActionItemsWidget;