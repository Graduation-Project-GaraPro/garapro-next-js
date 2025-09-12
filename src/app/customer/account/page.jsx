"use client";

import { useState, useEffect } from 'react';
import { User, X, Bell, Shield, CreditCard, Settings } from 'lucide-react';
import { isValidDate } from '@/utils/validate';
import { ProfileTab, NotificationsTab, SecurityTab,BillingTab, SettingsTab } from '@/features/account';


export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinDate: '2024-01-15',
    totalServices: 12,
    totalSpent: 15000000
  });
  
  // Xác thực ngày tháng khi component được tải
  useEffect(() => {
    // Xác thực joinDate
    if (!isValidDate(userData.joinDate)) {
      console.error('Ngày tham gia không hợp lệ');
      // Đặt lại ngày tham gia thành ngày hiện tại nếu không hợp lệ
      setUserData(prev => ({
        ...prev,
        joinDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, []);

  const [formData, setFormData] = useState(userData);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saveToast, setSaveToast] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    marketing: false
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Xác thực nếu trường là ngày tháng
    if (name === 'joinDate' || name.includes('date') || name.includes('Date')) {
      if (!validateDate(value)) {
        alert('Ngày tháng không hợp lệ. Vui lòng nhập theo định dạng YYYY-MM-DD');
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Preview avatar
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          avatar: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setUserData(formData);
    setIsEditing(false);
    setSaveToast('Thông tin đã được cập nhật!');
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSecurityChange = (key) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleChangePassword = () => {
    setShowPasswordForm(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // Simulate password change
    alert('Mật khẩu đã được thay đổi thành công!');
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordCancel = () => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'billing', label: 'Thanh toán', icon: CreditCard },
    { id: 'settings', label: 'Cài đặt', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {saveToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">{saveToast}</div>
      )}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <User className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tài khoản</h2>
          <p className="text-gray-600">Quản lý thông tin và cài đặt tài khoản</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <ProfileTab
              isEditing={isEditing}
              userData={userData}
              formData={formData}
              onChange={(action) => {
                if (action.type === 'toggleEdit') setIsEditing(action.value);
                if (action.type === 'field') setFormData(prev => ({ ...prev, [action.name]: action.value }));
              }}
              onSave={handleSave}
              onCancel={handleCancel}
              onAvatarChange={handleAvatarChange}
            />
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <NotificationsTab notifications={notifications} onToggle={handleNotificationChange} />
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <SecurityTab
              securitySettings={securitySettings}
              onToggleTwoFactor={() => handleSecurityChange('twoFactor')}
              onToggleLoginAlerts={() => handleSecurityChange('loginAlerts')}
              onChangeSessionTimeout={(val) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: val }))}
              onOpenChangePassword={handleChangePassword}
            />
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && <BillingTab />}

          {/* Settings Tab */}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
              <button 
                onClick={handlePasswordCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handlePasswordCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}