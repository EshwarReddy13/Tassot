import pool from '../db.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

export const createAndSendInvitation = async ({ projectId, projectName, inviterId, inviteeEmail }) => {
  // Validate input to the service itself
  if (!projectId || !projectName || !inviterId || !inviteeEmail) {
    throw new Error('Missing required parameters for creating an invitation.');
  }

  // 1. Check if the user is already a member of the project
  const existingMemberQuery = await pool.query(
    `SELECT u.id FROM users u
     JOIN project_users pu ON u.id = pu.user_id
     WHERE u.email = $1 AND pu.project_id = $2`,
    [inviteeEmail, projectId]
  );

  if (existingMemberQuery.rows.length > 0) {
    throw new Error('This user is already a member of the project.');
  }

  // 2. Check for an existing pending invitation
  const existingInviteQuery = await pool.query(
    `SELECT id FROM invitations WHERE project_id = $1 AND invitee_email = $2 AND status = 'pending' AND expires_at > now()`,
    [projectId, inviteeEmail]
  );

  if (existingInviteQuery.rows.length > 0) {
    throw new Error('An invitation is already pending for this email address.');
  }

  // 3. Generate a secure token and create the invitation record
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(
    `INSERT INTO invitations (token, project_id, invitee_email, inviter_id) VALUES ($1, $2, $3, $4)`,
    [token, projectId, inviteeEmail, inviterId]
  );

  // 4. Construct and send the email
  const inviteLink = `${process.env.FRONTEND_ORIGIN}/accept-invite?token=${token}`;
  const emailHtml = `
    <h2>You’ve been invited to join <strong>${projectName}</strong> on Tassot</h2>
    <p>The project owner has invited you to collaborate. Click below to accept:</p>
    <a href="${inviteLink}" style="padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px;">Accept Invite</a>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <pre>${inviteLink}</pre>
  `;

  await sendEmail({
    to: inviteeEmail,
    subject: `You're invited to join '${projectName}' on Tassot`,
    html: emailHtml,
  });

  return { message: 'Invitation sent successfully.' };
};