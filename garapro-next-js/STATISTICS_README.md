# Statistics System

## Tổng quan

Hệ thống Statistics được thiết kế để cung cấp phân tích dữ liệu toàn diện và real-time monitoring cho admin dashboard. Hệ thống bao gồm Advanced Analytics, Real-time Analytics, và Performance Analytics.

## Tính năng chính

### 1. Advanced Statistics
- **Comprehensive Dashboard**: Dashboard với 4 tabs chính (Overview, Revenue Analytics, User Analytics, System Performance)
- **Revenue Analytics**: Phân tích doanh thu chi tiết với breakdown theo category
- **User Analytics**: Phân tích người dùng với demographics và growth tracking
- **Top Performers**: Bảng xếp hạng các garage có hiệu suất cao nhất
- **Export Functionality**: Xuất dữ liệu analytics

### 2. Real-time Analytics
- **Live Metrics**: Metrics real-time với animated indicators
- **Live Activity Feed**: Feed hoạt động real-time với geographic data
- **System Health Monitoring**: Monitoring sức khỏe hệ thống
- **Live Alerts**: Hệ thống cảnh báo real-time
- **Geographic Distribution**: Phân bố địa lý người dùng

### 3. Performance Analytics
- **Performance Metrics**: Metrics chi tiết (CPU, Memory, Disk, Network)
- **Performance Alerts**: Cảnh báo hiệu suất hệ thống
- **Performance Reports**: Báo cáo hiệu suất với recommendations
- **Slow Queries Analysis**: Phân tích các query chậm
- **Performance Trends**: Xu hướng hiệu suất theo thời gian

## Cấu trúc thư mục

```
src/
├── app/admin/statistics/
│   ├── page.tsx                    # Trang chính Statistics
│   ├── advanced/page.tsx           # Advanced Analytics
│   ├── realtime/page.tsx           # Real-time Analytics
│   └── performance/page.tsx        # Performance Analytics
├── components/admin/
│   ├── AdvancedStatistics.tsx      # Component Advanced Analytics
│   ├── RealTimeAnalytics.tsx       # Component Real-time Analytics
│   └── PerformanceAnalytics.tsx    # Component Performance Analytics
├── components/ui/
│   └── tabs.tsx                    # Tabs component
├── types/
│   └── statistics.ts               # TypeScript interfaces
└── services/
    └── statistics-service.ts       # API service layer
```

## Components

### AdvancedStatistics
Component chính cho Advanced Analytics với các tính năng:
- Multi-tab dashboard design
- Revenue breakdown by category
- User growth tracking
- Geographic distribution
- Top performers analysis
- Export functionality

### RealTimeAnalytics
Component cho Real-time monitoring với:
- Live metrics với animated indicators
- Real-time activity feed
- Geographic data visualization
- System health monitoring
- Live alerts system

### PerformanceAnalytics
Component cho Performance monitoring với:
- Detailed performance metrics
- Performance alerts và reports
- Slow queries analysis
- Performance recommendations
- Trend analysis

## API Endpoints

### Overview Analytics
- `GET /api/statistics/overview` - Lấy dữ liệu overview
- `GET /api/statistics/metrics` - Lấy metrics
- `GET /api/statistics/dashboard` - Lấy dashboard data

### Real-time Analytics
- `GET /api/statistics/realtime/metrics` - Lấy real-time metrics
- `GET /api/statistics/realtime/activities` - Lấy live activities
- `GET /api/statistics/realtime/geographic` - Lấy geographic data

### Performance Analytics
- `GET /api/statistics/performance/metrics` - Lấy performance metrics
- `GET /api/statistics/performance/alerts` - Lấy performance alerts
- `GET /api/statistics/performance/reports` - Lấy performance reports
- `GET /api/statistics/performance/slow-queries` - Lấy slow queries

### Charts and Export
- `GET /api/statistics/charts` - Lấy chart data
- `GET /api/statistics/export` - Xuất statistics
- `POST /api/statistics/reports` - Tạo reports

## Types

### MetricData
```typescript
interface MetricData {
  id: string
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  bgColor: string
  trend: number[]
  details: Record<string, any>
}
```

### RealTimeMetric
```typescript
interface RealTimeMetric {
  id: string
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  bgColor: string
  trend: number[]
  isLive: boolean
}
```

### PerformanceMetric
```typescript
interface PerformanceMetric {
  id: string
  name: string
  current: number
  average: number
  peak: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: number[]
  description: string
}
```

## Tính năng nâng cao

### 1. Real-time Monitoring
- WebSocket connections cho real-time updates
- Live activity feed với geographic data
- System health monitoring
- Performance alerts

### 2. Advanced Analytics
- Multi-dimensional data analysis
- Custom analytics queries
- Performance trend analysis
- Geographic data visualization

### 3. Performance Monitoring
- Detailed system metrics
- Performance alerts và reports
- Slow queries analysis
- Performance recommendations

### 4. Export và Reporting
- Export data in multiple formats
- Custom report generation
- Scheduled reports
- Performance trend analysis

## Security Features

### 1. Data Protection
- Secure API endpoints
- Data encryption
- Access control
- Audit logging

### 2. Performance Security
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## UI/UX Features

### 1. Modern Design
- Clean và professional interface
- Responsive design
- Interactive charts
- Real-time indicators

### 2. User Experience
- Intuitive navigation
- Advanced filtering
- Export functionality
- Real-time updates

### 3. Data Visualization
- Progress bars
- Status badges
- Trend indicators
- Geographic data
- Performance metrics

## Future Enhancements

### 1. AI Integration
- Automated insights
- Predictive analytics
- Anomaly detection
- Performance optimization suggestions

### 2. Advanced Analytics
- Machine learning insights
- Behavioral analysis
- Custom dashboards
- Advanced reporting

### 3. Integration Capabilities
- Third-party analytics tools
- Data warehouse integration
- API ecosystem
- Custom connectors

## Deployment

### Prerequisites
- Node.js 18+
- Next.js 14+
- TypeScript
- Tailwind CSS
- Radix UI components

### Installation
```bash
npm install @radix-ui/react-tabs
npm run dev
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=your_database_url
WEBSOCKET_URL=ws://localhost:3000/ws
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

This project is licensed under the MIT License. 