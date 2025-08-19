# F1 Racing Dashboard - Next.js Integration Guide

## Quick Setup (5 Minutes)

### 1. Copy Files to Your Next.js Project
```bash
# Copy all extracted files to your Next.js project
cp -r f1-dashboard-nextjs-extract/* /path/to/your/nextjs-project/
```

### 2. Install Dependencies
```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip class-variance-authority clsx tailwind-merge tailwindcss-animate lucide-react date-fns framer-motion react-hook-form nanoid
```

### 3. Configure Tailwind CSS
Update your `tailwind.config.js` with the provided configuration, or merge the racing theme colors:

```js
// Add to your existing tailwind.config.js
module.exports = {
  // ... your existing config
  theme: {
    extend: {
      colors: {
        // Add F1 Racing Theme Colors
        racing: {
          navy: "var(--racing-navy)",
          orange: "var(--racing-orange)",
          teal: "var(--victory-teal)",
          blue: "var(--track-blue)",
          red: "var(--alert-red)",
          yellow: "var(--caution-orange)",
          green: "var(--success-green)",
        },
        performance: {
          superstar: "var(--superstar-color)",
          achieved: "var(--target-achieved-color)",
          ontrack: "var(--on-track-color)",
          boost: "var(--needs-boost-color)",
          recovery: "var(--recovery-mode-color)",
        },
      },
    },
  },
}
```

### 4. Import Global Styles
Add to your `_app.js` (Pages Router) or `layout.js` (App Router):

```js
// Pages Router (_app.js)
import '@/styles/f1-racing-globals.css'

// App Router (layout.js)
import '@/styles/f1-racing-globals.css'
```

### 5. Use in Your Pages
```jsx
// pages/dashboard.js (Pages Router)
import F1RacingDashboard from '@/components/F1RacingDashboard'

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sales Performance Dashboard</h1>
      <F1RacingDashboard />
    </div>
  )
}

// Or App Router (app/dashboard/page.js)
import F1RacingDashboard from '@/components/F1RacingDashboard'

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sales Performance Dashboard</h1>
      <F1RacingDashboard />
    </div>
  )
}
```

## Advanced Usage

### Custom Data Integration
```jsx
import F1RacingDashboard from '@/components/F1RacingDashboard'

export default function CustomDashboard() {
  const handleDataProcessed = (data) => {
    console.log('Processed data:', data)
    // Send to your backend, store in state, etc.
  }

  return (
    <F1RacingDashboard
      onDataProcessed={handleDataProcessed}
      className="custom-dashboard"
    />
  )
}
```

### Individual Components
```jsx
// Use individual components
import { TeamRacingView, PitCrewView, TotalProgressView } from '@/components'

export default function CustomLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TeamRacingView teams={teamsData} />
      <PitCrewView consultants={consultantsData} teams={teamsData} />
      <div className="lg:col-span-2">
        <TotalProgressView metrics={metricsData} teams={teamsData} />
      </div>
    </div>
  )
}
```

## File Structure After Integration

```
your-nextjs-project/
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── F1RacingDashboard.jsx   # Main dashboard component
│   ├── TeamRacingView.jsx      # Racing circuits view
│   ├── PitCrewView.jsx         # Team members view
│   ├── TotalProgressView.jsx   # Performance metrics
│   └── ...                     # Other racing components
├── styles/
│   ├── f1-racing-globals.css   # Global F1 theme styles
│   ├── RacingComponents.module.css
│   ├── RacingGauge.module.css
│   └── ...                     # Component-specific styles
├── utils/
│   ├── excelProcessor.js       # Excel data processing
│   ├── performanceCalculations.js
│   └── racingAnimations.js
├── hooks/
│   ├── use-mobile.tsx          # Mobile detection
│   └── use-toast.ts            # Toast notifications
└── lib/
    └── utils.ts                # Utility functions
```

## Features Included

✅ **Complete F1 Racing Dashboard**: All visual components and functionality  
✅ **Excel Upload & Processing**: Client-side data processing from Excel files  
✅ **Monaco & Kyalami Circuits**: Animated racing track visualizations  
✅ **Team Racing View**: Leaderboards and performance tracking  
✅ **Pit Crew Management**: Consultant grouping by supervisors  
✅ **Performance Gauges**: Racing-themed metrics and progress indicators  
✅ **Corporate Theme**: Banking industry colors with F1 racing metaphor  
✅ **Responsive Design**: Mobile-optimized layouts  
✅ **Toast Notifications**: User feedback system  
✅ **TypeScript Support**: Full type definitions included  

## Customization

### Theme Colors
Modify CSS variables in `styles/f1-racing-globals.css`:
```css
:root {
  --racing-navy: #002b60;      /* Your primary color */
  --racing-orange: #FF6B35;    /* Your accent color */
  /* ... other colors */
}
```

### Component Styling
Override styles using CSS modules or Tailwind classes:
```jsx
<F1RacingDashboard className="my-custom-dashboard" />
```

## Troubleshooting

### Path Alias Issues
Ensure your `next.config.js` or `tsconfig.json` includes the `@` alias:
```js
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
}
```

### Missing Dependencies
Install any missing peer dependencies:
```bash
npm install react react-dom @types/react @types/react-dom
```

## Support

For issues specific to the F1 Racing Dashboard components, check:
1. All import paths use the `@/` alias correctly
2. CSS variables are properly defined in your global styles
3. All required dependencies are installed
4. Your Next.js app supports the import aliases used

The dashboard is fully self-contained and doesn't require any external APIs or backend services.