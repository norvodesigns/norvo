# Prompt for Claude: Norvo Homepage — Implement Design Bible Specification

Copy this entire message into a new Claude window. Before pasting, read `PROMPT_HOMEPAGE_GAPS.md` in the project root so you understand what's currently built vs. what the spec demands.

---

## Context

You're working on **Norvo Designs**, a web design studio. The site is built in Next.js with React, Motion, and Tailwind. The vision is documented in a comprehensive **Experience Bible** (`docs/experience-bible/` — 19 files) that specifies exactly how the homepage should look, move, and feel.

**The core idea:** The homepage is a single continuous journey called **The Ascent** that travels through five eras of web history (Information → Pages → Software → Experiences → Places), ending in a luminous future architecture. It's not a normal marketing site; it's a proof-of-concept that a website can be an *environment*, not just pages.

**Current state:** The skeleton is in place (Intro Sequence, five eras, WebGL Time Warp), but the implementation falls short of the specification in **content depth, seam quality, color staging, and emotional pacing**. A detailed gap analysis has been written in `PROMPT_HOMEPAGE_GAPS.md` — read that first.

---

## Your Job

Fix the homepage to match the Experience Bible specification, **in this priority order:**

### Priority 1: Expand Era Content & The Observatory (HIGH IMPACT)

**Why:** Each era should feel like a real world the visitor travels through, not a styled text block. The Observatory is the climactic destination and should be substantial.

**What to do:**

1. **Era 1 (Documents)** — Expand to include:
   - The opening manifesto: "The web began as information." (from Intro, now continues)
   - A 3-4 sentence passage explaining "Information is the interface" — why this era matters
   - The brand statement "WE DESIGN THE FUTURE" (in plainest form, Graphite ink, Geist Mono)
   - Supporting line: "Shaping the next era of the web."
   - Real body text (150+ words) on information, clarity, restraint
   - The single violet forward spark at the natural reading conclusion
   - **Spec reference:** `docs/experience-bible/03-era-1-documents.md`

2. **Era 2 (Pages)** — Enhance to:
   - Richer 2-3 sentence content in each column (currently sparse)
   - Ensure the gold rule under the title is prominent (the "first precious touch")
   - The content should explain composition, structure, and how design arrives
   - **Spec reference:** `docs/experience-bible/04-era-2-pages.md`

3. **Era 3 (Interfaces)** — Add the impact stats (this is THE content of this era):
   - Show four stats: **50ms** (first impression), **75%** (credibility from design), **88%** (won't return after bad UX), **2×** (conversion lift)
   - Each stat in Observatory Gold (`#D8B46A`)
   - Stats should appear as animated/ticking values (short mechanical count, not slot-machine spin)
   - Arrange in a clean modular layout (panels/cards) that *feels* like an interface dashboard
   - Include explanatory text about what each stat means
   - Use Norvo Violet for active/signal elements
   - **Spec reference:** `docs/experience-bible/05-era-3-interfaces.md` & `docs/experience-bible/18-canon-glossary.md` (§18.1 for the actual stats)

4. **Era 4 (Experiences)** — Deepen the atmospheric content:
   - Add a substantial headline (this is where "the boldest scale contrast" lives)
   - Include supporting body text positioned at different depths (some near/large, some far/small)
   - Ensure violet and gold light effects (glows, halos, ambient light) are visible, not just parallax
   - The "distant structure gathering ahead" (the Observatory) should be visibly approaching as visitor scrolls
   - **Spec reference:** `docs/experience-bible/06-era-4-experiences.md`

5. **The Observatory (Places)** — This is the emotional destination (22% of the full journey):
   - Expand dramatically; currently it's undersized
   - Include the brand statement "WE DESIGN THE FUTURE" in **full glory** with Signature Gradient
   - Build it as real architecture: walls, light, materials, a sense of *inhabitable space*
   - The Spaceport beyond should be visible—a civilization-scale vista, proof the future is inhabited (lights, structures, sense of scale)
   - All four colors should coexist in calm balance (Graphite structure, Archive White light, Violet signal, Gold value)
   - Include the "Start a Project" CTA as the natural *emotional resolution* of the climb, not a sales button
   - Also include plainly accessible secondary CTAs (Contact, Projects) without them competing for focus
   - **Spec reference:** `docs/experience-bible/08-observatory.md` & `docs/experience-bible/09-spaceport.md`

---

### Priority 2: Implement Era-to-Era Seams (Shifts) (HIGH IMPACT, HIGH EFFORT)

**Why:** Transitions between eras should feel like *traveling into* the next world, not jumping screens. The bible calls this a "Shift"—a gradual, witnessed transformation.

**What to do:**

- Implement overlapping era transitions where the **incoming era begins to visibly morph the world before the outgoing era fully exits**
- As the visitor scrolls from Era 1 → Era 2:
  - Margins loosen gradually (tight single column → multi-column)
  - Archive White ground stays constant
  - Color blooms in (gold appears for the first time as a precious rule)
  - Typography shifts from "Typed Artifact" to "Composed Column"
  - A Graphite hairline rule may hint itself into place
- Era 2 → Era 3:
  - Layout becomes modular (grid of panels/cards)
  - Violet enters as signal (active states, focus)
  - Gold grows from "touch" to "accent"
  - The page begins to gain *elevation* (lightest shadow to separate panels)
- Era 3 → Era 4:
  - The plane itself gains *depth* — panels begin to layer front-to-back
  - Ground recedes, foreground glows with Archive White light
  - Violet and gold become *atmospheric light*, not just text/fill colors
  - Graphite becomes void/space, not just ink
- This requires keyframe architecture where era entry/exit overlaps (not currently the case)
- **Spec reference:** `docs/experience-bible/01-design-language.md` §1.3 (The Shift motion) & each era file's "Seam out" section

---

### Priority 3: Stage the Four-Color Evolution Correctly (MEDIUM IMPACT)

**Why:** The color arc is the visual spine of the journey. Colors must enter at earned moments, not all be present from the start.

**The correct arc:**
- **Era 1:** Graphite (ink) + Archive White (ground) only. Norvo Violet as single spark (1 living affordance). No gold.
- **Era 2:** Gold blooms in (the rule under the title is the "first precious touch"). Violet remains single spark.
- **Era 3:** Violet promoted to signal color (active controls, live values). Gold grows from touch to accent (impact stats).
- **Era 4:** Violet becomes ambient energy (glows, light leaks, atmospheric). Gold rises to co-lead (warm light). Signature Gradient emerges as living force.
- **Observatory:** All four in harmonious balance. Signature Gradient fully realized, reserved for brand statement and primary CTA.

**What to do:**
- Audit each era in the code; remove colors that shouldn't be visible yet
- Implement Bloom motion (from File 01 §1.3) at color-entry moments (not snap-on)
- The Signature Gradient (`linear-gradient(120deg, #6D5DFB, #D8B46A)`) should not appear until Observatory
- Verify: gold is truly absent in Era 1, violet is truly single-point in Eras 1-2, both are light/atmosphere in Era 4
- **Spec reference:** `docs/experience-bible/01-design-language.md` §1.2 (The Four-Color Evolution Arc)

---

### Priority 4: Verify & Polish Motion Vocabulary (MEDIUM IMPACT)

**Why:** The bible defines eight named motion behaviors. They should be used consistently and feel like their definitions.

**Specific checks:**
- **The Settle** (arrival, no bounce): Era 2 headings should rise into place and lock. Verify easing is ease-out, duration ~1 beat, no overshoot.
- **The Reveal** (content emerging): Type and content should fade up while easing into place. Should feel like "always been there, just now lit."
- **The Bloom** (color entering): Gold, violet, and Signature Gradient should bloom in (organic, decelerating), not snap on. Check `norvo-spark-bloom` keyframe — should be slow and organic.
- **The Pulse** (living signal): Violet spark, active controls, gradient shimmer should breathe at a slow ~2s cycle. Check CSS keyframes.
- **The Drift** (continuous travel): In Era 4, elements should glide forward as visitor advances, feeling weightless and breath-paced.
- **The Parallax** (depth differential): Nearer things move more, farther things move less. Era 4 is correct; verify the spring physics feel right.
- **The Warp** (climactic acceleration): Time Warp should accelerate → streaking gradient light → decelerate. **Critical:** deceleration should be at least 50% of total Warp time; visitor should arrive gently.
- **The Shift** (era-to-era morph): Continuous, witnessed, never a cut. This is where Priority 2 comes in.

**Spec reference:** `docs/experience-bible/01-design-language.md` §1.3 (The Motion Vocabulary)

---

### Priority 5: Verify Time Warp Deceleration & Observatory Arrival (MEDIUM IMPACT)

**Why:** The Warp is the single peak of the journey. If it lands harshly, the arrival feels wrong.

**What to check:**
- The acceleration phase should gather speed and rush with Signature Gradient light
- The **deceleration phase** (the critical part) should be long, smooth, and graceful—at least as long as acceleration
- By the end of deceleration, the visitor should be *inside* The Observatory (no jarring cut or pause)
- The final moments of the Warp should *be* the first moments of The Observatory—seamless handoff
- Sound layer (if implemented): sonic peak should crest at visual peak and resolve during deceleration
- Reduced-motion version should be a calm cross-dissolve (not skip the Warp)

**Spec reference:** `docs/experience-bible/07-time-warp.md` & `docs/experience-bible/17-pacing-emotional-journey.md` §17.3 (Beat 5)

---

### Priority 6: Audit Pacing Against Emotional Budget (MEDIUM IMPACT)

**Why:** The journey should feel like "two to three unhurried minutes" total. Each beat has an emotional target and a time budget.

**The budget (% of total journey):**
| Beat | % | Emotional Target |
|------|---|------------------|
| Threshold | ~5% | Stillness, curiosity |
| Era 1 — Documents | ~12% | Quiet, held breath |
| Era 2 — Pages | ~12% | First warmth, composure |
| Era 3 — Interfaces | ~13% | Quickening, capability |
| Era 4 — Experiences | ~20% | Immersion, rising awe |
| Time Warp | ~8% | Peak — tension → release |
| Observatory | ~22% | Arrival, resolution, warmth |
| Call to Act | ~8% | Payoff, open door |

**What to do:**
- Check `lib/timeline.ts` (BEATS object) — do the beat keyframes match these proportions?
- Does Era 4 feel *long* enough (20%) to build immersion?
- Does Observatory feel like a destination to *dwell in* (22%), not a transition?
- Does Documents feel deliberately still and brief (12%) — the held breath before climbing?
- **Spec reference:** `docs/experience-bible/17-pacing-emotional-journey.md` §17.2 (The Pacing Budget) & §17.3 (Beat-by-Beat Timeline)

---

### Priority 7: Implement Era 3 Ticking Values (LOWER PRIORITY)

**Why:** Impact stats should feel like live, updating numbers, not static text. This sells the idea that "the web can *do* things."

**What to do:**
- The four stats (50ms, 75%, 88%, 2×) should appear to tick/count up from 0 to their final value as they scroll into view
- Motion should be a short mechanical count (rapid but not frantic), not a slot-machine spin
- Use a lightweight counter animation (Framer Motion or CSS keyframes) 
- Each stat in Observatory Gold, arranged in a clean grid or card layout
- Supporting text explaining what each stat means

**Spec reference:** `docs/experience-bible/01-design-language.md` §1.1 (Era 3 type treatment, "values tick or roll when they update")

---

## What NOT to Change (Out of Scope)

- Don't refactor the scroll architecture unless absolutely necessary for Seam implementation
- Don't redesign the navigation; refine its current evolution across eras
- Don't add new pages or features; focus on deepening The Ascent itself
- Don't touch the Projects/Services/Contact/Start pages (they're walled off by design)
- Don't change the four colors themselves; only their staging and usage

---

## Files You'll Need

**Vision documents (in `docs/experience-bible/`):**
- `00-overview.md` — the thesis, brand identity, Usability Covenant
- `01-design-language.md` — motion vocabulary, colors, typography, spacing
- `02-intro-sequence.md` — the Threshold (already well-implemented)
- `03-era-1-documents.md` — Documents era spec
- `04-era-2-pages.md` — Pages era spec
- `05-era-3-interfaces.md` — Interfaces era spec
- `06-era-4-experiences.md` — Experiences era spec
- `07-time-warp.md` — Time Warp spec
- `08-observatory.md` — The Observatory spec
- `09-spaceport.md` — The Spaceport spec
- `17-pacing-emotional-journey.md` — pacing & emotional beats
- `18-canon-glossary.md` — naming canon and the four impact stats

**Implementation files (in the project):**
- `app/page.tsx` — homepage entry, scroll container, era composition
- `components/homepage/Era01.tsx`, `Era02.tsx`, `Era03.tsx`, `Era04.tsx` — era components (expand content here)
- `components/homepage/IntroOverlay.tsx` — Threshold (largely done)
- `components/homepage/TimeWarpCanvas.tsx`, `WarpOverlay.tsx` — Time Warp (verify deceleration)
- `components/homepage/EndState.tsx` — Observatory/destination (expand significantly)
- `components/homepage/HomepageNav.tsx` — persistent navigation
- `lib/timeline.ts` — BEATS keyframes (verify proportions)
- `app/globals.css` — motion keyframes, color definitions

---

## How to Approach This

1. **Read first.** Before writing code, read the experience-bible files for the eras you're working on. Understand the emotional tone, the content, and the motion vocabulary.
2. **Start with content.** Expand Era 1–4 copy and The Observatory narrative. Don't perfect the styling yet; get the words right.
3. **Then motion.** Ensure each element uses the correct named motion (Settle, Reveal, Bloom, etc.) with the right easing and duration.
4. **Then color staging.** Audit which colors are visible in which eras; implement Bloom for color entry.
5. **Then seams.** Implement overlapping era transitions (this is the hardest part).
6. **Finally, polish.** Verify pacing, reduced-motion fallbacks, keyboard nav, mobile re-choreography.

---

## Success Criteria

When done, the homepage should:
- [ ] Feel like a continuous journey through five distinct worlds, not a scrolling list of sections
- [ ] Each era should have substantive, meaningful content that tells the story
- [ ] The Observatory should feel like a real destination, not a transition
- [ ] Color should bloom in at earned moments (gold in Era 2, violet amplifying in Era 3, both becoming light in Era 4)
- [ ] Transitions between eras should be gradual morphs, not jumps
- [ ] The Time Warp should accelerate and decelerate gracefully, landing the visitor gently in The Observatory
- [ ] Every motion should map to a named behavior (Settle, Reveal, Bloom, etc.) from the Motion Vocabulary
- [ ] The journey should feel like "two to three unhurried minutes" with proper pacing budget respected
- [ ] All five covenant questions (Where am I? How do I navigate? How do I contact? How do I start a project? How do I view work?) answerable from any screen
- [ ] Reduced-motion users see graceful fallbacks (cross-fades, steady elements) with meaning intact

---

## Need Help?

If you get stuck:
- Reference the specific era file (e.g., `05-era-3-interfaces.md` for interfaces questions)
- Check File 01 for motion vocabulary definitions
- Check File 17 for pacing and emotional guidance
- Check File 18 for naming and stats

Good luck. This is ambitious, but the bible is precise enough that you have everything you need.
