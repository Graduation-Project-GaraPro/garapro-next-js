# Admin Dashboard - Garapro Next.js

A professional admin dashboard for managing the Garapro platform with comprehensive system administration features.

## Features

### 🎯 Core Admin Functions

- **User Management**: View, ban, unban, and manage all registered users
- **Garage Management**: Manage garage accounts and their domains
- **Security Management**: Configure security policies, password rules, and session settings
- **Statistics & Analytics**: View detailed system metrics and performance data
- **System Logs**: Monitor application logs, errors, and system events

### 📊 Dashboard Overview

- Real-time system statistics
- Quick action buttons for common admin tasks
- Recent activity feed
- System performance monitoring
- Security alerts and notifications

### 🔐 Security Features

- Password policy management
- Session timeout configuration
- IP blocking and access control
- Two-factor authentication settings
- Security alert monitoring

### 📈 Analytics & Reporting

- User growth charts
- Garage performance metrics
- System uptime monitoring
- Export functionality for reports
- Real-time data visualization

## Project Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Admin layout with sidebar
│       ├── page.tsx            # Main dashboard
│       ├── users/
│       │   └── page.tsx        # User management
│       ├── garages/
│       │   └── page.tsx        # Garage management
│       ├── security/
│       │   └── page.tsx        # Security settings
│       ├── statistics/
│       │   └── page.tsx        # Analytics dashboard
│       └── logs/
│           └── page.tsx        # System logs
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx    # Navigation sidebar
│       ├── AdminHeader.tsx     # Top header with notifications
│       ├── DashboardOverview.tsx # Main dashboard metrics
│       ├── QuickActions.tsx    # Quick action buttons
│       ├── RecentActivity.tsx  # Activity feed
│       ├── SystemStats.tsx     # System performance
│       ├── UserManagement.tsx  # User management interface
│       ├── GarageManagement.tsx # Garage management interface
│       ├── SecurityManagement.tsx # Security settings
│       ├── StatisticsDashboard.tsx # Analytics dashboard
│       └── SystemLogs.tsx      # Log monitoring
└── components/
    └── ui/                     # Reusable UI components
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- Next.js 15+
- React 19+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Add required Radix UI dependencies:
```bash
npm install @radix-ui/react-progress @radix-ui/react-switch
```

3. Run the development server:
```bash
npm run dev
```

4. Navigate to the admin dashboard:
```
http://localhost:3000/admin
```

## Key Components

### AdminSidebar
- Collapsible navigation menu
- Organized sections for different admin functions
- Active state indicators
- User profile section

### DashboardOverview
- Key metrics cards with trends
- Color-coded status indicators
- Real-time data updates
- Responsive grid layout

### UserManagement
- Search and filter functionality
- Bulk actions for user management
- Ban/unban confirmation dialogs
- User role management

### SecurityManagement
- Password policy configuration
- Session management settings
- Security alert monitoring
- Access control settings

### StatisticsDashboard
- Interactive charts and graphs
- Time range selectors
- Export functionality
- Performance metrics

### SystemLogs
- Real-time log streaming
- Log level filtering
- Search and export capabilities
- Detailed log inspection

## Styling

The dashboard uses:
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Custom color scheme** with professional appearance

## Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Collapsible sidebar on mobile
- Touch-friendly interface

## Security Considerations

- Role-based access control
- Secure authentication
- Input validation
- XSS protection
- CSRF protection

## Performance

- Optimized component rendering
- Lazy loading for large datasets
- Efficient state management
- Minimal bundle size

## Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced reporting
- [ ] API integration
- [ ] Backup and restore
- [ ] Audit logging

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add comprehensive tests
5. Follow accessibility guidelines

## License

This project is part of the Garapro platform and follows the same licensing terms.

---

**Note**: This admin dashboard is designed for system administrators and requires proper authentication and authorization to access. 