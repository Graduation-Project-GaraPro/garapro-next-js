// src/app/manager/components/Quote/constants.ts
import { ServiceCategory, ServiceItem } from "./types";

export const SERVICE_ITEMS: Record<string, ServiceItem[]> = {
  "ui-design": [
    { id: "wireframes", name: "Wireframes", price: 500 },
    { id: "prototypes", name: "Interactive Prototypes", price: 800 },
    { id: "design-system", name: "Design System", price: 1200 },
    { id: "user-testing", name: "User Testing", price: 600 },
  ],
  "graphic-design": [
    { id: "logo", name: "Logo Design", price: 400 },
    { id: "brochure", name: "Brochure Design", price: 300 },
    { id: "packaging", name: "Packaging Design", price: 600 },
    { id: "illustrations", name: "Custom Illustrations", price: 500 },
  ],
  branding: [
    { id: "brand-guide", name: "Brand Guidelines", price: 800 },
    { id: "color-palette", name: "Color Palette Development", price: 400 },
    { id: "typography", name: "Typography Selection", price: 300 },
    { id: "brand-voice", name: "Brand Voice & Messaging", price: 600 },
  ],
  "web-design": [
    { id: "responsive", name: "Responsive Design", price: 600 },
    { id: "animations", name: "Animations & Interactions", price: 500 },
    { id: "accessibility", name: "Accessibility Audit", price: 400 },
    { id: "performance", name: "Performance Optimization", price: 450 },
  ],
  frontend: [
    { id: "react-setup", name: "React Setup & Architecture", price: 800 },
    { id: "components", name: "Component Library", price: 1200 },
    { id: "state-mgmt", name: "State Management", price: 600 },
    { id: "testing", name: "Unit Testing", price: 700 },
  ],
  backend: [
    { id: "api-design", name: "API Design & Documentation", price: 900 },
    { id: "database", name: "Database Design", price: 1000 },
    { id: "auth", name: "Authentication & Authorization", price: 800 },
    { id: "deployment", name: "Deployment Setup", price: 600 },
  ],
  fullstack: [
    { id: "architecture", name: "Full Stack Architecture", price: 1500 },
    { id: "integration", name: "Frontend-Backend Integration", price: 1200 },
    { id: "devops", name: "DevOps Setup", price: 1000 },
    { id: "monitoring", name: "Monitoring & Logging", price: 800 },
  ],
  mobile: [
    { id: "ios", name: "iOS Development", price: 2000 },
    { id: "android", name: "Android Development", price: 2000 },
    { id: "cross-platform", name: "Cross-Platform Setup", price: 1500 },
    { id: "app-store", name: "App Store Deployment", price: 500 },
  ],
  seo: [
    { id: "audit", name: "SEO Audit", price: 300 },
    { id: "keywords", name: "Keyword Research", price: 400 },
    { id: "on-page", name: "On-Page Optimization", price: 500 },
    { id: "link-building", name: "Link Building Strategy", price: 600 },
  ],
  "social-media": [
    { id: "strategy", name: "Social Media Strategy", price: 400 },
    { id: "content-calendar", name: "Content Calendar", price: 300 },
    { id: "graphics", name: "Social Graphics", price: 500 },
    { id: "community", name: "Community Management", price: 600 },
  ],
  content: [
    { id: "blog-posts", name: "Blog Posts (5)", price: 600 },
    { id: "whitepapers", name: "Whitepapers", price: 800 },
    { id: "case-studies", name: "Case Studies", price: 700 },
    { id: "video-scripts", name: "Video Scripts", price: 500 },
  ],
  ppc: [
    { id: "campaign-setup", name: "Campaign Setup", price: 500 },
    { id: "ad-copy", name: "Ad Copy Writing", price: 300 },
    { id: "landing-pages", name: "Landing Pages", price: 600 },
    { id: "optimization", name: "Campaign Optimization", price: 400 },
  ],
  strategy: [
    { id: "market-analysis", name: "Market Analysis", price: 800 },
    { id: "roadmap", name: "Strategy Roadmap", price: 1000 },
    { id: "competitive", name: "Competitive Analysis", price: 600 },
    { id: "implementation", name: "Implementation Plan", price: 700 },
  ],
  "tech-consulting": [
    { id: "tech-stack", name: "Tech Stack Selection", price: 900 },
    { id: "architecture-review", name: "Architecture Review", price: 1000 },
    { id: "migration", name: "Migration Planning", price: 800 },
    { id: "security", name: "Security Assessment", price: 1200 },
  ],
  business: [
    { id: "process-improvement", name: "Process Improvement", price: 700 },
    { id: "org-structure", name: "Organizational Structure", price: 800 },
    { id: "training", name: "Team Training", price: 600 },
    { id: "kpi", name: "KPI Development", price: 500 },
  ],
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "design",
    name: "Design Services",
    children: [
      { id: "ui-design", name: "UI/UX Design", price: 2500 },
      { id: "graphic-design", name: "Graphic Design", price: 1500 },
      { id: "branding", name: "Branding", price: 3000 },
      { id: "web-design", name: "Web Design", price: 2000 },
    ],
  },
  {
    id: "development",
    name: "Development Services",
    children: [
      { id: "frontend", name: "Frontend Development", price: 3500 },
      { id: "backend", name: "Backend Development", price: 4000 },
      { id: "fullstack", name: "Full Stack Development", price: 6000 },
      { id: "mobile", name: "Mobile Development", price: 5000 },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Services",
    children: [
      { id: "seo", name: "SEO Optimization", price: 1200 },
      { id: "social-media", name: "Social Media Marketing", price: 1500 },
      { id: "content", name: "Content Marketing", price: 1800 },
      { id: "ppc", name: "PPC Advertising", price: 2000 },
    ],
  },
  {
    id: "consulting",
    name: "Consulting Services",
    children: [
      { id: "strategy", name: "Strategy Consulting", price: 2500 },
      { id: "tech-consulting", name: "Technology Consulting", price: 3000 },
      { id: "business", name: "Business Consulting", price: 2800 },
    ],
  },
]