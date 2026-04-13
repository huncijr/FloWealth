import { Resend } from "resend";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const resend = new Resend(process.env.RESEND_API);

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOTP = async (targetEmail: string, code: string) => {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is missing");
  if (!process.env.RESEND_API) throw new Error("RESEND_API_KEY is missing");

  const safe = (code ?? "").toString().replace(/\s+/g, "").slice(0, 6);
  const digits = safe.padEnd(6, "•").split("");

  const appName = "FloWealth";
  const logoUrl = "process.env";
  const githubUrl = "https://github.com/huncijr/FloWealth";
  const termsUrl = "https://www.flowealth.eu/Terms&Conditions";
  const supportEmail = "flowealthwebapp@gmail.com";
  try {
    await resend.emails.send({
      from,
      to: targetEmail,
      subject: "Registration code",
      text: `The code: ${code}`,
      html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${appName} Verification Code</title>
</head><body style="margin:0;padding:0;background:#0b0b0f;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji';">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-radius:18px;overflow:hidden;background:#12121a;border:1px solid rgba(255,255,255,.08);">
          
          <!-- Top gradient bar -->
          <tr>
            <td style="height:6px;background:linear-gradient(90deg, rgba(245,158,11,.55), rgba(249,115,22,.55));"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:22px 22px 10px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle">
                    ${
                      logoUrl
                        ? `<img src="${logoUrl}" width="36" height="36" alt="${appName} logo" style="display:block;border-radius:10px;" />`
                        : `<div style="width:36px;height:36px;border-radius:10px;background:rgba(249,115,22,.14);border:1px solid rgba(249,115,22,.35);display:flex;align-items:center;justify-content:center;color:#f59e0b;font-weight:800;font-size:14px;letter-spacing:.5px;">FW</div>`
                    }
                  </td>
                  <td align="right" valign="middle" style="color:rgba(255,255,255,.6);font-size:12px;">
                    ${appName} Web App
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:6px 22px 0 22px;">
              <div style="color:#fff;font-size:22px;font-weight:800;line-height:1.2;">
                Verification code
              </div>
              <div style="margin-top:6px;color:rgba(255,255,255,.7);font-size:13px;line-height:1.5;">
                Use the code below to complete your sign up. This code expires soon.
              </div>
            </td>
          </tr>

          <!-- Code blocks -->
          <tr>
            <td align="center" style="padding:18px 22px 8px 22px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  ${digits
                    .map(
                      (d) => `
                    <td style="padding:0 6px;">
                      <div style="
                        width:48px;height:56px;
                        border-radius:12px;
                        background:rgba(255,255,255,.04);
                        border:1px solid rgba(249,115,22,.28);
                        box-shadow:0 0 0 2px rgba(245,158,11,.10) inset;
                        display:flex;align-items:center;justify-content:center;
                        color:#fff;font-size:22px;font-weight:800;
                        padding-left:18px;  
                        padding-top:14px;  
                        letter-spacing:.5px;">
                        ${d}
                      </div>
                    </td>
                  `,
                    )
                    .join("")}
                </tr>
              </table>

              <div style="margin-top:12px;color:rgba(255,255,255,.55);font-size:12px;">
                If you didn’t request this, you can safely ignore this email.
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:10px 22px 0 22px;">
              <div style="height:1px;background:rgba(255,255,255,.08);"></div>
            </td>
          </tr>

          <!-- Footer links -->
          <tr>
            <td style="padding:14px 22px 20px 22px;">
              <div style="color:rgba(255,255,255,.72);font-size:12px;line-height:1.6;">
                Open-source project:
                <a href="${githubUrl}" target="_blank" rel="noopener" style="color:#f59e0b;text-decoration:none;font-weight:700;">
                  GitHub Repository
                </a>
                <span style="color:rgba(255,255,255,.35);">·</span>
                Please review our
                <a href="${termsUrl}" target="_blank" rel="noopener" style="color:#f97316;text-decoration:none;font-weight:700;">
                  Terms & Conditions
                </a>
                for more details
              </div>

              <div style="margin-top:10px;color:rgba(255,255,255,.45);font-size:11px;line-height:1.5;">
                Need help? Contact: <a href="mailto:${supportEmail}" style="color:rgba(255,255,255,.7);text-decoration:none;">${supportEmail}</a>
              </div>
            </td>
          </tr>

        </table>

        <!-- tiny footnote -->
        <div style="max-width:560px;margin-top:10px;color:rgba(255,255,255,.35);font-size:11px;line-height:1.4;text-align:center;">
          © ${new Date().getFullYear()} ${appName}. All rights reserved.
        </div>

      </td>
    </tr>
  </table>
</body>
</html>`,
    });
  } catch (err) {
    console.error("sendotp failed", err);
  }
};
