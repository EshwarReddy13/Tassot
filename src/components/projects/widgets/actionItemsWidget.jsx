import React from 'react';
import { HiFire, HiClipboardCheck } from 'react-icons/hi';
import { differenceInDays, formatDistanceToNowStrict } from 'date-fns';

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
        <div className="p-6 bg-bg-card rounded-xl border border-bg-secondary">
             <h2 className="text-xl font-bold text-text-primary mb-4">At a Glance</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upcoming Deadlines Column */}
                <div>
                    <h3 className="flex items-center gap-2 font-semibold text-text-secondary mb-3">
                        <HiFire className="h-5 w-5 text-red-500" />
                        <span>Upcoming Deadlines</span>
                    </h3>
                    <div className="space-y-3">
                        {upcomingDeadlines.length > 0 ? (
                            upcomingDeadlines.map(task => (
                                <div key={task.id} className="bg-bg-secondary p-3 rounded-lg flex justify-between items-center text-sm">
                                    <p className="text-text-primary truncate" title={task.task_name}>{task.task_name}</p>
                                    <span className="text-red-400 font-medium flex-shrink-0 ml-2">{formatDeadline(task.deadline)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-placeholder italic p-3">No deadlines in the next 7 days.</p>
                        )}
                    </div>
                </div>

                {/* My Tasks Column */}
                <div>
                    <h3 className="flex items-center gap-2 font-semibold text-text-secondary mb-3">
                        <HiClipboardCheck className="h-5 w-5 text-blue-500" />
                        <span>My Open Tasks</span>
                    </h3>
                     <div className="space-y-3">
                        {myTasks.length > 0 ? (
                            myTasks.map(task => (
                                <div key={task.id} className="bg-bg-secondary p-3 rounded-lg flex justify-between items-center text-sm">
                                    <p className="text-text-primary truncate" title={task.task_name}>{task.task_name}</p>
                                    <span className="bg-bg-tertiary text-text-secondary text-xs font-semibold px-2 py-1 rounded-full">{task.status}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-placeholder italic p-3">Your plate is clear!</p>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default ActionItemsWidget;