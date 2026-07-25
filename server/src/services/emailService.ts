import { Resend } from 'resend';

// Initialize Resend client with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a 6-digit OTP verification email to the tenant's inbox.
 * The user MUST check their real email inbox to retrieve this code.
 */
export async function sendInquiryOtpEmail(params: {
  to: string;
  userName: string;
  referenceCode: string;
  otpCode: string;
}): Promise<void> {
  const { to, userName, referenceCode, otpCode } = params;

  await resend.emails.send({
    from: 'Staypoint Davao <onboarding@resend.dev>',
    to: [to],
    subject: `Your Inquiry Verification Code — ${otpCode}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Verify Your Inquiry</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e40af,#0ea5e9);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                      🏠 Staypoint Davao
                    </h1>
                    <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;font-weight:500;">
                      Property Inquiry Email Verification
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 6px;font-size:15px;color:#64748b;font-weight:500;">
                      Hello, <strong style="color:#1e293b;">${userName}</strong>
                    </p>
                    <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">
                      You submitted a property inquiry at Staypoint Davao. To confirm your email address is valid and activate your inquiry, please enter the verification code below.
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#0f172a;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                      <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#64748b;letter-spacing:3px;text-transform:uppercase;">
                        Your 6-Digit Verification Code
                      </p>
                      <p style="margin:0;font-size:44px;font-weight:900;color:#38bdf8;letter-spacing:12px;font-family:'Courier New',monospace;">
                        ${otpCode}
                      </p>
                    </div>

                    <!-- Reference Code -->
                    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:28px;display:flex;">
                      <p style="margin:0;font-size:12px;color:#64748b;">
                        <strong>Inquiry Reference:</strong>&nbsp;
                        <span style="font-family:'Courier New',monospace;font-weight:700;color:#1e40af;">${referenceCode}</span>
                      </p>
                    </div>

                    <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;line-height:1.7;">
                      ⏱ This code is valid for your current inquiry session. If you did not submit an inquiry at Staypoint Davao, please ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;">
                      © ${new Date().getFullYear()} Staypoint Davao · Rizal Extension, Poblacion District, Davao City
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

/**
 * Sends an email notification to the tenant when the property manager replies to their inquiry.
 */
export async function sendAdminReplyEmail(params: {
  to: string;
  userName: string;
  referenceCode: string;
  replyMessage: string;
  accessToken?: string;
}): Promise<void> {
  const { to, userName, referenceCode, replyMessage, accessToken } = params;

  // Link goes directly to the thread by reference code only — no token needed to view
  const trackUrl = `https://staypoint-davao.vercel.app/track-inquiry?code=${referenceCode}`;

  await resend.emails.send({
    from: 'Staypoint Davao <onboarding@resend.dev>',
    to: [to],
    subject: `📩 Property Manager Replied to Your Inquiry — ${referenceCode}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Manager Reply — Staypoint Davao</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e40af,#0ea5e9);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                      🏠 Staypoint Davao
                    </h1>
                    <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;font-weight:500;">
                      Property Manager has replied to your inquiry
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 6px;font-size:15px;color:#64748b;font-weight:500;">
                      Hello, <strong style="color:#1e293b;">${userName}</strong>
                    </p>
                    <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.7;">
                      The property manager at <strong>Staypoint Davao</strong> has replied to your inquiry <strong style="color:#1e40af;">${referenceCode}</strong>.
                    </p>

                    <!-- Reply Message Box -->
                    <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                      <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#0369a1;letter-spacing:2px;text-transform:uppercase;">
                        Manager's Reply
                      </p>
                      <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.8;white-space:pre-line;">
                        ${replyMessage}
                      </p>
                    </div>

                    <!-- Reference Code -->
                    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
                      <p style="margin:0;font-size:12px;color:#64748b;">
                        <strong>Inquiry Reference:</strong>&nbsp;
                        <span style="font-family:'Courier New',monospace;font-weight:700;color:#1e40af;">${referenceCode}</span>
                      </p>
                    </div>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${trackUrl}"
                            style="display:inline-block;background:linear-gradient(135deg,#1e40af,#0ea5e9);color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;padding:14px 32px;border-radius:12px;letter-spacing:0.3px;">
                            View Full Conversation Thread →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0;font-size:11px;color:#94a3b8;">
                      © ${new Date().getFullYear()} Staypoint Davao · Rizal Extension, Poblacion District, Davao City
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}
