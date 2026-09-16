---
name: Riz portfolio, Component Datasheet
description: Personal portfolio for a robotics and embedded engineer, documented like an IC datasheet.
colors:
  ground: "#F7F7F5"
  panel: "#EFEFEC"
  ink: "#111416"
  ink-2: "#474D52"
  rule: "#D5D7D3"
  accent: "#0A5BD3"
  accent-soft: "#E3ECFA"
typography:
  sans: Geist
  mono: Geist Mono
rounded:
  none: 0
---

# Design

## Overview

The site reads like a component datasheet: caps section headings on a heavy 2px rule, characteristics tables, numbered figures with captions, and a single blue accent. It is built for hiring managers who scan and engineers who verify.

## Colors

Restrained strategy: warm-neutral ground, near-black ink, hairline rules and one accent (`#0A5BD3`) used for primary buttons, links, active nav, hover rows and the CAN checksum/counter bytes. Dark mode (prefers-color-scheme) swaps to ground `#101315`, ink `#E9EBE8`, accent `#5B9CFF`. Tokens live in `app/globals.css` as CSS variables mapped into Tailwind v4 `@theme`.

## Typography

Geist for all prose and headings (h1 up to 60px, tracking -0.03em). Geist Mono only for data: part designation, dates, values, units, patent numbers, stack lists, figure numbers. Tabular numerals on data.

## Layout

`max-w-6xl` container, 16px mobile gutter, 32px from `sm`. Home hero is a 7/5 split; case studies are 7/5 with narrative left and characteristics + figures right, collapsing to one column under `lg`.

## Components

- Section head (`.ds-head`): caps 13px label on a 2px ink rule. This is the heading itself, never an eyebrow above another heading.
- Spec table: Parameter / Value, 1px row rules, mono values, accent-soft row hover.
- Figure: 1px ruled frame, image on white, caption `Fig. n` in mono.
- Buttons: sharp 44px tall; primary solid accent, secondary 1px ink outline. One label per intent: View projects, Download resume, Get in touch.
- CAN frame byte map: 8-cell grid, bytes 6-7 (counter, checksum) in accent, from `src/can_protocol.c`.

## Do's and Don'ts

- Do keep radius 0, no shadows, no gradients anywhere.
- Do tie every number to the resume or a repo.
- Don't use mono as decoration for prose.
- Don't add a second accent color.

## Image provenance

All rasters are Riz's own project figures, copied unmodified from his public GitHub write-ups (github.com/MohamedRizwan461):

| Shipping file | Source |
|---|---|
| public/images/knee/cad-assembly.jpg | smart-knee-actuator/images/fig_3_1.jpeg |
| public/images/knee/cad-side.jpg | smart-knee-actuator/images/fig_3_2.jpeg |
| public/images/knee/control-schematic.png | smart-knee-actuator/images/fig_5_1.png |
| public/images/knee/fea-displacement.jpg | smart-knee-actuator/images/fig_7_1.jpeg |
| public/images/eyewear/render.jpg | sign-language-eyewear/images/fig_11_1.jpeg |
| public/images/eyewear/system-concept.jpg | sign-language-eyewear/images/fig_4_1.jpeg |
| public/images/eyewear/inference-pipeline.jpg | sign-language-eyewear/images/fig_5_1.jpeg |
| public/images/eyewear/schematic.jpg | sign-language-eyewear/images/fig_7_1.jpeg |
| public/images/amr/robot.jpg | autonomous-mobile-robot/images/fig_9_1.jpeg |
| public/images/amr/wiring.jpg | autonomous-mobile-robot/images/fig_10_1.jpeg |
| public/images/amr/rewards-per-episode.png | autonomous-mobile-robot/images/fig_17_1.png |
| public/images/amr/test-run.jpg | autonomous-mobile-robot/images/fig_19_1.jpeg |
| public/images/rfid/wsn-architecture.jpg | rfid-iot-attendance-system/images/fig_1_2.jpeg |
| public/images/rfid/dashboard.png | rfid-iot-attendance-system/images/fig_1_3.png |
| public/resume/page-1.png, page-2.png | Rendered at 144 dpi from MohamedRizwan_Master_ATS_Resume_2026.pdf |
| app/opengraph-image.tsx | Generated at build from text, no raster source |

## Motion (story edition)

Motion library: `motion/react`. Every animation is motivated and every one collapses under `prefers-reduced-motion`, verified in a reduced-motion pass (nothing hidden).

- The path is a wire. On About, a vertical trace draws itself from scroll progress (`useScroll` + `useSpring`); on the home strip it draws once on entry. Two signal dots travel the wire on a loop, the way a pulse would.
- Chapter nodes are squares on that wire. They fill with accent as their chapter enters view, so position on the wire equals progress through the story.
- Chapters fade and lift once (`useInView`, once), images scale in slightly behind them, fact rows stagger at 80 ms.
- Home hero enters once; the patent count counts up; project cards lift 4px on hover.
- No scroll hijacking, no pinned sections, no parallax, no infinite decorative loops apart from the two signal dots.

## Media provenance (story edition)

Footage and photographs are Riz's own, from `Desktop\projects & certi`:

| Shipping file | Source |
|---|---|
| public/video/knee-actuator-working.mp4 | Smart knee Actuator working.mp4 (11 s, 1080x1080) |
| public/video/robot-rl-demo.mp4 | AV RL Demo.mp4 (31 s, 480x848) |
| public/video/robot-goal-run.mp4 | AV demo 1.mp4 (14 s, 848x480) |
| public/video/*-poster.jpg | Frames taken from each clip |
| public/images/eyewear/worn-prototype.jpg | Smart Eyewear 4.jpeg |
| public/images/eyewear/pi-pipeline.jpg | Smart Eyewear 6.jpeg |
| public/images/eyewear/hand-landmarks.jpg | Smart Eyewear 5.jpeg (260x194, small) |

Videos autoplay muted and loop, carry controls, and hold on the poster frame under reduced motion.
