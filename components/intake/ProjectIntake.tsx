"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { submitBrief, type SubmitResult } from "@/app/start/actions";
import SubmitSuccess from "@/components/SubmitSuccess";
import Button from "@/components/Button";
import {
  type Answers,
  emptyAnswers,
  PROJECT_TYPES,
  READINESS,
  GOALS,
  STYLES,
  BRANDING,
  PAGES,
  FEATURES,
  BUDGETS,
  TIMELINES,
} from "./types";
import { Chip, GuidanceChip } from "./Chip";
import { FileDrop } from "./FileDrop";
import { ProgressBar } from "./ProgressBar";

const STORAGE_KEY = "norvo_brief_v1";
const STEPS = ["Project", "Vision", "Style", "Structure", "Budget", "Review"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls =
  "w-full rounded-lg border border-black/15 px-4 py-3 text-sm outline-none transition focus:border-[#0D7A7A] focus:ring-2 focus:ring-[#0D7A7A]/20";
const ease = [0.22, 1, 0.36, 1] as const;

export default function ProjectIntake() {
  const reduce = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(0);
  const [customPage, setCustomPage] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  // Restore a saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAnswers({ ...emptyAnswers(), ...JSON.parse(saved) });
    } catch {
      /* ignore corrupt drafts */
    }
    setHydrated(true);
  }, []);

  // Autosave (files are not persisted — they can't be serialised)
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers, hydrated]);

  // ── state helpers ──────────────────────────────────────────────
  const set = (k: keyof Answers, v: Answers[keyof Answers]) =>
    setAnswers((a) => ({ ...a, [k]: v }) as Answers);
  const toggle = (k: keyof Answers, val: string) =>
    setAnswers((a) => {
      const arr = a[k] as string[];
      return {
        ...a,
        [k]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      } as Answers;
    });
  const pickOne = (k: keyof Answers, val: string) =>
    setAnswers((a) => {
      const arr = a[k] as string[];
      return { ...a, [k]: arr.includes(val) ? [] : [val] } as Answers;
    });
  const single = (k: keyof Answers, val: string) =>
    setAnswers((a) => ({ ...a, [k]: (a[k] as string) === val ? "" : val }) as Answers);
  const toggleGuidance = (area: string) =>
    setAnswers((a) => ({
      ...a,
      needsGuidance: a.needsGuidance.includes(area)
        ? a.needsGuidance.filter((x) => x !== area)
        : [...a.needsGuidance, area],
    }));

  const addCustomPage = () => {
    const p = customPage.trim();
    if (p && !answers.pages.includes(p)) set("pages", [...answers.pages, p]);
    setCustomPage("");
  };

  const canAdvance =
    step !== 0 ||
    (answers.name.trim() !== "" &&
      EMAIL_RE.test(answers.email) &&
      answers.projectType.length > 0);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  function submit() {
    const fd = new FormData();
    fd.append("payload", JSON.stringify(answers));
    files.forEach((f) => fd.append("files", f));
    startTransition(async () => {
      const res = await submitBrief(fd);
      setResult(res);
      if (res.ok) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setDone(true);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
    });
  }

  function buildMailto() {
    const L = (label: string, v: string | string[]) => {
      const val = Array.isArray(v) ? v.filter(Boolean).join(", ") : v;
      return val ? `${label}: ${val}` : "";
    };
    const lines = [
      L("Name", answers.name),
      L("Email", answers.email),
      L("Company", answers.company),
      L("Project type", answers.projectType),
      L("Readiness", answers.readiness),
      L("Goals", answers.goals),
      L("Vision", answers.visionNotes),
      L("Style", answers.styles),
      L("Branding", answers.hasBranding),
      L("Brand colours", answers.brandColors),
      L("References", answers.references),
      L("Pages", answers.pages),
      L("Features", answers.features),
      L("Structure", answers.structureNotes),
      L("Budget", answers.budget),
      L("Timeline", answers.timeline),
      L("Wants guidance on", answers.needsGuidance),
    ].filter(Boolean);
    const body =
      lines.join("\n") +
      (files.length ? `\n\n(I also have ${files.length} file(s) to share.)` : "");
    return `mailto:norvodesigns@gmail.com?subject=${encodeURIComponent(
      `Project brief — ${answers.name || "new enquiry"}`,
    )}&body=${encodeURIComponent(body)}`;
  }

  // ── success screen ─────────────────────────────────────────────
  if (done) {
    return (
      <SubmitSuccess
        heading="Brief received — thank you."
        body={
          <>
            We&apos;ll read through everything and get back to you at{" "}
            <span className="text-black/80">{answers.email}</span> within 1–2 business days with
            next steps.
          </>
        }
      />
    );
  }

  if (!hydrated) return <div className="h-64" />;

  // ── chip group helper ──────────────────────────────────────────
  const group = (
    options: string[],
    selected: string[],
    onPick: (v: string) => void,
  ) => (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => (
        <Chip key={o} label={o} selected={selected.includes(o)} onClick={() => onPick(o)} />
      ))}
    </div>
  );

  const label = (t: string, hint?: string) => (
    <div className="mb-3">
      <p className="text-sm font-medium text-black/80">{t}</p>
      {hint && <p className="mt-0.5 text-xs text-black/40">{hint}</p>}
    </div>
  );

  // ── step content ───────────────────────────────────────────────
  const steps: React.ReactNode[] = [
    // 0 — Project
    <div key="s0" className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          {label("Your name *")}
          <input
            className={inputCls}
            value={answers.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          {label("Email *")}
          <input
            className={inputCls}
            type="email"
            value={answers.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@company.com"
          />
        </div>
      </div>
      <div>
        {label("Company or brand name", "Optional")}
        <input
          className={inputCls}
          value={answers.company}
          onChange={(e) => set("company", e.target.value)}
          placeholder="Acme Studio"
        />
      </div>
      <div>
        {label("What kind of project is this? *")}
        {group(PROJECT_TYPES, answers.projectType, (v) => pickOne("projectType", v))}
      </div>
      <div>
        {label("Where are you in the process?", "No pressure — this just helps us pace things")}
        {group(READINESS, answers.readiness ? [answers.readiness] : [], (v) =>
          single("readiness", v),
        )}
      </div>
    </div>,

    // 1 — Vision
    <div key="s1" className="space-y-8">
      <div>
        {label("What should this site do for you?", "Pick any that apply")}
        {group(GOALS, answers.goals, (v) => toggle("goals", v))}
        <div className="mt-3">
          <GuidanceChip
            selected={answers.needsGuidance.includes("goals")}
            onClick={() => toggleGuidance("goals")}
          />
        </div>
      </div>
      <div>
        {label("Anything you'd add about the vision?", "Optional — as much or as little as you like")}
        <textarea
          className={`${inputCls} min-h-28`}
          value={answers.visionNotes}
          onChange={(e) => set("visionNotes", e.target.value)}
          placeholder="What are you hoping for? Who is it for? What does success look like?"
        />
      </div>
    </div>,

    // 2 — Style & branding
    <div key="s2" className="space-y-8">
      <div>
        {label("Pick a few words for the vibe", "Optional")}
        {group(STYLES, answers.styles, (v) => toggle("styles", v))}
        <div className="mt-3">
          <GuidanceChip
            selected={answers.needsGuidance.includes("style")}
            onClick={() => toggleGuidance("style")}
          />
        </div>
      </div>
      <div>
        {label("Do you already have branding?")}
        {group(BRANDING, answers.hasBranding ? [answers.hasBranding] : [], (v) =>
          single("hasBranding", v),
        )}
      </div>
      <div>
        {label("Upload brand files or inspiration", "Logo, brand guide, screenshots — anything helpful")}
        <FileDrop files={files} onChange={setFiles} />
      </div>
      <div>
        {label("Any colours in mind?", "Optional")}
        <input
          className={inputCls}
          value={answers.brandColors}
          onChange={(e) => set("brandColors", e.target.value)}
          placeholder="e.g. deep teal & warm gold, or 'not sure yet'"
        />
      </div>
      <div>
        {label("Sites you like", "Optional — paste links for reference")}
        <div className="space-y-2">
          {answers.references.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={inputCls}
                value={r}
                onChange={(e) => {
                  const refs = [...answers.references];
                  refs[i] = e.target.value;
                  set("references", refs);
                }}
                placeholder="https://example.com"
              />
              {answers.references.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "references",
                      answers.references.filter((_, idx) => idx !== i),
                    )
                  }
                  className="shrink-0 rounded-lg border border-black/15 px-3 text-black/40 hover:text-black"
                  aria-label="Remove link"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("references", [...answers.references, ""])}
            className="text-sm text-[#0D7A7A] hover:underline"
          >
            + Add another
          </button>
        </div>
      </div>
    </div>,

    // 3 — Structure & pages
    <div key="s3" className="space-y-8">
      <div>
        {label("Which pages do you need?", "Pick any — or let us recommend")}
        {group(PAGES, answers.pages, (v) => toggle("pages", v))}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            className={`${inputCls} max-w-xs`}
            value={customPage}
            onChange={(e) => setCustomPage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomPage();
              }
            }}
            placeholder="Add a custom page…"
          />
          <button
            type="button"
            onClick={addCustomPage}
            className="rounded-full border border-black/15 px-4 py-2 text-sm text-black/65 hover:border-[#0D7A7A]"
          >
            Add
          </button>
        </div>
        <div className="mt-3">
          <GuidanceChip
            selected={answers.needsGuidance.includes("pages")}
            onClick={() => toggleGuidance("pages")}
          />
        </div>
      </div>
      <div>
        {label("Any features or functionality?", "Optional")}
        {group(FEATURES, answers.features, (v) => toggle("features", v))}
      </div>
      <div>
        {label("Structure or content notes", "Optional — sitemap ideas, must-haves, anything specific")}
        <textarea
          className={`${inputCls} min-h-28`}
          value={answers.structureNotes}
          onChange={(e) => set("structureNotes", e.target.value)}
          placeholder="e.g. Home → Services → 3 case studies → Contact. Needs a blog later."
        />
      </div>
    </div>,

    // 4 — Budget & timeline
    <div key="s4" className="space-y-8">
      <div>
        {label("Rough budget", "Ballpark is fine — it helps us scope honestly")}
        {group(BUDGETS, answers.budget ? [answers.budget] : [], (v) => {
          single("budget", v);
          if (v === "Not sure / need guidance" && !answers.needsGuidance.includes("budget"))
            toggleGuidance("budget");
        })}
      </div>
      <div>
        {label("Timeline")}
        {group(TIMELINES, answers.timeline ? [answers.timeline] : [], (v) =>
          single("timeline", v),
        )}
      </div>
      <div>
        {label("How did you hear about us?", "Optional")}
        <input
          className={inputCls}
          value={answers.hearAbout}
          onChange={(e) => set("hearAbout", e.target.value)}
          placeholder="Instagram, a friend, search…"
        />
      </div>
    </div>,

    // 5 — Review
    <ReviewStep
      key="s5"
      answers={answers}
      files={files}
      onEdit={(s) => setStep(s)}
    />,
  ];

  return (
    <div>
      <ProgressBar step={step} total={STEPS.length} labels={STEPS} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>

      {/* Submission error + mailto fallback */}
      {result && !result.ok && (
        <div className="mt-6 rounded-xl border border-[#D9A441] bg-[#FBF3DF] p-4 text-sm text-[#7a5b12]">
          {result.code === "NO_EMAIL_CONFIGURED"
            ? "The form isn't fully connected yet — but your brief isn't lost."
            : result.error}{" "}
          <a href={buildMailto()} className="font-medium underline">
            Email it to us instead →
          </a>
        </div>
      )}

      {/* Nav */}
      <div className="mt-10 flex items-center justify-between border-t border-black/5 pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full px-5 py-3 text-sm text-black/55 transition hover:text-black disabled:opacity-30"
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={next}
                className="rounded-full px-4 py-3 text-sm text-black/45 hover:text-black/70"
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance}
              className="rounded-full px-6 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "linear-gradient(120deg,#0D7A7A,#D9A441)" }}
            >
              Continue →
            </button>
          </div>
        ) : (
          <Button onClick={submit} disabled={pending} noTilt>
            {pending ? "Sending…" : "Send my brief"}
          </Button>
        )}
      </div>

      {step === 0 && !canAdvance && (
        <p className="mt-3 text-right text-xs text-black/35">
          Name, email and project type to continue — the rest is optional.
        </p>
      )}
    </div>
  );
}

// ── Review step ──────────────────────────────────────────────────
function ReviewStep({
  answers,
  files,
  onEdit,
}: {
  answers: Answers;
  files: File[];
  onEdit: (step: number) => void;
}) {
  const fmt = (v: string | string[]) =>
    Array.isArray(v) ? v.filter(Boolean).join(", ") : v;

  const sections: { step: number; title: string; rows: [string, string][] }[] = [
    {
      step: 0,
      title: "Project",
      rows: [
        ["Name", answers.name],
        ["Email", answers.email],
        ["Company", answers.company],
        ["Type", fmt(answers.projectType)],
        ["Readiness", answers.readiness],
      ],
    },
    {
      step: 1,
      title: "Vision",
      rows: [
        ["Goals", fmt(answers.goals)],
        ["Notes", answers.visionNotes],
      ],
    },
    {
      step: 2,
      title: "Style & branding",
      rows: [
        ["Style", fmt(answers.styles)],
        ["Branding", answers.hasBranding],
        ["Colours", answers.brandColors],
        ["References", fmt(answers.references)],
        ["Files", files.map((f) => f.name).join(", ")],
      ],
    },
    {
      step: 3,
      title: "Structure",
      rows: [
        ["Pages", fmt(answers.pages)],
        ["Features", fmt(answers.features)],
        ["Notes", answers.structureNotes],
      ],
    },
    {
      step: 4,
      title: "Budget & timeline",
      rows: [
        ["Budget", answers.budget],
        ["Timeline", answers.timeline],
        ["Heard via", answers.hearAbout],
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-black/55">
        Quick look before you send — tap <span className="text-[#0D7A7A]">Edit</span> on anything
        to change it.
      </p>
      {answers.needsGuidance.length > 0 && (
        <div className="rounded-xl border border-[#D9A441]/60 bg-[#FBF3DF] px-4 py-3 text-sm text-[#7a5b12]">
          We'll guide you on: {answers.needsGuidance.join(", ")}.
        </div>
      )}
      {sections.map((sec) => {
        const rows = sec.rows.filter(([, v]) => v && v.trim());
        return (
          <div key={sec.step} className="rounded-xl border border-black/10 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-black/80">{sec.title}</h3>
              <button
                type="button"
                onClick={() => onEdit(sec.step)}
                className="text-xs text-[#0D7A7A] hover:underline"
              >
                Edit
              </button>
            </div>
            {rows.length === 0 ? (
              <p className="text-sm text-black/35">— skipped —</p>
            ) : (
              <dl className="space-y-1.5">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-sm">
                    <dt className="w-28 shrink-0 text-black/40">{k}</dt>
                    <dd className="text-black/75">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        );
      })}
    </div>
  );
}
