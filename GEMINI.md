# Project ARKR.CA - Portfolio Website Plan

## Overview
A single-page personal portfolio website for Anish Reddy Kanamatha Reddy (arkr.ca). The site acts as a digital resume and brand center.

## Design System
- **Background:** Black (`#1a1a1a).
- **Primary Gradient:** Linear gradient of Pink (`#f960eb`), Orange (`#ff854d`), and Yellow (`#fff41f`).
- **Typography:** 
  - Headings: `Radley` (Serif)
  - Body: `Inter` (Sans-serif)
- **Visuals:** 
  - Curved corners (border-radius).
  - Gradient glows for hover effects.
  - Text gradients for headings.

## Structure

### Header / Navbar
- **Position:** Fixed, Top Center.
- **Links:** Home, Experience, Projects, Activities, Blog.
- **Action:** Resume download button (Down arrow icon).
- **Style:** Glassmorphism (blur).

### Sections
1.  **Home (Landing):**
    - "Hello, I am Anish!"
    - Subtitle/Basic Info
2.  **Experience:**
    - Cards for past internships.
    - Hover glow effects.
3.  **Projects:**
    - Cards with summary, GitHub link, project website link.
4.  **Activities (Memory Wall):**
    - Categories: Founding, Winning, Judging, Mentoring, Leading, Awards.

### Footer
- **Center/Feature:** Coordinates `43°28'N, 80°31'W` which reveal "Waterloo, ON" on hover.

### Global Elements
- **Stamp:** `assets/mainlogo.png` fixed at the Bottom Left.
- **Spotify Widget:** Fixed at the Bottom Right.
- **Scroll:** Smooth scrolling between sections.

## Technical Stack
- **HTML5:** Semantic structure.
- **CSS3:** Flexbox/Grid, CSS Variables for gradients, Media Queries for responsiveness.
- **JavaScript (ES6+):** DOM manipulation, Scroll handling, Typing/Greeting effect.