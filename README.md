# Garage Pro - Ứng dụng Quản lý Sửa chữa Xe

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.jsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter font.

## Cấu trúc dự án

Dự án được tổ chức theo cấu trúc Next.js tiêu chuẩn:

```
/src
  /app             # Thư mục chứa các route và layout của Next.js App Router
  /components      # Các UI component có thể tái sử dụng
  /hooks           # Custom React hooks
  /utils           # Các hàm tiện ích
  /public          # Tài nguyên tĩnh
```

## Các thành phần chính

### Components

- **Header**: Thanh điều hướng phía trên với thông báo và thông tin người dùng
- **Sidebar**: Thanh điều hướng bên trái với các liên kết đến các trang khác nhau
- **Dashboard**: Trang tổng quan hiển thị số liệu và thông tin quan trọng

### Hooks

- **useNotifications**: Quản lý trạng thái thông báo trong ứng dụng
- **useRepairRequests**: Quản lý dữ liệu yêu cầu sửa chữa xe

### Utils

- **pdf.js**: Các hàm tạo PDF từ HTML và xây dựng mẫu hóa đơn/báo giá
- **index.js**: Các hàm tiện ích như định dạng tiền tệ, ngày tháng, tạo ID, v.v.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
