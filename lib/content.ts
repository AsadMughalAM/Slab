/**
 * All site copy in one place. SLAB® is a placeholder studio: swap in your own
 * name, links and details here and the whole page follows.
 */

export const STUDIO = {
  name: "SLAB",
  descriptor: "Independent design & code studio",
  founded: 2019,
  city: "Lahore, PK",
  coordinates: "31.52° N / 74.35° E",
  timeZone: "Asia/Karachi",
  email: "hello@slab.studio", // placeholder: replace with your address
  availability: "Booking projects for Q1 2027",
};

export const NAV_LINKS = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Studio", href: "#studio" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

// Placeholder profiles: point these at your own accounts.
export const SOCIAL_LINKS = [
  { label: "X / Twitter", href: "https://x.com/" },
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
];

export const SERVICES = [
  { name: "Brand identity", detail: "Names, marks, systems" },
  { name: "Web experiences", detail: "Sites that behave" },
  { name: "Creative code", detail: "WebGL, motion, tools" },
  { name: "Art direction", detail: "Campaigns & launches" },
];

export type Project = {
  id: string;
  index: string;
  title: string;
  client: string;
  year: number;
  discipline: string;
  summary: string;
  poster: "kiln" | "volt" | "archiv" | "wave";
};

export const PROJECTS: Project[] = [
  {
    id: "kiln",
    index: "01",
    title: "KILN",
    client: "Kiln Ceramics",
    year: 2026,
    discipline: "Identity / E-commerce",
    summary: "A ceramics label whose identity is fired, not drawn: every mark is cut from the kiln's own shapes.",
    poster: "kiln",
  },
  {
    id: "volt",
    index: "02",
    title: "VOLT",
    client: "Volt Mobility",
    year: 2025,
    discipline: "Brand / Product launch",
    summary: "Electric scooters for people who hate scooters. A launch built on one diagonal line.",
    poster: "volt",
  },
  {
    id: "archiv",
    index: "03",
    title: "ARCHIV",
    client: "Archiv Museum of Form",
    year: 2025,
    discipline: "Wayfinding / Website",
    summary: "A modular grid that runs from the museum's signage to its collection site.",
    poster: "archiv",
  },
  {
    id: "wave",
    index: "04",
    title: "NORTHWAVE",
    client: "Northwave Festival",
    year: 2024,
    discipline: "Campaign / Motion",
    summary: "Three nights of electronic music, told as a single waveform that never repeats.",
    poster: "wave",
  },
];

export const MARQUEE_WORDS = ["Identity", "Websites", "Creative code", "Motion", "Launches", "Systems"];
