// constants/partQualityOptions.ts
import { QualityOption } from '@/types/quotation';

export const partQualityOptions: Record<string, QualityOption[]> = {
  'Dầu nhớt': [
    { 
      id: 1, 
      name: "Shell Helix Ultra", 
      price: 650000, 
      level: 'premium', 
      warranty: '12 tháng',
      description: "Dầu tổng hợp cao cấp, bảo vệ tối ưu"
    },
    { 
      id: 2, 
      name: "Castrol GTX", 
      price: 450000, 
      level: 'standard', 
      warranty: '6 tháng',
      description: "Dầu bán tổng hợp chất lượng tốt"
    },
    { 
      id: 3, 
      name: "Total Quartz", 
      price: 320000, 
      level: 'economy', 
      warranty: '3 tháng',
      description: "Dầu khoáng giá rẻ, đủ tiêu chuẩn"
    }
  ],
  'Lốp': [
    { 
      id: 4, 
      name: "Michelin Primacy 4", 
      price: 2800000, 
      level: 'premium', 
      warranty: '60,000 km',
      description: "Lốp cao cấp, độ bám đường tốt"
    },
    { 
      id: 5, 
      name: "Bridgestone Turanza", 
      price: 2200000, 
      level: 'standard', 
      warranty: '40,000 km',
      description: "Lốp chất lượng tốt, giá hợp lý"
    },
    { 
      id: 6, 
      name: "Kumho Solus", 
      price: 1600000, 
      level: 'economy', 
      warranty: '25,000 km',
      description: "Lốp tiết kiệm, phù hợp city"
    }
  ],
  'Phanh': [
    { 
      id: 7, 
      name: "Brembo Premium", 
      price: 1200000, 
      level: 'premium', 
      warranty: '24 tháng',
      description: "Má phanh cao cấp, độ bền cao"
    },
    { 
      id: 8, 
      name: "Akebono ProACT", 
      price: 800000, 
      level: 'standard', 
      warranty: '12 tháng',
      description: "Má phanh chính hãng OEM"
    },
    { 
      id: 9, 
      name: "OEM Standard", 
      price: 500000, 
      level: 'economy', 
      warranty: '6 tháng',
      description: "Má phanh tiêu chuẩn phổ thông"
    }
  ],
  'Bảo dưỡng': [
    { 
      id: 10, 
      name: "Mann Filter", 
      price: 250000, 
      level: 'premium', 
      warranty: '15,000 km',
      description: "Lọc cao cấp Đức, chất lượng tốt"
    },
    { 
      id: 11, 
      name: "Bosch", 
      price: 150000, 
      level: 'standard', 
      warranty: '10,000 km',
      description: "Lọc chính hãng, độ tin cậy cao"
    },
    { 
      id: 12, 
      name: "OEM", 
      price: 80000, 
      level: 'economy', 
      warranty: '5,000 km',
      description: "Lọc tiêu chuẩn, giá cả phải chăng"
    }
  ],
  'Điện': [
    { 
      id: 13, 
      name: "Varta Silver Dynamic", 
      price: 2500000, 
      level: 'premium', 
      warranty: '36 tháng',
      description: "Bình ắc quy cao cấp Đức"
    },
    { 
      id: 14, 
      name: "GS Astra", 
      price: 1800000, 
      level: 'standard', 
      warranty: '24 tháng',
      description: "Ắc quy chất lượng tốt Nhật Bản"
    },
    { 
      id: 15, 
      name: "3K Premium", 
      price: 1200000, 
      level: 'economy', 
      warranty: '12 tháng',
      description: "Ắc quy trong nước, giá rẻ"
    }
  ]
};