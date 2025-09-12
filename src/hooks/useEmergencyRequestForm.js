import { useState } from 'react';
import { validateTextField, validatePhoneField, validateSelectField, validateLicensePlateField } from '@/utils/validate/formValidation';

/**
 * Hook quản lý form gửi yêu cầu cứu hộ khẩn cấp
 * - Đóng gói state, validate, và submit
 * - Cho phép truyền hàm submit API từ bên ngoài
 */
export default function useEmergencyRequestForm(initialValue) {
  const [formData, setFormData] = useState(
    initialValue || {
      vehicle: '',
      licensePlate: '',
      issue: '',
      location: '',
      phone: '',
      priority: 'high'
    }
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateAll = () => {
    const nextErrors = {};
    const vehicleCheck = validateTextField(formData.vehicle, { required: true, minLength: 2, label: 'Thông tin xe' });
    if (!vehicleCheck.isValid) nextErrors.vehicle = vehicleCheck.error;
    const lpCheck = validateLicensePlateField(formData.licensePlate, { required: true, label: 'Biển số xe' });
    if (!lpCheck.isValid) nextErrors.licensePlate = lpCheck.error;
    const issueCheck = validateTextField(formData.issue, { required: true, minLength: 3, label: 'Vấn đề gặp phải' });
    if (!issueCheck.isValid) nextErrors.issue = issueCheck.error;
    const locationCheck = validateTextField(formData.location, { required: true, minLength: 5, label: 'Vị trí hiện tại' });
    if (!locationCheck.isValid) nextErrors.location = locationCheck.error;
    const phoneCheck = validatePhoneField(formData.phone, { required: true, label: 'Số điện thoại' });
    if (!phoneCheck.isValid) nextErrors.phone = phoneCheck.error;
    const priorityCheck = validateSelectField(formData.priority, { required: true, allowedValues: ['high', 'medium', 'low'], label: 'Mức độ khẩn cấp' });
    if (!priorityCheck.isValid) nextErrors.priority = priorityCheck.error;
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  /**
   * onSubmit: (payload) => Promise<any>
   * - payload sẽ là formData hiện tại
   */
  const handleSubmit = async (onSubmit) => {
    const nextErrors = validateAll();
    if (Object.keys(nextErrors).length > 0) return { ok: false, errors: nextErrors };
    if (typeof onSubmit !== 'function') return { ok: true };
    try {
      setSubmitting(true);
      await onSubmit(formData);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFormData({ vehicle: '', licensePlate: '', issue: '', location: '', phone: '', priority: 'high' });
    setErrors({});
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    submitting,
    handleChange,
    handleSubmit,
    validateAll,
    reset
  };
}


