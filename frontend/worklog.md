# Work Log

---
Task ID: 1
Agent: main
Task: Build "Causal Personalization Under Behavioral Drift" research dashboard

Work Log:
- Installed dependencies: axios, @react-three/fiber, @react-three/drei, three, @types/three (later removed three.js due to memory constraints)
- Set up design tokens in globals.css with dark theme (#0A0E14 background, teal/amber/red accents)
- Updated layout.tsx with Space Grotesk (headings), Inter (body), JetBrains Mono (stats) fonts
- Created 11 API client files in src/lib/api/: client.ts, dashboard.ts, datasets.ts, users.ts, value.ts, interventions.ts, causal.ts, counterfactual.ts, drift.ts, experiments.ts, policy.ts, models.ts, research.ts
- All API functions use safeCall wrapper with fallback placeholder data for demo mode
- Created 3 Zustand stores: datasetStore.ts, experimentStore.ts, uiStore.ts
- Created layout components: Sidebar.tsx (collapsible, grouped navigation), TopBar.tsx (breadcrumbs)
- Created chart components: AreaChartDrift.tsx, ErrorBarChart.tsx, RadarPreference.tsx (Recharts)
- Created DataTable.tsx (TanStack Table), EstimatorConfigForm.tsx, ExperimentLiveRun.tsx
- Created CausalGraph3D.tsx (SVG-based causal graph with 3 modes: ambient/interactive/static)
- Created 17 page components for all routes
- Implemented hash-based client-side router in page.tsx (single / route constraint)
- Fixed ESLint errors (set-state-in-effect, refs-during-render, variable-before-declaration)
- Replaced three.js CausalGraph3D with lightweight SVG implementation for memory stability
- Verified Dashboard page renders correctly in agent-browser with all stats and charts
- Verified Datasets page shows data table with 4 datasets
- Verified Causal Analysis page shows graph + estimation form with confounder pills

Stage Summary:
- Production-ready research dashboard with 10+ pages, all wired to API client layer
- Demo mode with comprehensive placeholder data (no backend required)
- Dark theme with Space Grotesk/Inter/JetBrains Mono typography
- Collapsible sidebar with 5 navigation groups, hash-based routing
- Recharts visualizations (area charts, bar charts, radar charts)
- TanStack Table for sortable, searchable data tables
- Zustand state management for shared dataset/experiment/UI state
- WebSocket experiment progress subscription ready (via experiments.ts)
- All API calls go through typed lib/api/*.ts files with error fallbacks
- Responsive design with mobile sidebar collapse
- prefers-reduced-motion support
- Footer sticks to bottom of viewport
