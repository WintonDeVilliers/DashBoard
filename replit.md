# Overview

The F1 Sales Racing Dashboard is a full-stack web application that transforms traditional sales data into an engaging Formula 1 racing-themed interactive experience. The system processes Excel files containing sales performance data and presents it through dynamic visualizations, leaderboards, and racing metaphors to gamify sales team performance tracking. Built with React/TypeScript frontend, Express.js backend, and comprehensive UI component library, it provides real-time analytics for banking or sales teams with supervisor and consultant hierarchies.

# User Preferences

Preferred communication style: Simple, everyday language.

## Migration Updates - August 18, 2025
- Successfully migrated from Replit Agent to Replit environment
- Applied corporate banking theme with F1 racing metaphor
- Fixed vehicle icon orientations and standardized to race car icons
- Enhanced racing gauge with milestone markers for performance levels
- Added Pit Crew view to show consultants (banking staff) supporting drivers (supervisors)
- Implemented proper "No Data Available" state handling
- Fixed critical circuit assignment bug with case-sensitivity issues in filtering logic
- Corrected Championship Standings table to show proper Monaco/Kyalami circuit assignments
- Restructured Team Racing tab with separate Monaco and Kyalami circuit sections
- Redesigned Total Progress speedometer from circular to proper semi-circular design
- Added colored sections, needle pointer, and improved milestone label visibility
- All functionality verified and working with real Excel data processing
- **Color Palette Alignment**: Updated theme to match corporate branding colors (#002b60, #002b4d, #0260f7, #e57373, #e57200) while maintaining F1 racing aesthetics

# System Architecture

## Frontend Architecture
**Framework**: React with TypeScript and Vite build system
- Component-based architecture using shadcn/ui design system
- Modular CSS with Tailwind for styling and F1 racing theme
- React Query for state management and server communication
- Wouter for lightweight client-side routing
- Responsive design with mobile-first approach

## Backend Architecture
**Framework**: Express.js with TypeScript
- RESTful API design with modular route handling
- In-memory storage using Map-based data structures
- Multer middleware for Excel file upload processing
- Real-time data processing pipeline for sales metrics
- Development hot-reload with Vite integration

## Data Processing Pipeline
**Excel Processing**: XLSX library for file parsing and data transformation
- Flexible column mapping system to handle various Excel formats
- Automatic sheet detection with fallback mechanisms
- Data validation and sanitization for consistent processing
- Real-time calculation of achievement rates and performance metrics
- Racing position assignment based on sales performance

## Database Strategy
**Current**: In-memory storage with Drizzle ORM configuration
- Temporary data persistence using JavaScript Maps
- Session-based data management for uploaded files
- Ready for PostgreSQL integration via pre-configured Drizzle setup
- Schema definitions prepared for persistent storage migration

## Performance Calculation System
**Gamification Engine**: Racing-themed performance categorization
- Five-tier performance system (Superstar, Target Achieved, On Track, Needs Boost, Recovery Mode)
- Dynamic vehicle type assignment based on achievement rates
- Circuit allocation (Monaco/Kyalami) for team differentiation
- Real-time leaderboard calculations and position tracking

## UI Component System
**Design System**: shadcn/ui with custom F1 racing theme
- Comprehensive component library with consistent styling
- Dark theme optimized for dashboard environments
- Custom CSS variables for racing-specific color schemes
- Responsive layouts with mobile navigation support

# External Dependencies

## Core Runtime Dependencies
- **Express.js**: Web server framework for API endpoints
- **React**: Frontend UI library with TypeScript support
- **Vite**: Build tool and development server
- **Drizzle ORM**: Database toolkit with PostgreSQL support
- **TanStack React Query**: Server state management and caching

## Data Processing Libraries
- **XLSX**: Excel file parsing and worksheet processing
- **Multer**: File upload handling middleware
- **Zod**: Runtime type validation and schema parsing

## UI and Styling Dependencies
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives (@radix-ui/react-*)
- **Lucide React**: Icon library for UI elements
- **Class Variance Authority**: Component variant management

## Development and Build Tools
- **TypeScript**: Static type checking and compilation
- **PostCSS**: CSS processing with Autoprefixer
- **ESBuild**: Fast JavaScript bundler for production builds

## Database and Storage
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **connect-pg-simple**: PostgreSQL session store (configured but not actively used)
- **Drizzle Kit**: Database migration and introspection tools

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class composition
- **nanoid**: Unique ID generation for records