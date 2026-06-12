export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/audit/audit-log";
import { AuditAction } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { to = "kevan@unykorn.org", subject = "Sovereign System Alert", html, text, userId } = await req.json();

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465");
    const user = process.env.SMTP_USER || "kevan@unykorn.org";
    const pass = process.env.SMTP_PASS;

    if (!pass) {
      // Mock mode
      console.log(`[Google Workspace SMTP Mock] Sending email to: ${to}, Subject: ${subject}`);
      
      if (userId) {
        try {
          await logEvent({
            actorId: userId,
            action: AuditAction.LOGIN,
            detail: {
              message: "SMTP notification simulated (Mock mode)",
              recipient: to,
              subject,
            },
          });
        } catch (dbErr) {
          console.error("Failed to write mock email audit event:", dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully (Mock mode - SMTP_PASS not set)",
        mock: true,
        details: {
          to,
          subject,
          from: user,
          host,
          port,
        }
      });
    }

    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    const authConfig: any = {
      user,
    };

    if (clientId && clientSecret && refreshToken) {
      authConfig.type = "OAuth2";
      authConfig.clientId = clientId;
      authConfig.clientSecret = clientSecret;
      authConfig.refreshToken = refreshToken;
    } else {
      authConfig.pass = pass;
    }

    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: authConfig,
    });

    const info = await transporter.sendMail({
      from: `"${user.split('@')[0].toUpperCase()} - Legacy Vault" <${user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[Google Workspace SMTP Production] Email sent: ${info.messageId}`);

    if (userId) {
      try {
        await logEvent({
          actorId: userId,
          action: AuditAction.LOGIN,
          detail: {
            message: "SMTP notification sent via Workspace",
            recipient: to,
            subject,
            messageId: info.messageId,
          },
        });
      } catch (dbErr) {
        console.error("Failed to write email audit event:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: "Email sent successfully through Google Workspace SMTP",
    });
  } catch (error: any) {
    console.error("Google Workspace SMTP routing failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
