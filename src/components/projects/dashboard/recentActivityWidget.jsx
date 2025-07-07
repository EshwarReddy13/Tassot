import React from 'react';
import { HiOutlineSparkles, HiOutlineChatAlt, HiOutlineUserAdd, HiClock } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const ActivityIcon = ({ type }) => {
    let Icon;
    let bgColor;
    let iconColor;
    
    switch(type) {
        case 'new_task': 
            Icon = HiOutlineSparkles; 
            bgColor = 'bg-blue-500/20';
            iconColor = 'text-blue-500';
            break;
        case 'new_comment': 
            Icon = HiOutlineChatAlt; 
            bgColor = 'bg-green-500/20';
            iconColor = 'text-green-500';
            break;
        case 'new_member': 
            Icon = HiOutlineUserAdd; 
            bgColor = 'bg-purple-500/20';
            iconColor = 'text-purple-500';
            break;
        default: 
            Icon = HiClock;
            bgColor = 'bg-gray-500/20';
            iconColor = 'text-gray-500';
    }
    
    return (
        <div className={`p-3 rounded-xl ${bgColor} backdrop-blur-sm flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
    );
};

const ActivityText = ({ type, user, item }) => {
    const userName = `${user.first_name || 'A user'}`;

    switch(type) {
        case 'new_task':
            return (
                <>
                    <span className="font-semibold text-text-primary">{userName}</span>
                    <span className="text-text-secondary"> created task </span>
                    <span className="font-semibold text-accent-primary">{item.task_key}</span>
                    <span className="text-text-secondary">: "{item.task_name}"</span>
                </>
            );
        case 'new_comment':
            return (
                <>
                    <span className="font-semibold text-text-primary">{userName}</span>
                    <span className="text-text-secondary"> commented on </span>
                    <span className="font-semibold text-accent-primary">{item.task_key}</span>
                    <span className="text-text-secondary">: "{item.content_preview}..."</span>
                </>
            );
        case 'new_member':
            return (
                <>
                    <span className="font-semibold text-text-primary">{userName}</span>
                    <span className="text-text-secondary"> joined the project</span>
                </>
            );
        default:
            return <span className="text-text-secondary">An unknown activity occurred</span>;
    }
};

const RecentActivityWidget = ({ activityFeed }) => {
    return (
        <motion.div 
            className="p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
                <h2 className="text-xl font-bold text-text-primary">Recent Activity</h2>
            </div>

            <div className="space-y-4">
                {activityFeed && activityFeed.length > 0 ? (
                    activityFeed.map((activity, index) => (
                        <motion.div 
                            key={index} 
                            className="bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-xl rounded-lg border border-white/10 p-4 hover:shadow-lg transition-all duration-300"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.01, y: -2 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                                backdropFilter: 'blur(15px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(15px) saturate(180%)'
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <ActivityIcon type={activity.type} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-relaxed mb-2">
                                        <ActivityText type={activity.type} user={activity.user_info} item={activity.item_info} />
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-text-placeholder rounded-full"></div>
                                        <p className="text-xs text-text-placeholder">
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <motion.div 
                        className="bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-xl rounded-lg border border-white/10 p-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                            backdropFilter: 'blur(15px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(15px) saturate(180%)'
                        }}
                    >
                        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-text-secondary font-medium mb-1">No recent activity</p>
                        <p className="text-xs text-text-placeholder">Activity will appear here as your team works</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default RecentActivityWidget;