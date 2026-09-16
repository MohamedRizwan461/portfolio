# Mohamed Rizwan Ameer John — Portfolio

Personal portfolio of a robotics and embedded systems engineer.

**Live:** 

The home page is an interactive 3D circuit board: a data bus runs through time, each chip is a project on the part it actually ran on (RP2040, BCM2711, ESP8266, STM32F4, ATmega), and a small robot drives along the copper traces to whichever chip you click.

## Stack

- Next.js 16 (App Router, static generation) and TypeScript
- Tailwind CSS v4
- three.js with React Three Fiber and drei for the board scene
- Motion for UI animation, with `prefers-reduced-motion` respected throughout

## Pages

| Route | What it is |
|---|---|
| `/` | Interactive PCB and robot |
| `/tour` | Seven-screen guided tour |
| `/about` | The story, one chapter per window |
| `/projects` | All projects, each with a full case study |
| `/resume` | Resume viewer and download |
| `/contact` | Email, LinkedIn, GitHub |

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```
