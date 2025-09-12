export async function generatePdfFromHtml(htmlString, filename) {
  const [{ default: jsPDF }, html2canvas] = await Promise.all([
    import('jspdf').then(m => ({ default: m.default })),
    import('html2canvas')
  ]);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.padding = '24px';
  container.style.background = '#ffffff';
  container.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji"';
  container.innerHTML = htmlString;

  document.body.appendChild(container);
  const canvas = await html2canvas.default(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
  document.body.removeChild(container);
}

export function buildInvoiceHtml({ brand = 'Garage PRO', contact = 'Hotline: 1900 123 456 • Email: support@garagepro.com', code, date, customerName, vehicle, licensePlate, address, phone, items, taxRate = 0.1, total }) {
  const toVND = (n) => (n || 0).toLocaleString('vi-VN') + ' VNĐ';
  const taxAmount = (total || 0) * taxRate;
  const finalTotal = (total || 0) + taxAmount;
  const rows = (items || []).map(s => `
    <tr>
      <td style="padding:8px; border-bottom:1px solid #f3f4f6;">${s.name}</td>
      <td style="padding:8px; text-align:center; border-bottom:1px solid #f3f4f6;">${s.quantity}</td>
      <td style="padding:8px; text-align:right; border-bottom:1px solid #f3f4f6;">${toVND(s.price)}</td>
      <td style="padding:8px; text-align:right; border-bottom:1px solid #f3f4f6;">${toVND((s.price || 0) * (s.quantity || 0))}</td>
    </tr>
  `).join('');

  return `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div>
        <div style="font-weight:700; font-size:22px; color:#1f2937;">${brand}</div>
        <div style="font-size:12px; color:#6b7280;">${contact}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700; font-size:18px;">HÓA ĐƠN SỬA CHỮA XE</div>
        <div style="font-size:12px; color:#6b7280;">Mã: #${code} • Ngày: ${date}</div>
      </div>
    </div>
    <hr style="border:none; border-top:1px solid #e5e7eb; margin:12px 0;" />
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:14px;">
      <div>
        <div style="font-weight:600; color:#374151; margin-bottom:6px;">Thông tin khách hàng</div>
        <div><strong>Tên:</strong> ${customerName}</div>
        <div><strong>Xe:</strong> ${vehicle}</div>
        <div><strong>Biển số:</strong> ${licensePlate}</div>
        <div><strong>Địa chỉ:</strong> ${address}</div>
        <div><strong>SĐT:</strong> ${phone}</div>
      </div>
    </div>
    <div style="margin-top:16px;">
      <div style="font-weight:600; color:#374151; margin-bottom:8px;">Chi tiết dịch vụ</div>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;">Dịch vụ</th>
            <th style="text-align:center; padding:8px; border-bottom:1px solid #e5e7eb;">SL</th>
            <th style="text-align:right; padding:8px; border-bottom:1px solid #e5e7eb;">Đơn giá</th>
            <th style="text-align:right; padding:8px; border-bottom:1px solid #e5e7eb;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    <div style="margin-top:16px; display:flex; justify-content:flex-end;">
      <table style="font-size:14px;">
        <tbody>
          <tr>
            <td style="padding:4px 8px; color:#6b7280;">Tạm tính:</td>
            <td style="padding:4px 8px; text-align:right; font-weight:600;">${toVND(total)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px; color:#6b7280;">Thuế VAT (${(taxRate * 100).toFixed(0)}%):</td>
            <td style="padding:4px 8px; text-align:right; font-weight:600;">${toVND(taxAmount)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px; font-weight:700;">TỔNG CỘNG:</td>
            <td style="padding:4px 8px; text-align:right; font-weight:700;">${toVND(finalTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="margin-top:24px; font-size:12px; color:#6b7280;">Cảm ơn quý khách đã sử dụng dịch vụ của ${brand}!</div>
  `;
}

export function buildQuotationHtml({ brand = 'Garage PRO', contact = 'Hotline: 1900 123 456 • Email: support@garagepro.com', code, date, vehicle, licensePlate, issue, partsCost, laborCost, totalCost }) {
  return `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
      <div>
        <div style="font-weight:700; font-size:22px; color:#1f2937;">${brand}</div>
        <div style="font-size:12px; color:#6b7280;">${contact}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700; font-size:18px;">BÁO GIÁ SỬA CHỮA XE</div>
        <div style="font-size:12px; color:#6b7280;">Mã: #${code} • Ngày: ${date}</div>
      </div>
    </div>
    <hr style="border:none; border-top:1px solid #e5e7eb; margin:12px 0;" />
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:14px;">
      <div>
        <div style="font-weight:600; color:#374151; margin-bottom:6px;">Thông tin xe</div>
        <div><strong>Xe:</strong> ${vehicle}</div>
        <div><strong>Biển số:</strong> ${licensePlate}</div>
        <div><strong>Vấn đề:</strong> ${issue}</div>
      </div>
    </div>
    <div style="margin-top:16px;">
      <div style="font-weight:600; color:#374151; margin-bottom:8px;">Chi tiết chi phí</div>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tbody>
          <tr>
            <td style="padding:8px;">Chi phí phụ tùng</td>
            <td style="padding:8px; text-align:right;">${(partsCost || 0).toLocaleString('vi-VN')} VNĐ</td>
          </tr>
          <tr>
            <td style="padding:8px;">Chi phí nhân công</td>
            <td style="padding:8px; text-align:right;">${(laborCost || 0).toLocaleString('vi-VN')} VNĐ</td>
          </tr>
          <tr>
            <td style="padding:8px; font-weight:700;">Tổng cộng</td>
            <td style="padding:8px; text-align:right; font-weight:700;">${(totalCost || 0).toLocaleString('vi-VN')} VNĐ</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="margin-top:24px; font-size:12px; color:#6b7280;">Cảm ơn quý khách đã tin tưởng ${brand}!</div>
  `;
}
