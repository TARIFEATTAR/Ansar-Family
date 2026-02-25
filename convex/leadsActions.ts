"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * LEADS ACTIONS — Node.js runtime actions for email + Slack
 * Separated from leads.ts because "use node" is file-level.
 */

export const sendConfirmationEmail = internalAction({
  args: {
    email: v.string(),
    firstName: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY — skipping lead confirmation email");
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#F8F6F1;color:#3D3D3D;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:500;color:#3D3D3D;margin:0;">Ansar Family</h1>
    </div>
    <div style="background:white;border-radius:12px;padding:32px;border:1px solid rgba(61,61,61,0.06);">
      <h2 style="font-family:Georgia,'Times New Roman',serif;color:#3D3D3D;font-size:22px;font-weight:500;margin:0 0 16px 0;">
        Thank you, ${args.firstName}
      </h2>
      <p style="font-size:16px;line-height:1.7;color:#5A5A5A;margin:0 0 16px 0;">
        We received your interest in bringing Ansar Family to your community. Our team will be in touch shortly.
      </p>
      <p style="font-size:16px;line-height:1.7;color:#5A5A5A;margin:0 0 24px 0;">
        If you scheduled a call, we look forward to speaking with you. If not, you can book a time at any point by visiting our scheduling page.
      </p>
      <div style="border-top:1px solid #eee;padding-top:20px;margin-top:8px;">
        <p style="font-size:13px;color:#999;margin:0;">Ansar Family — Every Heart Rooted</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Ansar Family <noreply@ansar.family>",
          to: [args.email],
          subject: "Thank you for your interest in Ansar Family",
          html,
        }),
      });
    } catch (err) {
      console.error("Failed to send lead confirmation email:", err);
    }
  },
});

export const sendSlackNotification = internalAction({
  args: {
    fullName: v.string(),
    email: v.string(),
    organizationType: v.string(),
  },
  handler: async (_ctx, args) => {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log("No SLACK_WEBHOOK_URL configured — skipping Slack notification");
      return;
    }

    const orgLabel: Record<string, string> = {
      masjid: "Masjid",
      msa: "MSA",
      community_org: "Community Organization",
      other: "Other",
    };

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `New partner lead from homepage`,
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: "New Partner Lead" },
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Name:*\n${args.fullName}` },
                { type: "mrkdwn", text: `*Email:*\n${args.email}` },
                { type: "mrkdwn", text: `*Organization:*\n${orgLabel[args.organizationType] || args.organizationType}` },
              ],
            },
          ],
        }),
      });
    } catch (err) {
      console.error("Failed to send Slack notification:", err);
    }
  },
});
