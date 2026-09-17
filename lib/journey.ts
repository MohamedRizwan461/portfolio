export type ChapterMedia = {
  kind: "image" | "video" | "robot";
  /** where to anchor a crop, for footage with bars baked in */
  position?: string;
  src: string;
  poster?: string;
  width?: number;
  height?: number;
  alt: string;
  caption: string;
  /** "contain" for documents and diagrams, "cover" for photos and footage */
  fit?: "contain" | "cover";
};

export type Chapter = {
  id: string;
  years: string;
  domain: string;
  title: string;
  body: string[];
  media: ChapterMedia;
  extra?: ChapterMedia;
  facts?: { k: string; v: string }[];
  link?: { label: string; href: string };
};

/** The arc, in Riz's own order: biology, then electronics, then both at once. */
export const chapters: Chapter[] = [
  {
    id: "biology",
    years: "Before engineering",
    domain: "My journey",
    title: "It started with biology",
    body: [
      "Before any of the engineering, the subject that held me was biology. How a body moves, what fails when it stops moving, and what it costs a person when it does.",
      "That question never left. Almost everything I have built since attaches to a human being.",
    ],
    media: {
      kind: "image",
      src: "/video/face-holo.webp",
      width: 520,
      height: 292,
      alt: "Particle hologram of a human face, rendered in Maya",
      caption: "A particle face I rendered in Maya. The human body is still the most interesting machine I know.",
      fit: "cover",
    },
  },
  {
    id: "detour",
    years: "2019 to 2023",
    domain: "Electronics",
    title: "Mechatronics was the plan. Electronics was the door",
    body: [
      "I wanted to study mechatronics. That path was not open to me in India, so I took Electrical and Electronics Engineering at KCG College of Technology in Chennai as my base.",
      "The degree gave me circuits, power and control. The projects were where I added the machines.",
    ],
    media: {
      kind: "image",
      src: "/images/knee/control-schematic.png",
      width: 885,
      height: 508,
      alt: "Control electronics schematic for the knee actuator",
      caption: "Control board schematic from my bachelor's: where circuits started driving machines.",
      fit: "contain",
    },
    facts: [
      { k: "Degree", v: "BE Electrical and Electronics" },
      { k: "Where", v: "KCG College of Technology, Chennai" },
    ],
  },
  {
    id: "assistive",
    years: "2021 to 2023",
    domain: "Assistive robotics",
    title: "So I built the mechatronics anyway, for patients",
    body: [
      "Biology and electronics turned out to be one subject. Almost every project in my bachelor's was an assistive device: a soft robotic glove for stroke rehabilitation with a 12-member team I led, a pneumatic knee exoskeleton, and camera glasses that speak sign language aloud.",
      "The knee actuator and the eyewear became Indian patent applications, as did a wireless sensor network platform I co-invented.",
    ],
    media: {
      kind: "video",
      src: "/video/knee-actuator-working.mp4",
      poster: "/video/knee-actuator-working-poster.jpg",
      // the clip is portrait footage inside a square file: show only the footage
      width: 680,
      height: 1080,
      position: "60% 50%",
      alt: "The knee actuator running on a leg",
      caption: "The knee actuator running on the bench.",
      fit: "cover",
    },
    extra: {
      kind: "image",
      src: "/images/eyewear/worn-prototype.jpg",
      width: 1600,
      height: 720,
      alt: "The sign language eyewear prototype, worn",
      caption: "The eyewear prototype, worn.",
      fit: "cover",
    },
    facts: [
      { k: "Patents filed", v: "3" },
      { k: "Team led", v: "12 people" },
    ],
    link: { label: "The knee actuator case study", href: "/projects/smart-knee-actuator" },
  },
  {
    id: "recognition",
    years: "2022 to 2023",
    domain: "Recognition",
    title: "The work travelled further than I did",
    body: [
      "The knee actuator started at Smart India Hackathon. From there Team Robusta won the IIT PALS competition at IIT Madras, won the preliminary round of IEEE YESIST12, and went on to the international Grand Finale in Egypt as finalists.",
    ],
    media: {
      kind: "image",
      src: "/images/certs/yesist12-finalist.jpg",
      width: 1400,
      height: 992,
      alt: "IEEE YESIST12 certificate: Finalist, Grand Finale Maker Fair Track, Egypt, September 2023",
      caption: "IEEE YESIST12 Grand Finale, Maker Fair Track, Egypt.",
      fit: "contain",
    },
    extra: {
      kind: "image",
      src: "/images/certs/yesist12-prelims.jpg",
      width: 1315,
      height: 930,
      alt: "IEEE YESIST12 certificate of achievement for winning the preliminary round, March 2023",
      caption: "YESIST12 preliminary round, won.",
      fit: "contain",
    },
    facts: [
      { k: "IEEE YESIST12", v: "International Finalist, Egypt, Sep 2023" },
      { k: "YESIST12 prelims", v: "Won, SSN College, Mar 2023" },
      { k: "IIT PALS", v: "Winner, IIT Madras, Oct 2022" },
      { k: "Smart India Hackathon", v: "Smart Knee Actuator, 2022" },
    ],
  },
  {
    id: "pivot",
    years: "2023 to 2026",
    domain: "Computer science",
    title: "The degree changed. The direction did not",
    body: [
      "I came to the US for a master's in electrical and electronics engineering. Financial constraints meant I had to switch, and I finished in computer science at Governors State University instead.",
      "I did not give the robots up for it. I built a mobile robot, then taught it to avoid obstacles with Q-learning running on the microcontroller.",
    ],
    media: {
      kind: "video",
      src: "/video/robot-goal-run.mp4",
      width: 848,
      height: 480,
      poster: "/video/robot-goal-run-poster.jpg",
      alt: "The robot navigating around a bottle to a goal marker",
      caption: "My robot finding its way to the goal marker.",
      fit: "cover",
    },
    facts: [
      { k: "Degree", v: "MS Computer Science, 2026" },
      { k: "Hardware trials", v: "100+" },
    ],
    link: { label: "The robot case study", href: "/projects/autonomous-mobile-robot" },
  },
  {
    id: "av",
    years: "2023 to 2026",
    domain: "Autonomous vehicles",
    title: "Then the vehicles got my attention",
    body: [
      "In the US my interest moved to autonomous vehicles: the same problem I started with, scaled up. A machine reading the world in real time, where being late or wrong has a physical cost.",
      "I studied adaptive cruise control, analyzed Tesla collision warning and emergency braking against crash-test data, and now I am building a CAN gear controller on STM32 and FreeRTOS.",
    ],
    media: {
      kind: "image",
      src: "/images/certs/build-fellowship.jpg",
      width: 1210,
      height: 680,
      alt: "The Build Fellowship certificate: performance analysis of Tesla's advanced safety features, May 2025",
      caption: "The Build Fellowship: performance analysis of Tesla's advanced safety features.",
      fit: "contain",
    },
    extra: {
      kind: "image",
      src: "/images/certs/skilllync-acc-cacc.jpg",
      width: 1400,
      height: 990,
      alt: "Skill-Lync workshop certificate: longitudinal control, ACC and CACC, December 2023",
      caption: "Skill-Lync workshop: longitudinal control, ACC and CACC.",
      fit: "contain",
    },
    facts: [
      { k: "Time to collision", v: "2.1 s at 25 mph to 1.3 s at 75 mph" },
      { k: "Now building", v: "CAN gear controller, STM32" },
    ],
    link: { label: "The CAN gear controller", href: "/projects/can-gear-controller" },
  },
  {
    id: "next",
    years: "Now",
    domain: "Next",
    title: "What I am looking for",
    body: [
      "Industry experience, on a team building real machines. Somewhere I can be useful from the first week, learn from engineers further along than me, and contribute something back to the company and to the people the machines are for.",
    ],
    media: {
      kind: "robot",
      src: "/images/riz/headshot-cut.png",
      alt: "Riz as a robot: his face on a helmet, one arm waving and one holding a circuit board, on a wheeled base",
      caption: "Ready to deploy. Chicago, open to relocation.",
      fit: "cover",
    },
    facts: [
      { k: "Education", v: "MS CS 2026 · BE EEE 2023" },
      { k: "Experience", v: "Build Fellowship, Tesla FCW/AEB, 2025" },
    ],
    link: { label: "Get in touch", href: "/contact" },
  },
];

/** Compact version for the path strip. */
export const milestones: {
  id: string;
  label: string;
  note: string;
  thumb?: { src: string; alt: string };
  scene?: "holo" | "circuit" | "car";
}[] = [
  { id: "biology", label: "My journey", note: "Where it began", scene: "holo" },
  { id: "detour", label: "Electronics", note: "BE, Chennai", scene: "circuit" },
  {
    id: "assistive",
    label: "Assistive robotics",
    note: "3 patents filed",
    thumb: { src: "/images/knee/cad-assembly.jpg", alt: "Knee actuator exoskeleton" },
  },
  {
    id: "pivot",
    label: "Computer science",
    note: "MS, 2026",
    thumb: { src: "/images/amr/robot.jpg", alt: "Autonomous mobile robot" },
  },
  { id: "av", label: "Autonomous vehicles", note: "Where I am headed", scene: "car" },
];
