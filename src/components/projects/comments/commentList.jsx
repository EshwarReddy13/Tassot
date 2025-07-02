import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../../contexts/UserContext';
import Comment from './Comment';
import AddCommentForm from './AddCommentForm';

const CommentList = ({ taskId }) => {
  const { firebaseUser } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const processComments = (flatList) => {
    const commentMap = {};
    const rootComments = [];

    flatList.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });

    flatList.forEach(comment => {
      if (comment.parent_id) {
        if (commentMap[comment.parent_id]) {
            commentMap[comment.parent_id].replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });
    return rootComments;
  };

  const fetchComments = useCallback(async () => {
    if (!taskId || !firebaseUser) return;
    setLoading(true);
    setError('');
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch comments.');
      setComments(processComments(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [taskId, firebaseUser]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (content, parentId = null) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content, parentId }),
      });
      const newComment = await res.json();
      if (!res.ok) throw new Error(newComment.error || 'Failed to post comment.');
      
      // For instant feedback, refetch the comments list
      await fetchComments();
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError('Could not post your comment. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-text-secondary mt-4">Loading comments...</p>;
  }
  if (error) {
    return <p className="text-error mt-4">{error}</p>;
  }

  return (
    <div>
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} onReplySubmit={handlePostComment} />
      ))}
      <AddCommentForm onSubmit={handlePostComment} />
    </div>
  );
};

export default CommentList;