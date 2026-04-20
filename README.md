<div align="center">

# 🏟️ VenueIQ

**The Smart Venue Companion for Next-Gen Sporting Events**

<img src="./public/favicon.svg" width="80" alt="VenueIQ Logo">

[![React](https://img.shields.io/badge/React-18.3-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-purple.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.2-black.svg?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

*Designed for the chaos of a 33,000+ capacity crowd. Demonstrated live for **IPL 2026: Mumbai Indians vs Delhi Capitals** at Wankhede Stadium.*

</div>

<br>

**VenueIQ** is a state-of-the-art Single Page Application (SPA) built to solve the biggest pain points of attending large-scale live sports: finding the fastest entry, avoiding the longest queues, and navigating massive crowded spaces. 

It fuses **live GPS routing**, **simulated real-time density heatmaps**, and a **premium glassmorphic UI** to guide attendees effortlessly from the street to their seat.

---

## ✨ Standout Features

### 🧭 Real-Time GPS Routing
Why wander aimlessly? VenueIQ asks for browser geolocation, locks onto your coordinates, and calculates the absolute optimal gate.
*   **Haversine Scoring:** Dynamically weights your physical distance to the gate against the gate's live queue wait time.
*   **Live Compass Rose:** An animated SVG compass needle continually points toward your best entry.
*   **Context-Aware Steps:** Gives broad roadmap directions when you are far away, and granular gate-level steps when you approach the venue.

### 🔥 Semantic Crowd Heatmap
A fully custom, SVG-drawn top-down map of Wankhede Stadium that breathes with the crowd.
*   **Simulated Live Stream:** Data fluctuates every 6 seconds.
*   **Density Driven Analytics:** Teal to Red color scaling based on fullness (%).
*   **Pulsing Hotspots:** High-density zones (>75%) physically throb on the screen, alongside animated 'people dots'.

### ⏱️ Smart Queue Tracker 
Stop guessing food lines. 
*   **Color-Coded Badges:** Green (< 5m), Amber (5-15m), Red (> 15m) thresholds.
*   **Closing Gate Alerts:** When a gate is closing soon, its card pulsates with a warning amber glow and displays an independent countdown badge.

### 💬 AI Companion Ready (Prompt 2 Stub)
*   A sleek, bottom-right Floating Action Button (FAB) opens an AI chat drawer.
*   Pre-wired and beautifully animated, standing by for LLM API integration.

---

## 🎨 The Design System

We didn't use a generic template. VenueIQ is built with a bespoke, dark-mode focused aesthetic intended to wow users at first glance.

| Element | Specification | Hex / Implementation |
| :--- | :--- | :--- |
| **Primary Hue** | Deep Navy & Electric Indigo | `#0A0F2C` / `#4F35D2` |
| **Accent Glows** | Neon Teal & Warning Amber | `#1DBFA8` / `#F59E0B` |
| **Typography** | Premium Google Fonts | **Sora** (Headings) + **DM Sans** (Body) |
| **UI Paradigm** | Glassmorphism | Blur filters + subtle border overlays |
| **Motion** | Framer Motion | 300ms fade/slide transitions, layout springing |

---

## 🚀 Getting Started

No databases, no backends. Ready to run locally in seconds.

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)

### Installation

```bash
# 1. Clone or clone the directory
cd venueiq

# 2. Install dependencies
npm install

# 3. Ignite the development server
npm run dev
```

Visit the glowing portal at `http://localhost:5173`

*(Note: When prompted by your browser, **allow Location Access** to experience the GPS Compass and Live Navigation features!)*

---

## 📁 Repository Map

```text
venueiq/
├── index.html                   🛸 The Entry Portal (Sora/DM Sans injection)
├── tailwind.config.js           🎨 The Blueprint (Custom colors & keyframes)
└── src/
    ├── App.jsx                  🧠 The Brain (Motion Router & Tab Logic)
    ├── mockData.js              🗄️ The Matrix (Central Source of Truth)
    ├── utils/geoUtils.js        📐 The Math (Haversine & Scoring Algorithms)
    ├── hooks/useGeolocation.js  🛰️ The Satellite (GPS Tracker)
    └── components/
        ├── VenueHeatmap.jsx     🔥 The Stadium SVG Engine
        ├── NavigationAssistant.jsx 🧭 The Compass & Guide
        └── ...                  🧩 (Dashboards, Banners, Heroes)
```

---

<div align="center">
<p><i>Your smart venue companion. Built with precision.</i></p>
</div>
