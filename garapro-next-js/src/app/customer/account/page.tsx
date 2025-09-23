"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { User, X, Bell, Shield, CreditCard, Settings } from 'lucide-react';
import { isValidDate } from '@/utils/validate';
import { validateTextField, validateEmailField, validatePhoneField, validatePasswordField, validateConfirmPasswordField } from '@/utils/validate/formValidation';
import { ProfileTab, NotificationsTab, SecurityTab, BillingTab, SettingsTab } from '@/features/account';
import { useCurrentUser } from '@/hooks/customer/useCurrentUser';
import { useNotifications } from '@/hooks/customer/useNotifications';

// Define interfaces for password modal
interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileAction {
  type: 'toggleEdit' | 'field' | 'save' | 'cancel';
  value?: boolean;
  name?: string;
}

// // Add validateDate function since it was used but not defined
// const validateDate = (dateString: string): boolean => {
//   if (!dateString) return false;
//   const date = new Date(dateString);
//   return date instanceof Date && !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
// };

export default function AccountPage() {
  // Use custom hooks
  const { 
    user, 
    loading, 
    error, 
    isUpdating, 
    isChangingPassword,
    updateUserProfile, 
    changePassword, 
    updatePreferences, 
    updateAvatar 
  } = useCurrentUser();
  
  const { notifications: userNotifications, markAsRead, markAllAsRead } = useNotifications();
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saveToast, setSaveToast] = useState<string>('');
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password errors state
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '/avatars/default.png'
  });
  
  // Form errors state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Update formData when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate fields
    let errorMessage = '';
    
    // Validate if field is date
    if (name === 'joinDate' || name.includes('date') || name.includes('Date')) {
      if (!isValidDate(value)) {
        errorMessage = 'Invalid date format. Please enter in YYYY-MM-DD format';
      }
    } else if (name === 'email') {
      // Validate email
      const validation = validateEmailField(value, { required: true, label: 'Email' });
      if (!validation.isValid) {
        errorMessage = validation.error;
      }
    } else if (name === 'phone') {
      // Validate phone number
      const validation = validatePhoneField(value, { required: true, label: 'Phone number' });
      if (!validation.isValid) {
        errorMessage = validation.error;
      }
    } else if (name === 'name') {
      // Validate name
      const validation = validateTextField(value, { required: true, minLength: 2, label: 'Full name' });
      if (!validation.isValid) {
        errorMessage = validation.error;
      }
    } else if (name === 'address') {
      // Validate address
      const validation = validateTextField(value, { required: false, label: 'Address' });
      if (!validation.isValid) {
        errorMessage = validation.error;
      }
    }
    
    // Update error for the changing field
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    // Always update field value, even if there's an error
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Preview avatar
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            avatar: event.target?.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      if (avatarFile) {
        await updateAvatar(avatarFile);
      }
      
      await updateUserProfile(formData);
      setIsEditing(false);
      setSaveToast('Information has been updated!');
      setTimeout(() => setSaveToast(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveToast('An error occurred while updating information!');
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  const handleCancel = (): void => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar
      });
    }
    setIsEditing(false);
  };

  const handleNotificationChange = async (key: string): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedPreferences = {
        ...user.preferences,
        notifications: {
          ...user.preferences.notifications,
          [key]: !user.preferences.notifications[key as keyof typeof user.preferences.notifications]
        }
      };
      
      await updatePreferences(updatedPreferences);
      setSaveToast('Notification settings have been updated!');
      setTimeout(() => setSaveToast(''), 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setSaveToast('An error occurred while updating notification settings!');
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  const handleSecurityChange = async (key: string, value?: boolean | number): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedPreferences = {
        ...user.preferences,
        [key]: value !== undefined ? value : !user.preferences[key as keyof typeof user.preferences]
      };
      
      await updatePreferences(updatedPreferences);
      setSaveToast('Security settings have been updated!');
      setTimeout(() => setSaveToast(''), 3000);
    } catch (error) {
      console.error('Error updating security settings:', error);
      setSaveToast('An error occurred while updating security settings!');
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleChangePassword = (): void => {
    setShowPasswordForm(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Initialize new error object
    const newPasswordErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    // Validate current password
    const currentPasswordValidation = validateTextField(passwordData.currentPassword, {
      required: true,
      label: 'Current password'
    });
    if (!currentPasswordValidation.isValid) {
      newPasswordErrors.currentPassword = currentPasswordValidation.error;
    }
    
    // Validate new password
    const newPasswordValidation = validatePasswordField(passwordData.newPassword, {
      required: true,
      minLength: 6,
      requireNumber: true,
      label: 'New password'
    });
    if (!newPasswordValidation.isValid) {
      newPasswordErrors.newPassword = newPasswordValidation.error;
    }
    
    // Validate confirm password
    const confirmPasswordValidation = validateConfirmPasswordField(
      passwordData.confirmPassword,
      passwordData.newPassword,
      { required: true, label: 'Confirm password' }
    );
    if (!confirmPasswordValidation.isValid) {
      newPasswordErrors.confirmPassword = confirmPasswordValidation.error;
    }
    
    // Update error state
    setPasswordErrors(newPasswordErrors);
    
    // If there are errors, don't continue
    if (newPasswordErrors.currentPassword || newPasswordErrors.newPassword || newPasswordErrors.confirmPassword) {
      return;
    }

    try {
      await changePassword(passwordData);
      setSaveToast('Password has been changed successfully!');
      setTimeout(() => setSaveToast(''), 3000);
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setSaveToast('An error occurred while changing password!');
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  const handlePasswordCancel = (): void => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Handler for ProfileTab with proper action handling
  const handleProfileAction = (action: ProfileAction | (() => void)): void => {
    if (typeof action === 'function') {
      action();
      return;
    }
    
    switch (action.type) {
      case 'toggleEdit':
        if (action.value !== undefined) {
          setIsEditing(action.value);
        }
        break;
      case 'field':
        if (action.name && action.value !== undefined) {
          setFormData(prev => ({ ...prev, [action.name as string]: action.value }));
        }
        break;
      case 'save':
        handleSave();
        break;
      case 'cancel':
        handleCancel();
        break;
      default:
        console.warn('Unknown action type:', (action as any).type);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Personal Information', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">An error occurred</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {saveToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {saveToast}
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <User className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Account</h2>
          <p className="text-gray-600">Manage your account information and settings</p>
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
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      activeTab === tab.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'hover:bg-gray-100'
                    }`}
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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab
              isEditing={isEditing}
              userData={user || {}}
              formData={formData}
              onChange={handleProfileAction}
              onSave={handleSave}
              onCancel={handleCancel}
              onAvatarChange={handleAvatarChange}
            />
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <NotificationsTab 
              notifications={user?.preferences.notifications || {}} 
              onToggle={handleNotificationChange} 
            />
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <SecurityTab
              securitySettings={{
                twoFactor: user?.preferences.twoFactor || false,
                loginAlerts: user?.preferences.loginAlerts || false,
                sessionTimeout: user?.preferences.sessionTimeout || 30
              }}
              onToggleTwoFactor={() => handleSecurityChange('twoFactor')}
              onToggleLoginAlerts={() => handleSecurityChange('loginAlerts')}
              onChangeSessionTimeout={(val: number) => handleSecurityChange('sessionTimeout', val)}
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
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button 
                onClick={handlePasswordCancel}
                className="text-gray-500 hover:text-gray-700"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handlePasswordCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}