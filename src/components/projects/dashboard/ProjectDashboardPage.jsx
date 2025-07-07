import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext';
import ProjectHealthWidget from './ProjectHealthWidget.jsx';
import ActionItemsWidget from './ActionItemsWidget.jsx';
import RecentActivityWidget from './RecentActivityWidget.jsx';
import { motion } from 'framer-motion';

const ProjectDashboardPage = () => {
    const { projectUrl } = useParams();
    const { 
        dashboardSummary, isSummaryLoading, summaryError, getDashboardSummary,
        actionItems, isActionItemsLoading, actionItemsError, getActionItems,
        activityFeed, isActivityLoading, activityError, getActivityFeed
    } = useProjects();
    
    useEffect(() => {
        if (projectUrl) {
            getDashboardSummary(projectUrl);
            getActionItems(projectUrl);
            getActivityFeed(projectUrl);
        }
    }, [projectUrl, getDashboardSummary, getActionItems, getActivityFeed]);
    
    const isLoading = isSummaryLoading || isActionItemsLoading || isActivityLoading;
    const error = summaryError || actionItemsError || activityError;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div 
                    className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
                        <span className="text-text-primary font-medium">Loading Dashboard...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div 
                    className="p-8 bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-xl rounded-2xl border border-red-500/20 shadow-2xl max-w-md w-full"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Error Loading Dashboard</h3>
                        <p className="text-text-secondary text-sm">{error}</p>
                    </div>
                </motion.div>
            </div>
        );
    }
    
    return (
        <motion.div 
            className="min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background overlay for glass effect */}
            <div className="fixed inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none"></div>
            
            <div className="relative z-10 p-4 md:p-6 lg:p-8 space-y-8">
                
                {/* Main content grid */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content on the left */}
                    <motion.div 
                        className="lg:col-span-2 space-y-8"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {dashboardSummary && <ProjectHealthWidget summaryData={dashboardSummary} />}
                        {actionItems && <ActionItemsWidget actionItems={actionItems} />}
                    </motion.div>

                    {/* Sidebar content on the right */}
                    <motion.div 
                        className="lg:col-span-1 space-y-8"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                         {activityFeed && <RecentActivityWidget activityFeed={activityFeed} />}
                    </motion.div>
                </main>
            </div>
        </motion.div>
    );
};

export default ProjectDashboardPage;