import { useState } from 'react';
import { useUser } from '../../../contexts/UserContext';

const AddCommentForm = ({ onSubmit, placeholder = "Add a comment...", buttonText = "Comment", initialContent = "" }) => {
  const { userData } = useUser();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit(content);
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3 mt-4">
      {userData && (
        <img
          src={userData.photo_url || `https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}&background=3a3a44&color=fff`}
          alt="Your avatar"
          className="w-9 h-9 rounded-full object-cover mt-1"
        />
      )}
      <div className="flex-grow">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-bg-primary text-text-primary placeholder-text-placeholder p-3 rounded-md border-2 border-transparent focus:border-accent-primary focus:outline-none resize-y transition-colors min-h-[4rem]"
          rows="2"
          disabled={isSubmitting}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-2 rounded-md bg-accent-primary text-text-primary font-semibold transition-all duration-200 hover:bg-accent-hover disabled:bg-bg-primary disabled:text-text-secondary disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : buttonText}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddCommentForm;