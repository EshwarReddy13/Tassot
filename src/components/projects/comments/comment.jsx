import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import AddCommentForm from './AddCommentForm.jsx';

const Comment = ({ comment, onReplySubmit, isReply = false }) => {
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async (content) => {
    await onReplySubmit(content, comment.id);
    setIsReplying(false);
  };

  return (
    <div className={`flex items-start gap-3 ${isReply ? 'mt-4 ml-8 pl-4 border-l-2 border-bg-primary' : 'mt-6'}`}>
      <img
        src={comment.photo_url || `https://ui-avatars.com/api/?name=${comment.first_name}+${comment.last_name}&background=3a3a44&color=fff`}
        alt={`${comment.first_name}'s avatar`}
        className="w-9 h-9 rounded-full object-cover mt-1"
      />
      <div className="flex-grow">
        <div className="flex items-baseline gap-2">
          <p className="font-semibold text-text-primary">{comment.first_name} {comment.last_name}</p>
          <p className="text-xs text-text-secondary">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </p>
        </div>
        <p className="mt-1 text-text-primary whitespace-pre-wrap">{comment.content}</p>
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="mt-2 text-xs font-semibold text-text-secondary hover:text-accent-primary transition-colors"
        >
          Reply
        </button>
        {isReplying && (
          <AddCommentForm 
            onSubmit={handleReply}
            placeholder="Write a reply..."
            buttonText="Reply"
          />
        )}
        
        {/* Render Replies */}
        {comment.replies?.map(reply => (
          <Comment 
            key={reply.id} 
            comment={reply} 
            onReplySubmit={onReplySubmit} 
            isReply={true} 
          />
        ))}
      </div>
    </div>
  );
};

export default Comment;