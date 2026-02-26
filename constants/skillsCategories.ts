/** Category name and list of skill options for the Skills section. */

export type SkillsCategory = {
  category: string;
  skills: string[];
};

export const SKILLS_CATEGORIES: SkillsCategory[] = [
  { category: "Accounting", skills: ["Accounting", "Bookkeeping", "Financial", "Financial Investments", "Financial Planning", "Taxes"] },
  { category: "Art", skills: ["Artist", "Crafts", "Decorating", "Graphic Design", "Photography"] },
  { category: "Business", skills: ["Career Counseling", "Entrepreneur", "Personnel Manager/HR", "Public Relations", "Recruiter"] },
  { category: "Construction", skills: ["Architect", "Building", "Carpenter", "Carpet/Tile", "Concrete", "Drafting", "Drywall", "Electrical", "General Contractor", "Heating & AC", "Interior Design", "Masonry", "Painting", "Plumbing", "Roofing", "Utility Work"] },
  { category: "Drama", skills: ["Acting", "Dance", "Poet", "Writer"] },
  { category: "First Responders", skills: ["911 Operator", "Firefighter", "Law Enforcement", "Paramedic/EMT"] },
  { category: "General", skills: ["Administrator (Education)", "Bookstore", "Cashier", "Child Care", "Customer/Food Service", "Day Care Director", "Engineer", "LifeGuard", "Teacher", "Transportation", "Unemployment", "Weddings"] },
  { category: "Government", skills: ["City Employee", "Federal Employee", "State Employee"] },
  { category: "Healthcare", skills: ["Chiropractic", "Counseling", "Dental", "Medical", "Mental Health", "Nursing", "Social Work"] },
  { category: "IT", skills: ["Coding", "Computer Programming", "Microsoft Office/Software", "Programming", "Systems Analyst"] },
  { category: "Legal", skills: ["Attorney", "Judge", "Paralegal"] },
  { category: "Maintenance", skills: ["Carpet Cleaning", "Cleaning", "Facilities/Grounds", "Gardening", "Landscaping", "Pest Control", "Window Washing"] },
  { category: "Mechanics", skills: ["Copier/Computer Repair", "Mechanic"] },
  { category: "Media", skills: ["Advertising", "Journalist/Writer", "Radio", "Television"] },
  { category: "Music", skills: ["Arranger", "Bassist", "Chart Songs", "Choir", "Choir Director", "Composer", "Drummer", "Guitarist", "Keyboardist", "Other Instrument", "Piano Tuner", "Soloist"] },
  { category: "Office", skills: ["Data Entry", "Filing", "Library", "Mail Room", "Office Manager", "Receptionist", "Shorthand", "Transcription", "Typing", "Word Processing"] },
  { category: "Production", skills: ["Lighting", "Producer", "Set Design", "Sound Engineer", "Stagehand", "Studio Recording", "Videographer"] },
  { category: "Sports", skills: ["Baseball", "Basketball", "Coach", "Football", "General Athlete", "Golf", "Official", "Soccer", "Softball", "Tennis"] },
];
