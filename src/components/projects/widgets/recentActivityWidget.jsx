import React from 'react';
import { HiOutlineSparkles, HiOutlineChatAlt, HiOutlineUserAdd, HiClock } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';

const ActivityIcon = ({ type }) => {
    let Icon;
    switch(type) {
        case 'new_task': Icon = HiOutlineSparkles; break;
        case 'new_comment': Icon = HiOutlineChatAlt; break;
        case 'new_member': Icon = HiOutlineUserAdd; break;
        default: Icon = HiClock;
    }
    return <div className="bg-bg-secondary p-2 rounded-full"><Icon className="h-5 w-5 text-text-secondary" /></div>;
};

const ActivityText = ({ type, user, item }) => {
    const userName = `${user.first_name || 'A user'}`;

    switch(type) {
        case 'new_task':
            return <><strong>{userName}</strong> created task <strong>{item.task_key}</strong>: "{item.task_name}"</>;
        case 'new_comment':
            return <><strong>{userName}</strong> commented on <strong>{item.task_key}</strong>: "{item.content_preview}..."</>;
        case 'new_member':
            return <><strong>{userName}</strong> joined the project.</>;
        default:
            return <>An unknown activity occurred.</>;
    }
};


const RecentActivityWidget = ({ activityFeed }) => {
    return (
        <div className="p-6 bg-bg-card rounded-xl border border-bg-secondary">
             <h2 className="text-xl font-bold text-text-primary mb-4">Recent Activity</h2>
             <div className="space-y-4">
                {activityFeed && activityFeed.length > 0 ? (
                    activityFeed.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4">
                           <ActivityIcon type={activity.type} />
                           <div className="flex-1">
                               <p className="text-sm text-text-secondary">
                                   <ActivityText type={activity.type} user={activity.user_info} item={activity.item_info} />
                               </p>
                               <p className="text-xs text-text-placeholder mt-1">
                                   {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                               </p>
                           </div>
                        </div>
                    ))
                ) : (
                     <p className="text-sm text-text-placeholder italic py-4 text-center">No recent activity to show.</p>
                )}
             </div>
        </div>
    );
};

export default RecentActivityWidget;