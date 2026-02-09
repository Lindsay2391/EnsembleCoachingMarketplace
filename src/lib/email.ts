import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "CoachConnect <noreply@coachconnect.thinkingbarbershop.com>";

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:5000";
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your CoachConnect email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e8837c;">Welcome to CoachConnect, ${name}!</h2>
        <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #e8837c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">CoachConnect by Thinking Barbershop</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:5000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your CoachConnect password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e8837c;">Password Reset</h2>
        <p>Hi ${name}, we received a request to reset your password. Click the button below to set a new one:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #e8837c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">CoachConnect by Thinking Barbershop</p>
      </div>
    `,
  });
}
