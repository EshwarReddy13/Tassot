import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext';
import ProjectHealthWidget from '../dashboard/ProjectHealthWidget';
import ActionItemsWidget from '../dashboard/ActionItemsWidget';
import RecentActivityWidget from '../dashboard/RecentActivityWidget';

const ProjectDashboardPage = () => {
    const { projectUrl } = useParams();
    const { 
        dashboardSummary, isSummaryLoading, summaryError, getDashboardSummary,
        actionItems, isActionItemsLoading, actionItemsError, getActionItems,
        activityFeed, isActivityLoading, activityError, getActivityFeed // <-- Get activity data
    } = useProjects();
    
    useEffect(() => {
        if (projectUrl) {
            getDashboardSummary(projectUrl);
            getActionItems(projectUrl);
            getActivityFeed(projectUrl); // <-- Fetch activity data
        }
    }, [projectUrl, getDashboardSummary, getActionItems, getActivityFeed]);
    
    const isLoading = isSummaryLoading || isActionItemsLoading || isActivityLoading;
    const error = summaryError || actionItemsError || activityError;

    if (isLoading) {
        return <div className="p-8 text-text-primary animate-pulse">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-error">Error loading dashboard: {error}</div>;
    }
    
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
             <header>
                <h1 className="text-3xl font-bold text-text-primary">
                    {dashboardSummary?.projectName || 'Project'} Dashboard
                </h1>
                <p className="text-text-secondary mt-1">A high-level overview of your project's progress and status.</p>
            </header>
            
            {/* Switched to a more complex grid layout */}
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content on the left */}
                <div className="lg:col-span-2 space-y-8">
                    {dashboardSummary && <ProjectHealthWidget summaryData={dashboardSummary} />}
                    {actionItems && <ActionItemsWidget actionItems={actionItems} />}
                </div>

                {/* Sidebar content on the right */}
                <div className="lg:col-span-1 space-y-8">
                     {activityFeed && <RecentActivityWidget activityFeed={activityFeed} />}
                     {/* The Team Workload widget will go here later */}
                </div>
            </main>
        </div>
    );
};

export default ProjectDashboardPage;