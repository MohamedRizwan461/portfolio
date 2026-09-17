/**
 * The About story as short, readable lines, shared by every story prototype.
 * Same facts as lib/journey.ts, cut into sentences a visitor will actually read.
 */
export type StoryMedia = { kind: "image" | "video"; src: string; poster?: string; w: number; h: number; alt: string; position?: string };

export type Beat = {
  id: string;
  n: string;
  label: string;
  years: string;
  /** the visitor's question, for the chat version */
  ask: string;
  lines: string[];
  media?: StoryMedia;
  badge?: string;
  link?: { label: string; href: string };
};

export const beats: Beat[] = [
  {
    id: "biology",
    n: "01",
    label: "Biology",
    years: "Before engineering",
    ask: "Where did it all start?",
    lines: [
      "Before any engineering, it was biology.",
      "How a body moves. What fails when it stops moving.",
      "And what that costs a person.",
      "That question never left. Almost everything I have built since attaches to a human being.",
    ],
    media: { kind: "image", src: "/video/face-holo.webp", w: 520, h: 292, alt: "A particle face rendered in Maya" },
  },
  {
    id: "electronics",
    n: "02",
    label: "Electronics",
    years: "2019 to 2023",
    ask: "So why electronics?",
    lines: [
      "I wanted to study mechatronics. That path was not open to me in India.",
      "So I took Electrical and Electronics Engineering at KCG College of Technology, Chennai.",
      "The degree gave me circuits, power and control. The projects were where I added the machines.",
    ],
    media: { kind: "image", src: "/images/knee/control-schematic.png", w: 885, h: 508, alt: "Control board schematic from the knee actuator" },
    badge: "BE EEE",
  },
  {
    id: "assistive",
    n: "03",
    label: "Assistive robotics",
    years: "2021 to 2023",
    ask: "What did you build?",
    lines: [
      "Almost every project I built became an assistive device.",
      "A soft robotic glove for stroke rehabilitation, with a 12-member team I led.",
      "A pneumatic knee exoskeleton that fires when the knee needs it.",
      "Camera glasses that speak sign language aloud.",
      "The knee, the eyewear and a sensor network platform became three Indian patent applications.",
    ],
    media: {
      kind: "video",
      src: "/video/knee-actuator-working.mp4",
      poster: "/video/knee-actuator-working-poster.jpg",
      w: 680,
      h: 1080,
      position: "60% 50%",
      alt: "The knee actuator running on the bench",
    },
    badge: "3 patents filed",
    link: { label: "Knee actuator case study", href: "/projects/smart-knee-actuator" },
  },
  {
    id: "recognition",
    n: "04",
    label: "Recognition",
    years: "2022 to 2023",
    ask: "Did it go anywhere?",
    lines: [
      "The knee actuator started at Smart India Hackathon.",
      "Team Robusta won IIT PALS at IIT Madras.",
      "We won the preliminary round of IEEE YESIST12.",
      "Then the international Grand Finale in Egypt, as finalists.",
    ],
    media: { kind: "image", src: "/images/certs/yesist12-finalist.jpg", w: 1400, h: 992, alt: "IEEE YESIST12 Finalist certificate, Egypt" },
    badge: "YESIST12 Finalist",
  },
  {
    id: "pivot",
    n: "05",
    label: "Computer science",
    years: "2023 to 2026",
    ask: "Why computer science?",
    lines: [
      "I came to the US for a master's in electrical and electronics engineering.",
      "Financial constraints meant I had to switch. I finished in computer science at Governors State University.",
      "I did not give the robots up for it.",
      "I built a mobile robot, then taught it to avoid obstacles with Q-learning on the microcontroller.",
    ],
    media: { kind: "video", src: "/video/robot-goal-run.mp4", poster: "/video/robot-goal-run-poster.jpg", w: 848, h: 480, alt: "The robot finding its way to the goal marker" },
    badge: "MS CS 2026",
    link: { label: "Mobile robot case study", href: "/projects/autonomous-mobile-robot" },
  },
  {
    id: "vehicles",
    n: "06",
    label: "Autonomous vehicles",
    years: "2023 to 2026",
    ask: "And now?",
    lines: [
      "Then vehicles got my attention. The same problem, scaled up.",
      "A machine reading the world in real time, where being late or wrong has a physical cost.",
      "I analyzed Tesla collision warning and emergency braking against crash-test data.",
      "Now I am building a CAN gear controller on STM32 and FreeRTOS.",
    ],
    media: { kind: "image", src: "/images/certs/build-fellowship.jpg", w: 1210, h: 680, alt: "The Build Fellowship certificate" },
    badge: "Build Fellowship",
    link: { label: "CAN gear controller", href: "/projects/can-gear-controller" },
  },
  {
    id: "next",
    n: "07",
    label: "What's next",
    years: "Now",
    ask: "What are you looking for?",
    lines: [
      "Industry experience, on a team building real machines.",
      "Somewhere I can be useful from the first week and learn from engineers further along than me.",
      "Chicago, and open to relocation.",
    ],
    link: { label: "Get in touch", href: "/contact" },
  },
];

/** every line in order, with its beat, for anything that plays the story end to end */
export const storyLines = beats.flatMap((b, bi) => b.lines.map((text, li) => ({ text, beat: b, bi, li, last: li === b.lines.length - 1 })));
