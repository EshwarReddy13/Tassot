import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useUser } from '../../../contexts/UserContext';

export default function InviteModal({ isOpen, onClose, projectUrl }) {
  const { firebaseUser } = useUser();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen && !loading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, loading]);

  const handleClose = () => {
    if (loading) return;
    setError('');
    setSuccess('');
    setEmail('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/projects/${projectUrl}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invitee_email: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invitation.');
      }
      setSuccess(`Invitation successfully sent to ${email}!`);
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden glass-modal p-6 text-left align-middle transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-text-primary">
                  Invite a Teammate
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <p className="text-sm text-text-secondary">Enter the email address of the person you want to invite. They will receive an email with a link to join this project.</p>
                  
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md glass-input px-3 py-2 text-text-primary placeholder-text-placeholder focus:ring-2 focus:ring-accent-primary focus:outline-none"
                      placeholder="teammate@example.com"
                      disabled={loading}
                    />
                  </div>
                  
                  {error && <p className="text-sm text-error">{error}</p>}
                  {success && <p className="text-sm text-success">{success}</p>}

                  <div className="flex justify-end gap-x-4">
                    <button type="button" onClick={handleClose} disabled={loading} className="rounded-md px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-primary focus:outline-none">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center justify-center rounded-md glass-button-accent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary focus-visible:ring-accent-primary disabled:opacity-50">
                      {loading ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}