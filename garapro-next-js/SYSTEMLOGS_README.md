# System Logs System

## Tổng quan

Hệ thống System Logs được thiết kế để cung cấp quản lý và phân tích logs toàn diện cho admin dashboard. Hệ thống bao gồm Advanced System Logs, Log Analytics, và Log Management.

## Tính năng chính

### 1. Advanced System Logs
- **Comprehensive Log Viewing**: Xem logs với đầy đủ thông tin chi tiết
- **Real-time Monitoring**: Monitoring logs real-time với live updates
- **Advanced Filtering**: Lọc logs theo level, source, user, environment
- **Detailed Log Information**: Thông tin chi tiết bao gồm stack trace, request details
- **Export Functionality**: Xuất logs với nhiều format khác nhau

### 2. Log Analytics
- **Performance Metrics**: Metrics về error rate, warning rate, response time
- **Top Errors Analysis**: Phân tích các lỗi phổ biến nhất
- **Service Performance**: Hiệu suất của từng service
- **Geographic Distribution**: Phân bố logs theo region
- **Recommendations**: Đề xuất cải thiện dựa trên phân tích

### 3. Log Management
- **Log Configuration**: Cấu hình thu thập và lưu trữ logs
- **Retention Policies**: Chính sách lưu trữ và cleanup
- **Export/Import**: Xuất nhập logs từ external sources
- **Storage Management**: Quản lý dung lượng lưu trữ

## Cấu trúc thư mục

```
src/
├── app/admin/logs/
│   ├── page.tsx                    # Trang chính System Logs
│   ├── analytics/page.tsx          # Log Analytics
│   └── management/page.tsx         # Log Management
├── components/admin/
│   ├── AdvancedSystemLogs.tsx     # Component chính System Logs
│   ├── LogAnalytics.tsx            # Component Log Analytics
│   └── LogManagement.tsx           # Component Log Management
├── types/
│   └── logs.ts                     # TypeScript interfaces
└── services/
    └── log-service.ts              # API service layer
```

## Components

### AdvancedSystemLogs
Component chính cho System Logs với các tính năng:
- Real-time log monitoring
- Advanced filtering và search
- Detailed log information với stack trace
- Export functionality
- Live/Static mode switching

### LogAnalytics
Component cho Log Analytics với:
- Performance metrics và trends
- Top errors analysis
- Service performance monitoring
- Geographic distribution
- Actionable recommendations

### LogManagement
Component cho Log Management với:
- Log configuration management
- Retention policies
- Export/Import functionality
- Storage management

## API Endpoints

### Log Retrieval
- `GET /api/logs` - Lấy logs với filters
- `GET /api/logs/stats` - Lấy log statistics
- `GET /api/logs/{id}` - Lấy log chi tiết
- `GET /api/logs/search` - Tìm kiếm logs

### Log Analytics
- `GET /api/logs/analytics` - Lấy analytics data
- `GET /api/logs/analytics/trends` - Lấy trends data

### Log Configuration
- `GET /api/logs/configs` - Lấy log configurations
- `POST /api/logs/configs` - Tạo log configuration
- `PATCH /api/logs/configs/{id}` - Cập nhật log configuration
- `DELETE /api/logs/configs/{id}` - Xóa log configuration

### Retention Policies
- `GET /api/logs/retention` - Lấy retention policies
- `POST /api/logs/retention` - Tạo retention policy
- `PATCH /api/logs/retention/{id}` - Cập nhật retention policy

### Export/Import
- `POST /api/logs/export` - Xuất logs
- `POST /api/logs/import` - Import logs

### Log Cleanup
- `POST /api/logs/cleanup/{policyId}` - Cleanup logs theo policy

### Real-time Streaming
- `WS /api/logs/stream` - Real-time log streaming

### Log Alerts
- `GET /api/logs/alerts` - Lấy log alerts
- `PATCH /api/logs/alerts/{id}/resolve` - Resolve alert

## Types

### LogEntry
```typescript
interface LogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info' | 'debug' | 'critical'
  message: string
  source: string
  user: string
  ip: string
  details: string
  stackTrace?: string
  sessionId?: string
  requestId?: string
  duration?: number
  statusCode?: number
  userAgent?: string
  endpoint?: string
  method?: string
  responseSize?: number
  tags: string[]
  environment: 'production' | 'staging' | 'development'
  region: string
  service: string
}
```

### LogConfig
```typescript
interface LogConfig {
  id: string
  name: string
  level: string
  enabled: boolean
  retention: number
  maxSize: number
  format: string
  destination: string
  lastModified: string
  status: 'active' | 'inactive' | 'error'
}
```

### LogAnalytics
```typescript
interface LogAnalytics {
  totalLogs: number
  errorRate: number
  warningRate: number
  averageResponseTime: number
  topErrors: Array<{
    message: string
    count: number
    percentage: number
  }>
  servicePerformance: Array<{
    service: string
    totalRequests: number
    errors: number
    avgResponseTime: number
    successRate: number
  }>
}
```

## Tính năng nâng cao

### 1. Real-time Monitoring
- WebSocket connections cho real-time log streaming
- Live log updates với detailed information
- Real-time filtering và search
- Performance monitoring

### 2. Advanced Analytics
- Multi-dimensional log analysis
- Error pattern recognition
- Performance trend analysis
- Service health monitoring

### 3. Log Management
- Comprehensive log configuration
- Retention policy management
- Storage optimization
- Export/Import capabilities

### 4. Security và Compliance
- Log encryption
- Access control
- Audit logging
- Compliance reporting

## Security Features

### 1. Data Protection
- Secure log storage
- Data encryption
- Access control
- Audit logging

### 2. Log Security
- Log integrity verification
- Tamper detection
- Secure transmission
- Backup và recovery

## UI/UX Features

### 1. Modern Design
- Clean và professional interface
- Responsive design
- Interactive log viewing
- Real-time indicators

### 2. User Experience
- Intuitive navigation
- Advanced filtering
- Export functionality
- Real-time updates

### 3. Data Visualization
- Log level indicators
- Performance metrics
- Geographic distribution
- Trend analysis

## Future Enhancements

### 1. AI Integration
- Automated log analysis
- Anomaly detection
- Predictive maintenance
- Intelligent alerting

### 2. Advanced Analytics
- Machine learning insights
- Pattern recognition
- Predictive analytics
- Custom dashboards

### 3. Integration Capabilities
- Third-party log tools
- SIEM integration
- Cloud logging services
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
LOG_STORAGE_PATH=/var/logs
LOG_RETENTION_DAYS=30
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

This project is licensed under the MIT License. 