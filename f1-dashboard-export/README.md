# F1 Racing Dashboard - Local Environment

A standalone server and shared utilities for the F1 Sales Racing Dashboard that can be integrated with any React application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

### 3. Test the API
```bash
# Health check
curl http://localhost:3001/api/health

# Upload Excel file (use form-data)
curl -X POST -F "file=@your-excel-file.xlsx" http://localhost:3001/api/upload-excel
```

## 📁 Project Structure

```
f1-dashboard-export/
├── server/
│   └── index.js          # Express server with API endpoints
├── shared/
│   ├── excelProcessor.js # Excel file processing logic
│   └── schema.js         # Data schemas and utilities
├── package.json
└── README.md
```

## 🔌 API Endpoints

### File Upload
- **POST** `/api/upload-excel`
  - Upload Excel file for processing
  - Content-Type: `multipart/form-data`
  - Field name: `file`

### Data Retrieval
- **GET** `/api/consultants` - Get all consultant data
- **GET** `/api/teams` - Get all team data
- **GET** `/api/company-metrics` - Get company-wide metrics
- **GET** `/api/health` - Health check

## 🏎️ Excel File Format

The system supports Excel files with these columns (flexible naming):

### Required Columns
- **Name**: Consultant/Employee name
- **Supervisor**: Manager/Team Lead name
- **Sales**: Current sales amount
- **Target**: Sales target amount

### Optional Columns
- **Team**: Team/Department name
- **Real Apps**: Application volume
- **Apps Target**: Application target
- **Leads**: Leads generated
- **Calls**: Calls made
- **Meetings**: Meetings held

## 🎯 Integration with Your React App

### 1. API Client Setup
```javascript
// In your React app
const API_BASE = 'http://localhost:3001/api';

export const dashboardAPI = {
  uploadExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/upload-excel`, {
      method: 'POST',
      body: formData
    }).then(res => res.json());
  },
  
  getConsultants: () => 
    fetch(`${API_BASE}/consultants`).then(res => res.json()),
    
  getTeams: () => 
    fetch(`${API_BASE}/teams`).then(res => res.json()),
    
  getMetrics: () => 
    fetch(`${API_BASE}/company-metrics`).then(res => res.json())
};
```

### 2. React Hook Example
```javascript
import { useState, useEffect } from 'react';
import { dashboardAPI } from './api';

export function useDashboardData() {
  const [data, setData] = useState({
    consultants: [],
    teams: [],
    metrics: null,
    loading: false
  });

  const uploadFile = async (file) => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      await dashboardAPI.uploadExcel(file);
      // Refresh data after upload
      const [consultants, teams, metrics] = await Promise.all([
        dashboardAPI.getConsultants(),
        dashboardAPI.getTeams(),
        dashboardAPI.getMetrics()
      ]);
      setData({ consultants, teams, metrics, loading: false });
    } catch (error) {
      console.error('Upload failed:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  return { ...data, uploadFile };
}
```

## 🎨 F1 Racing Theme

The dashboard uses F1 racing metaphors:

### Circuits
- **Monaco**: Premium/High-performing teams
- **Kyalami**: Standard/Developing teams

### Vehicle Types (by performance)
- 🏎️ Formula 1 (120%+ achievement)
- 🚗 Sports Car (100%+ achievement)
- 🚙 SUV (80%+ achievement)
- 🚐 Van (60%+ achievement)
- 🛻 Truck (<60% achievement)

### Performance Categories
- **Superstar**: 120%+ achievement
- **Target Achieved**: 100-119%
- **On Track**: 80-99%
- **Needs Boost**: 60-79%
- **Recovery Mode**: <60%

## 🔧 Configuration

### Environment Variables
```bash
PORT=3001                    # Server port
CORS_ORIGIN=http://localhost:3000  # Your React app URL
```

### Data Storage
Currently uses in-memory storage. For production:
1. Replace with database (PostgreSQL, MongoDB, etc.)
2. Add authentication/authorization
3. Implement data persistence
4. Add caching layer

## 🚦 Production Deployment

### Option 1: Standalone Server
Deploy the server independently and configure CORS for your domain.

### Option 2: Integrate with Existing Backend
Copy the processing logic into your existing API server.

### Option 3: Serverless Functions
Convert endpoints to serverless functions (Vercel, Netlify, AWS Lambda).

## 📊 Data Flow

1. **Upload**: Excel file → `/api/upload-excel`
2. **Process**: ExcelProcessor transforms data
3. **Store**: Data stored in memory/database
4. **Retrieve**: Frontend fetches via API endpoints
5. **Visualize**: Racing dashboard components display data

## 🛠️ Development Tips

### Custom Column Mapping
Edit `shared/excelProcessor.js` to add new column patterns:

```javascript
export const ExcelColumnMappings = {
  // Add your custom column names here
  consultant_name: ['Name', 'Employee', 'Rep', 'Your Custom Column'],
  // ...
};
```

### Performance Calculations
Modify `shared/schema.js` to adjust performance thresholds and colors.

### Error Handling
The server includes comprehensive error handling for file uploads and processing.

## 📝 License

MIT License - Feel free to use in your projects!