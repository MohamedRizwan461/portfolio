export const site = {
  name: "Mohamed Rizwan Ameer John",
  short: "Riz",
  designation: "RIZ",
  role: "Robotics and Embedded Systems Engineer",
  url: "https://riz-robotics.vercel.app",
  email: "rizwan04061008@gmail.com",
  linkedin: "https://www.linkedin.com/in/mohamed-rizwan-ameer-john-3a459a231/",
  github: "https://github.com/MohamedRizwan461",
  location: "Chicago, IL. Open to relocation.",
  resumePdf: "/resume/Mohamed-Rizwan-Ameer-John-Resume.pdf",
};

export const strengths = [
  {
    title: "Embedded and mechatronics",
    body: "Bare-metal C on ARM Cortex-M, FreeRTOS, CAN, I2C, SPI and UART, driving motors, valves and pneumatics.",
    tools: ["C / C++", "STM32", "RP2040", "FreeRTOS", "CAN"],
  },
  {
    title: "Computer vision and ML",
    body: "On-device perception: OpenCV and MediaPipe pipelines on embedded Linux, TinyML classifiers on microcontrollers, Q-Learning navigation.",
    tools: ["OpenCV", "MediaPipe", "TinyML", "Python"],
  },
  {
    title: "Hardware prototyping",
    body: "Schematics, power rails, wiring harnesses and FEA, then bench bring-up with scope and DMM until the prototype behaves.",
    tools: ["MATLAB / Simulink", "SOFA FEA", "Li-Po + buck", "Oscilloscope"],
  },
];

export const proof = [
  {
    label: "Indian patent application",
    value: "202341027059",
    detail: "Smart Knee Actuator, assistive exoskeleton. Published Oct 2024.",
    href: "/projects/smart-knee-actuator",
  },
  {
    label: "Indian patent application",
    value: "202341008938",
    detail: "Wireless Sensor Network Management Web Platform. Feb 2023.",
    href: "/projects/rfid-iot-attendance",
  },
  {
    label: "Indian patent application",
    value: "Filed Feb 10, 2023",
    detail: "Sign Language Interpreting Smart Eyewear.",
    href: "/projects/sign-language-eyewear",
  },
  {
    label: "IEEE YESIST12",
    value: "International Finalist",
    detail: "Grand Finale, Maker Fair Track, Egypt, Sep 2023.",
  },
  {
    label: "IIT PALS",
    value: "Winner",
    detail: "IIT Madras, Oct 2022.",
  },
  {
    label: "Smart India Hackathon",
    value: "2022",
    detail: "Smart Knee Actuator.",
    href: "/projects/smart-knee-actuator",
  },
];

export type Figure = {
  src?: string;
  width?: number;
  height?: number;
  alt: string;
  caption: string;
  kind?: "canFrame";
};

export type ProjectVideo = {
  src: string;
  poster: string;
  alt: string;
  caption: string;
  portrait?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  date: string;
  context: string;
  status?: string;
  featured?: boolean;
  problem: string;
  role: string;
  stack: string[];
  cover: Figure;
  built: string[];
  hardware: string[];
  software: string[];
  characteristics: { parameter: string; value: string }[];
  validation: string[];
  results: string[];
  figures: Figure[];
  videos?: ProjectVideo[];
  links: { label: string; href: string }[];
  patent?: string;
};

const canFrame: Figure = {
  kind: "canFrame",
  alt: "Byte map of the 8-byte gear status CAN frame on ID 0x18F00500",
  caption: "Gear status frame, CAN ID 0x18F00500, 8 bytes, J1939-style",
};

export const projects: Project[] = [
  {
    slug: "can-gear-controller",
    title: "CAN Vehicle Network Gear Controller",
    date: "Sep 2026",
    context: "Personal project",
    status: "In progress",
    featured: true,
    problem:
      "A transmission controller must never shift into an unsafe gear or act on a stale or corrupted CAN frame.",
    role: "Sole engineer: requirements, architecture, firmware, tests and CI.",
    stack: ["Embedded C", "STM32 Cortex-M4", "FreeRTOS", "CAN", "Unity"],
    cover: canFrame,
    built: [
      "A two-node gear-state controller for a simulated multi-speed transmission. Node A runs the shift scheduler and broadcasts gear status; node B acts as the transmission ECU, validates requests, applies interlocks and reports the actual gear.",
      "Safety interlocks written as requirements first: brake required to leave PARK, REVERSE blocked above 5.0 km/h, PARK blocked above 2.0 km/h, one forward gear per request.",
      "All decision logic (gear state machine, shift scheduler, CAN protocol) is pure C behind a thin HAL, so it runs and is tested on a normal PC.",
    ],
    hardware: [
      "2x STM32 Nucleo-F446RE (ARM Cortex-M4)",
      "2x CAN transceivers, 120 ohm termination at each end",
      "8-channel USB logic analyzer on CAN_TX / CAN_RX",
      "ST-Link SWD for flashing and debug",
    ],
    software: [
      "Embedded C, FreeRTOS tasks for control, CAN comms and fault monitoring",
      "J1939-style frame encode/decode with rolling counter and checksum",
      "Unity + CMake/CTest host unit tests",
      "GitHub Actions: tests, cppcheck, ARM cross-compile",
    ],
    characteristics: [
      { parameter: "Gear status CAN ID", value: "0x18F00500 (29-bit)" },
      { parameter: "Frame length", value: "8 bytes" },
      { parameter: "Rolling counter", value: "0 to 15, wraps" },
      { parameter: "Broadcast period (requirement)", value: "20 ms +/- 2 ms" },
      { parameter: "Shift response (requirement)", value: "within 50 ms" },
      { parameter: "Bus-loss timeout", value: "250 ms to FAULT_TIMEOUT" },
      { parameter: "Shift hysteresis", value: ">= 3.0 km/h" },
    ],
    validation: [
      "Every software requirement carries an ID (SWR-xxx) referenced in the name of the test that verifies it, with a traceability matrix.",
      "Timing requirements SWR-030 and SWR-031 are verified on the bench with the logic analyzer; those captures are in progress.",
    ],
    results: [
      "Control logic verified by host-run unit tests on every change.",
      "Frames with a bad checksum are rejected; a counter gap is flagged as a dropped frame.",
    ],
    figures: [canFrame],
    links: [],
  },
  {
    slug: "smart-knee-actuator",
    title: "Smart Knee Actuator",
    date: "Aug 2022",
    context: "Smart India Hackathon, KCG College of Technology",
    featured: true,
    patent: "Indian Patent Application No. 202341027059, published Oct 2024",
    problem:
      "Passive knee braces cannot help post-stroke patients at the moment in the gait cycle when the knee needs support.",
    role: "Firmware, electrical and fluid-power design, bench commissioning.",
    stack: ["Embedded C", "RP2040", "TinyML", "I2C / BLE", "Pneumatics"],
    cover: {
      src: "/images/knee/cad-assembly.jpg",
      width: 549,
      height: 494,
      alt: "CAD model of the smart knee actuator exoskeleton with pneumatic cylinder",
      caption: "Smart Knee Actuator, CAD assembly",
    },
    built: [
      "A powered knee brace that detects the walking phase and fires a pneumatic cylinder to assist the knee, with no manual input.",
      "Bare-metal C firmware on an RP2040 samples an MPU6050 IMU over I2C and flex sensors over ADC, runs an on-device TinyML gait-phase classifier, and drives solenoid-operated 5/2 directional control valves through GPIO.",
      "BLE telemetry for live monitoring.",
    ],
    hardware: [
      "RP2040, dual-core ARM Cortex-M0+",
      "MPU6050 IMU (I2C), flex sensor (ADC)",
      "5/2 solenoid-operated DCV, double-acting cylinder, FRL unit, 10 bar supply",
      "Li-Po pack with LM2596 buck rail, wiring harness",
    ],
    software: ["Embedded C", "TinyML gait-phase classifier", "BLE telemetry", "FEA"],
    characteristics: [
      { parameter: "MCU", value: "RP2040, Cortex-M0+, 264 KB SRAM" },
      { parameter: "Sensing", value: "MPU6050 over I2C, flex over ADC" },
      { parameter: "Pneumatic supply", value: "10 bar with FRL unit" },
      { parameter: "Actuator", value: "Double-acting cylinder, 5/2 DCV" },
      { parameter: "FEA load case", value: "500 N" },
      { parameter: "Power", value: "Li-Po + LM2596 buck" },
    ],
    validation: [
      "FEA of the frame under a 500 N load in extension and flexion; a 60 kg user needs under 300 N.",
      "Commissioned on the bench with oscilloscope and DMM, root-causing actuation timing, pressure regulation and sensor calibration faults.",
    ],
    results: [
      "Working prototype built for Smart India Hackathon.",
      "Indian patent application 202341027059, published October 2024.",
    ],
    videos: [
      {
        src: "/video/knee-actuator-working.mp4",
        poster: "/video/knee-actuator-working-poster.jpg",
        alt: "The knee actuator strapped to a leg, pneumatic cylinder extending and retracting",
        caption: "The prototype running on the bench, pneumatic cylinder driving the knee",
        portrait: true,
      },
    ],
    figures: [
      {
        src: "/images/knee/cad-side.jpg",
        width: 562,
        height: 472,
        alt: "Side view CAD of the knee actuator showing cylinder mounting and foot",
        caption: "CAD, side view with cylinder mounting",
      },
      {
        src: "/images/knee/control-schematic.png",
        width: 885,
        height: 508,
        alt: "Electrical schematic of the RP2040 control board with relays and sensors",
        caption: "Control electronics schematic",
      },
      {
        src: "/images/knee/fea-displacement.jpg",
        width: 1086,
        height: 752,
        alt: "FEA displacement plot of the actuator frame under load",
        caption: "FEA displacement under load",
      },
    ],
    links: [{ label: "Write-up on GitHub", href: "https://github.com/MohamedRizwan461/smart-knee-actuator" }],
  },
  {
    slug: "sign-language-eyewear",
    title: "Sign Language Interpreting Smart Eyewear",
    date: "Jan 2023",
    context: "KCG College of Technology",
    featured: true,
    patent: "Indian patent application filed Feb 10, 2023",
    problem:
      "A person who signs cannot easily talk with someone who does not know sign language, and glove-based interpreters are awkward to wear.",
    role: "Vision pipeline and wearable hardware design.",
    stack: ["Python", "OpenCV", "MediaPipe", "Raspberry Pi 4B", "CNN"],
    cover: {
      src: "/images/eyewear/worn-prototype.jpg",
      width: 1600,
      height: 720,
      alt: "The eyewear prototype worn, camera and control board mounted on the frame",
      caption: "The prototype, worn",
    },
    built: [
      "Glasses with a built-in camera that read Indian Sign Language gestures and speak them aloud in real time.",
      "Fully on-device on embedded Linux: 5 MP CSI camera, OpenCV preprocessing, MediaPipe 21-point hand landmarks, a CNN gesture classifier, then text-to-speech. No cloud connection.",
      "Camera only, so the user wears nothing on their hands.",
    ],
    hardware: [
      "Raspberry Pi 4B (ARM Cortex-A72)",
      "5 MP CSI camera, speaker",
      "3.7 V 3250 mAh Li-Po with LM2596 buck regulation",
      "Head-worn packaging with cooling",
    ],
    software: ["Python on embedded Linux", "OpenCV", "MediaPipe hand landmarks", "CNN classifier", "Text-to-speech"],
    characteristics: [
      { parameter: "Compute", value: "Raspberry Pi 4B, Cortex-A72" },
      { parameter: "Camera", value: "5 MP CSI" },
      { parameter: "Hand model", value: "MediaPipe, 21 landmarks" },
      { parameter: "Battery", value: "3.7 V, 3250 mAh Li-Po" },
      { parameter: "Regulation", value: "LM2596 buck" },
      { parameter: "Connectivity needed", value: "None, on-device" },
    ],
    validation: ["Real-time gesture-to-speech pipeline demonstrated on the wearable prototype."],
    results: ["Indian patent application filed February 10, 2023."],
    figures: [
      {
        src: "/images/eyewear/pi-pipeline.jpg",
        width: 1013,
        height: 900,
        alt: "Raspberry Pi desktop over VNC running the MediaPipe hand tracking script with the camera feed",
        caption: "The pipeline running on the Raspberry Pi, hand landmarks tracked live",
      },
      {
        src: "/images/eyewear/hand-landmarks.jpg",
        width: 260,
        height: 194,
        alt: "A hand with the 21-point MediaPipe skeleton drawn over it",
        caption: "MediaPipe 21-point hand landmarks",
      },
      {
        src: "/images/eyewear/render.jpg",
        width: 1047,
        height: 521,
        alt: "Render of the smart eyewear with built-in camera",
        caption: "Industrial design render",
      },
      {
        src: "/images/eyewear/system-concept.jpg",
        width: 749,
        height: 506,
        alt: "Concept diagram: hand gestures to camera, Raspberry Pi, speaker, voice for listener",
        caption: "System concept, gesture in, speech out",
      },
      {
        src: "/images/eyewear/inference-pipeline.jpg",
        width: 1027,
        height: 415,
        alt: "Inference pipeline from video through image transform, model inference and landmarks to renderer",
        caption: "Inference pipeline",
      },
      {
        src: "/images/eyewear/schematic.jpg",
        width: 1280,
        height: 905,
        alt: "Electrical schematic of the Raspberry Pi, camera and power circuit",
        caption: "Electrical schematic",
      },
    ],
    links: [{ label: "Write-up on GitHub", href: "https://github.com/MohamedRizwan461/sign-language-eyewear" }],
  },
  {
    slug: "autonomous-mobile-robot",
    title: "Autonomous Mobile Robot",
    date: "2023 to May 2024",
    context: "University of New Haven",
    problem:
      "A guide robot for visually impaired users has to avoid obstacles on its own, and the learning has to run on the microcontroller rather than a laptop.",
    role: "Built the robot hardware in the first semester, then wrote the Arduino Q-learning and epsilon-greedy implementation when the project became a team of three.",
    stack: ["C++", "Arduino", "Q-Learning", "MATLAB", "HIL"],
    cover: {
      src: "/images/amr/robot.jpg",
      width: 621,
      height: 536,
      alt: "The four-wheeled autonomous mobile robot with ultrasonic sensor on a floor",
      caption: "The robot",
    },
    built: [
      "Semester one: the robot itself. Wiring harness, HC-SR04 ultrasonic sensing and L293D H-bridge PWM motor drives, assembled by hand.",
      "Semester two: reinforcement learning on that same hardware, as a team of three. I implemented Q-learning with epsilon-greedy and greedy action selection in Arduino C++, including the reward function, state representation and action space, and trained the policy to follow the optimal path.",
      "The target application was a guide and companion robot for visually impaired users, with obstacle avoidance and navigation.",
    ],
    hardware: ["Arduino (AVR/ARM)", "HC-SR04 ultrasonic sensors", "L293D H-bridge motor driver", "4-wheel chassis, external 12 V supply"],
    software: ["C++ on Arduino", "Q-Learning, epsilon-greedy", "MATLAB / Python simulation"],
    characteristics: [
      { parameter: "Learning method", value: "Q-Learning, epsilon-greedy" },
      { parameter: "Simulation episodes", value: "100+" },
      { parameter: "Hardware trials", value: "100+" },
      { parameter: "Motor drive", value: "L293D H-bridge, PWM" },
      { parameter: "Sensing", value: "HC-SR04 ultrasonic" },
    ],
    validation: [
      "Model-in-the-loop in MATLAB/Python across 100+ episodes, then hardware-in-the-loop, then on the robot.",
      "Run in a corridor against real obstacles and to a marked goal, recorded on video.",
      "Reproduced and root-caused sensor calibration, PWM timing and control-loop defects across 100+ hardware runs.",
    ],
    results: ["Navigation stable and repeatable on the physical robot."],
    videos: [
      {
        src: "/video/robot-rl-demo.mp4",
        poster: "/video/robot-rl-demo-poster.jpg",
        alt: "The robot driving down a corridor and steering around boxes",
        caption: "Obstacle run in the corridor, learned policy driving",
        portrait: true,
      },
      {
        src: "/video/robot-goal-run.mp4",
        poster: "/video/robot-goal-run-poster.jpg",
        alt: "The robot navigating around a bottle toward a paper marked GOAL",
        caption: "Navigating to the goal marker around an obstacle",
      },
    ],
    figures: [
      {
        src: "/images/amr/wiring.jpg",
        width: 1023,
        height: 378,
        alt: "Wiring diagram of Arduino, motor driver, ultrasonic sensor and four motors",
        caption: "Wiring diagram",
      },
      {
        src: "/images/amr/rewards-per-episode.png",
        width: 574,
        height: 455,
        alt: "Plot of reward per episode across 100 training episodes",
        caption: "Reward per episode, simulation",
      },
      {
        src: "/images/amr/test-run.jpg",
        width: 392,
        height: 578,
        alt: "Robot navigating between obstacles during a hardware test run",
        caption: "Hardware test run",
      },
    ],
    links: [{ label: "Write-up on GitHub", href: "https://github.com/MohamedRizwan461/autonomous-mobile-robot" }],
  },
  {
    slug: "ev-boost-converter",
    title: "EV Powertrain Boost Converter with Adaptive Sliding Mode Control",
    date: "May 2023",
    context: "Research project with Akshitha, University of New Haven",
    problem:
      "A fuel cell's output voltage swings with load and temperature, but a fuel cell hybrid vehicle's bus needs a steady 36 V.",
    role: "Converter design, controller design and stability proof, with Akshitha. Design and simulation study, not a built converter.",
    stack: ["MATLAB", "Simulink", "Stateflow", "Control theory"],
    cover: {
      alt: "Boost converter design parameters",
      caption: "Converter design parameters",
    },
    built: [
      "A nonlinear DC-DC boost converter for a fuel cell hybrid electric vehicle powertrain.",
      "An Adaptive Sliding Mode Controller with a Lyapunov stability proof for zero steady-state error.",
      "Supervisory logic as Stateflow state machines with automatic code generation.",
    ],
    hardware: ["Boost topology, simulated", "L = 383 uH, C = 257 uF, R = 13 ohm"],
    software: ["MATLAB / Simulink", "Stateflow with autocode", "Small-signal and Bode analysis"],
    characteristics: [
      { parameter: "Input voltage", value: "12 to 18 V" },
      { parameter: "Output voltage", value: "36 V" },
      { parameter: "Power range", value: "1 to 100 W" },
      { parameter: "Switching frequency", value: "30 kHz" },
      { parameter: "Inductor / capacitor", value: "383 uH / 257 uF" },
      { parameter: "Phase margin", value: "45 deg" },
      { parameter: "Gain crossover", value: "10 kHz" },
      { parameter: "Current ripple", value: "< 5%" },
      { parameter: "Voltage ripple", value: "< 0.5%" },
    ],
    validation: [
      "Lyapunov candidate V = s^2 / 2 with negative-definite derivative, proving convergence to the sliding surface.",
      "Verification campaign across the full 1 to 100 W load range, confirmed by Bode analysis.",
    ],
    results: ["Stable 36 V regulation across the load range in simulation.", "Co-authored research paper."],
    figures: [],
    links: [{ label: "Write-up on GitHub", href: "https://github.com/MohamedRizwan461/fchev-boost-converter-asmc" }],
  },
  {
    slug: "soft-robotic-glove",
    title: "Soft Robotic Glove",
    date: "Jan 2022",
    context: "KCG College of Technology, team lead of 12",
    problem:
      "Rigid rehabilitation devices can hyperextend a stroke patient's joints and do not adapt to each hand.",
    role: "Team lead; kinematic modeling and actuation design.",
    stack: ["D-H kinematics", "Soft pneumatic actuators", "Servo drives", "SOFA FEA"],
    cover: { alt: "Glove kinematic model", caption: "Kinematic model" },
    built: [
      "A soft robotic glove for post-stroke hand rehabilitation, using silicone pneumatic actuators that inflate to guide the fingers.",
      "Five-finger multi-DOF kinematic chains (MCP, PIP, DIP joints) modeled with Denavit-Hartenberg parameter tables.",
      "Led a 12-member interdisciplinary team through design reviews that resolved conflicting electrical, mechanical and software requirements.",
    ],
    hardware: ["Silicone soft pneumatic actuators, one per finger", "Servo drives for position control"],
    software: ["D-H forward kinematics", "SOFA soft-body FEA"],
    characteristics: [
      { parameter: "Kinematic model", value: "Denavit-Hartenberg" },
      { parameter: "Fingers modeled", value: "5 (MCP, PIP, DIP)" },
      { parameter: "Actuator", value: "Silicone soft pneumatic" },
      { parameter: "Simulation", value: "SOFA FEA" },
      { parameter: "Team", value: "12 members, team lead" },
    ],
    validation: ["Actuator deformation and full finger range of motion simulated in SOFA before the physical build."],
    results: ["Selected after two rounds of interviews to lead the team."],
    figures: [],
    links: [{ label: "Write-up on GitHub", href: "https://github.com/MohamedRizwan461/soft-robotic-glove" }],
  },
  {
    slug: "rfid-iot-attendance",
    title: "Wireless Sensor Network Attendance Platform",
    date: "Feb 2023",
    context: "KCG College of Technology, co-inventor",
    patent: "Indian Patent Application No. 202341008938, Feb 2023",
    problem: "Paper attendance is slow, error-prone and needs local servers to digitize.",
    role: "Co-inventor on a 12-person team.",
    stack: ["ESP8266", "RFID", "Google Apps Script", "IoT"],
    cover: {
      src: "/images/rfid/wsn-architecture.jpg",
      width: 409,
      height: 336,
      alt: "Wireless sensor network architecture from sensor nodes through gateway to web server",
      caption: "Network architecture",
    },
    built: [
      "An RFID tap on an ESP8266 node timestamps attendance and posts it over Wi-Fi to a serverless Google Apps Script endpoint that writes to Google Sheets.",
      "A web dashboard shows live attendance and sensor status with no local infrastructure.",
    ],
    hardware: ["RFID reader (SPI / UART)", "ESP8266 Wi-Fi microcontroller"],
    software: ["Google Apps Script (serverless API)", "Google Sheets", "Web dashboard"],
    characteristics: [
      { parameter: "Edge node", value: "ESP8266 Wi-Fi MCU" },
      { parameter: "Capture", value: "RFID tag UID + timestamp" },
      { parameter: "Transport", value: "HTTPS POST over Wi-Fi" },
      { parameter: "Backend", value: "Serverless, Apps Script" },
    ],
    validation: ["Designed for classrooms, offices and industrial sites without local servers."],
    results: ["Indian patent application 202341008938, February 2023."],
    figures: [
      {
        src: "/images/rfid/dashboard.png",
        width: 521,
        height: 402,
        alt: "Web dashboard listing sensor alerts and node battery status",
        caption: "Management dashboard",
      },
    ],
    links: [{ label: "Write-up on GitHub", href: "https://github.com/MohamedRizwan461/rfid-iot-attendance-system" }],
  },
  {
    slug: "supply-chain-risk",
    title: "AI-Driven Supply Chain Risk Predictor",
    date: "Apr 2026",
    context: "MS final project, Governors State University, team of 3",
    problem: "Planners find out a shipment is late only after it is late.",
    role: "One of three engineers on the team.",
    stack: ["Python", "scikit-learn", "Streamlit"],
    cover: { alt: "Model comparison", caption: "Model results" },
    built: [
      "A web app that predicts shipment delay in days so planners can flag risky shipments before they ship.",
      "Compared Linear Regression, Random Forest and Gradient Boosting in scikit-learn; deployed Gradient Boosting.",
      "Three tabs: single-shipment prediction, batch CSV upload and model analytics.",
    ],
    hardware: [],
    software: ["Python, pandas", "scikit-learn", "Streamlit, deployed live"],
    characteristics: [
      { parameter: "Deployed model", value: "Gradient Boosting" },
      { parameter: "MAE", value: "0.422 days" },
      { parameter: "RMSE", value: "0.533 days" },
    ],
    validation: ["Three regressors compared on MAE and RMSE; Gradient Boosting performed best and was deployed."],
    results: ["Live demo presented at the final program review, April 2026."],
    figures: [],
    links: [
      { label: "Live app", href: "https://supply-chain-risk.streamlit.app" },
      { label: "Code on GitHub", href: "https://github.com/MohamedRizwan461/supply-chain-risk" },
    ],
  },
];

export const featured = projects.filter((p) => p.featured);

export const canFrameBytes = [
  { byte: "0", signal: "Gear", note: "P, R, N, D1 to D8" },
  { byte: "1-2", signal: "Road speed", note: "km/h x10, little-endian" },
  { byte: "3", signal: "Throttle", note: "percent" },
  { byte: "4", signal: "Fault flags", note: "invalid request, timeout" },
  { byte: "5", signal: "Reserved", note: "0x00" },
  { byte: "6", signal: "Rolling counter", note: "0 to 15" },
  { byte: "7", signal: "Checksum", note: "over bytes 0-6" },
];
