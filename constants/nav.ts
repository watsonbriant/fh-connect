export const NAV_ITEMS: {
  label: string;
  href: string;
  children: { label: string; href: string }[];
}[] = [
  { label: "Join Us.", href: "#", children: [] },
  {
    label: "Who We Are.",
    href: "#",
    children: [
      { label: "Sit With Me", href: "#" },
      { label: "Vision + Beliefs", href: "#" },
      { label: "Our Campuses", href: "#" },
      { label: "Our Pastors", href: "#" },
      { label: "Job Openings", href: "#" },
      { label: "Download the FH App", href: "#" },
    ],
  },
  {
    label: "Get Connected.",
    href: "#",
    children: [
      { label: "Connect With Us", href: "#" },
      { label: "Upcoming Events", href: "#" },
      { label: "Join a LifeGroup", href: "#" },
      { label: "FHKids", href: "#" },
      { label: "Vertical Youth", href: "#" },
      { label: "MVMNT Young Adults", href: "#" },
      { label: "Strong Men", href: "#" },
      { label: "Authentic Women", href: "#" },
      { label: "FHConnect", href: "/fhconnect/profile" },
    ],
  },
  {
    label: "Your Next Steps.",
    href: "#",
    children: [
      { label: "Join The FH Family", href: "#" },
      { label: "Serve in the Church", href: "#" },
      { label: "Serve Charlotte", href: "#" },
      { label: "Serve Around the World", href: "#" },
      { label: "Get Baptized", href: "#" },
      { label: "Move Forward", href: "#" },
      { label: "Internship", href: "#" },
      { label: "TPUSA Faith", href: "#" },
    ],
  },
  {
    label: "Watch + Listen.",
    href: "#",
    children: [
      { label: "Watch Live Online", href: "#" },
      { label: "Previous Messages", href: "#" },
      { label: "Worship", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "Podcast", href: "#" },
    ],
  },
  {
    label: "Get Support.",
    href: "#",
    children: [
      { label: "Need Prayer?", href: "#" },
      { label: "Need a Pastor?", href: "#" },
      { label: "Recommended Counselors", href: "#" },
      { label: "Religious Exemption Letter", href: "#" },
    ],
  },
  { label: "Freedom Academy", href: "https://freedomacademync.cc", children: [] },
];
