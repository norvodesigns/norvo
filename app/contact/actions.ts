"use server";

import { Resend } from "resend";

export type ContactResult = { ok: boolean; error?: string; code?: "NO_EMAIL_CONFIGURED" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function renderHtml(name: string, email: string, message: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
    <div style="height:4px;border-radius:4px;background:linear-gradient(120deg,#0D7A7A,#D9A441);margin-bottom:20px;"></div>
    <h1 style="font-size:20px;margin:0 0 4px;">New contact message</h1>
    <p style="margin:0 0 20px;color:#666;font-size:13px;">${esc(name)} · <a href="mailto:${esc(email)}" style="color:#0D7A7A;">${esc(email)}</a></p>
    <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;border:1px solid #eee;border-radius:10px;padding:16px;">${esc(message)}</div>
    <p style="margin:20px 0 0;color:#999;font-size:12px;">Sent from the Norvo contact form. Reply directly to reach ${esc(name)}.</p>
  </div>`;
}

export async function submitContact(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { ok: false, error: "Please add your name so we know who to reply to." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (!message) return { ok: false, error: "Please add a short message." };

  const subject = `New message from ${name} — Norvo`;
  const html = renderHtml(name, email, message);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No provider wired yet — don't lose the lead; the client shows a mailto fallback.
    console.warn("[submitContact] RESEND_API_KEY not set — message not emailed.", { name, email });
    return { ok: false, code: "NO_EMAIL_CONFIGURED", error: "Email isn't configured yet." };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.BRIEF_FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.BRIEF_TO_EMAIL || "norvodesigns@gmail.com",
      replyTo: email,
      subject,
      html,
    });
    if (error) {
      console.error("[submitContact] Resend error:", error);
      return { ok: false, error: "We couldn't send your message just now. Please email us directly." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[submitContact] send threw:", e);
    return { ok: false, error: "We couldn't send your message just now. Please email us directly." };
  }
}
