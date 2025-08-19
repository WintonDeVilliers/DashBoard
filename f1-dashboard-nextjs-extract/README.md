# F1 Racing Dashboard - Next.js Integration Package

This package contains the essential components, styles, and utilities extracted from the standalone F1 Racing Dashboard for integration into existing Next.js applications.

## Package Contents

### 📁 `/components` - React Components
- **Core Dashboard Components**: All F1 racing themed components ready for Next.js pages
- **UI Components**: Complete shadcn/ui component library 
- **Racing Visualizations**: Track animations, gauges, and racing-themed data displays

### 📁 `/styles` - CSS & Styling
- **Global Styles**: F1 racing theme with corporate color palette
- **Component Styles**: Modular CSS for all dashboard components
- **CSS Variables**: Complete design system configuration

### 📁 `/utils` - Utilities & Helpers  
- **Data Processing**: Excel file processing and data transformation
- **Performance Calculations**: Racing metrics and achievement calculations
- **Helper Functions**: Utilities for class merging, animations, and data formatting

### 📁 `/hooks` - Custom React Hooks
- **Mobile Detection**: Responsive design hooks
- **Toast Notifications**: User feedback system
- **State Management**: Custom hooks for dashboard state

### 📁 `/lib` - Core Libraries
- **Utility Functions**: Essential helper functions
- **Type Definitions**: TypeScript types for data structures

## Integration Instructions

1. **Copy all folders** to your Next.js project
2. **Install dependencies** listed in package-dependencies.txt
3. **Add Tailwind configuration** from tailwind.config.js
4. **Import global styles** in your _app.js/layout.js
5. **Use components** in your Next.js pages structure

## Key Features Included

✅ Complete F1 Racing Dashboard UI  
✅ Excel data processing capabilities  
✅ Monaco & Kyalami circuit visualizations  
✅ Team racing leaderboards  
✅ Pit crew management views  
✅ Performance gauges and metrics  
✅ Responsive design system  
✅ Corporate banking theme integration  

## Dependencies Required

See `package-dependencies.txt` for complete list of npm packages needed.

## Usage Example

```jsx
// In your Next.js page
import { TeamRacingView, PitCrewView, TotalProgressView } from '@/components/f1-dashboard'
import '@/styles/f1-racing-theme.css'

export default function DashboardPage() {
  return (
    <div>
      <TeamRacingView teams={teamsData} />
      <PitCrewView consultants={consultantsData} />
      <TotalProgressView metrics={metricsData} />
    </div>
  )
}
```

## Notes

- No server dependencies - all client-side React components
- Compatible with Next.js pages and app router  
- Maintains original F1 racing theme and functionality
- Ready for integration into existing applications