"use server";

import { Resend } from "resend";
import type { Answers } from "@/components/intake/types";

export type SubmitResult = { ok: boolean; error?: string; code?: "NO_EMAIL_CONFIGURED" };

const MAX_TOTAL_BYTES = 8 * 1024 * 1024; // 8MB total across attachments

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function row(label: string, value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value.filter(Boolean).join(", ") : (value || "").trim();
  if (!v) return "";
  return `
    <tr>
      <td style="padding:10px 16px;vertical-align:top;color:#0D7A7A;font-weight:600;font-size:13px;width:180px;border-bottom:1px solid #eee;">${esc(label)}</td>
      <td style="padding:10px 16px;vertical-align:top;color:#111;font-size:14px;line-height:1.5;border-bottom:1px solid #eee;white-space:pre-wrap;">${esc(v)}</td>
    </tr>`;
}

function renderBriefHtml(a: Answers, fileNames: string[]): string {
  const guidance =
    a.needsGuidance && a.needsGuidance.length
      ? `<div style="margin:0 0 20px;padding:12px 16px;background:#FBF3DF;border:1px solid #D9A441;border-radius:10px;color:#7a5b12;font-size:13px;">
           <strong>Wants guidance on:</strong> ${esc(a.needsGuidance.join(", "))}
         </div>`
      : "";

  const refs = (a.references || []).filter((r) => r && r.trim());

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#111;">
    <div style="height:4px;border-radius:4px;background:linear-gradient(120deg,#0D7A7A,#D9A441);margin-bottom:20px;"></div>
    <h1 style="font-size:20px;margin:0 0 4px;">New project brief</h1>
    <p style="margin:0 0 20px;color:#666;font-size:13px;">${esc(a.name)}${a.company ? ` — ${esc(a.company)}` : ""} · <a href="mailto:${esc(a.email)}" style="color:#0D7A7A;">${esc(a.email)}</a></p>
    ${guidance}
    <table style="border-collapse:collapse;width:100%;border:1px solid #eee;border-radius:10px;overflow:hidden;">
      ${row("Name", a.name)}
      ${row("Email", a.email)}
      ${row("Company / brand", a.company)}
      ${row("Project type", a.projectType)}
      ${row("Readiness", a.readiness)}
      ${row("Goals", a.goals)}
      ${row("Vision notes", a.visionNotes)}
      ${row("Style", a.styles)}
      ${row("Has branding", a.hasBranding)}
      ${row("Brand colours", a.brandColors)}
      ${row("Reference sites", refs)}
      ${row("Pages", a.pages)}
      ${row("Features", a.features)}
      ${row("Structure notes", a.structureNotes)}
      ${row("Budget", a.budget)}
      ${row("Timeline", a.timeline)}
      ${row("Heard about us", a.hearAbout)}
      ${row("Attachments", fileNames)}
    </table>
    <p style="margin:20px 0 0;color:#999;font-size:12px;">Sent from the Norvo /start project-intake form. Reply directly to reach ${esc(a.name)}.</p>
  </div>`;
}

export async function submitBrief(formData: FormData): Promise<SubmitResult> {
  let a: Answers;
  try {
    a = JSON.parse(String(formData.get("payload") ?? "{}")) as Answers;
  } catch {
    return { ok: false, error: "Something went wrong reading your answers. Please try again." };
  }

  const name = (a.name || "").trim();
  const email = (a.email || "").trim();
  if (!name) return { ok: false, error: "Please add your name so we know who to reply to." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };

  // Collect file attachments (skip empties), enforce a total size cap.
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  let total = 0;
  const attachments: { filename: string; content: Buffer }[] = [];
  for (const f of files) {
    total += f.size;
    if (total > MAX_TOTAL_BYTES) {
      return {
        ok: false,
        error: "Your files add up to more than 8MB. Remove some, or paste a link to them in the notes instead.",
      };
    }
    attachments.push({ filename: f.name, content: Buffer.from(await f.arrayBuffer()) });
  }

  const subject = `New project brief — ${name}${a.company ? ` (${a.company})` : ""}`;
  const html = renderBriefHtml(a, files.map((f) => f.name));

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No provider wired yet — don't lose the lead; the client shows a mailto fallback.
    console.warn("[submitBrief] RESEND_API_KEY not set — brief not emailed.", {
      subject,
      answers: a,
      files: files.map((f) => f.name),
    });
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
      attachments: attachments.length ? attachments : undefined,
    });
    if (error) {
      console.error("[submitBrief] Resend error:", error);
      return { ok: false, error: "We couldn't send your brief just now. Please email us directly." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[submitBrief] send threw:", e);
    return { ok: false, error: "We couldn't send your brief just now. Please email us directly." };
  }
}
