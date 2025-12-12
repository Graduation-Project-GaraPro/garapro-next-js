import { useState, useEffect, ChangeEvent } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar, FaCamera, FaSave } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { 
  getCurrentUser, 
  updateCurrentUser, 
  profileUtils,
  UserDto, 
  UpdateUserDto 
} from "@/services/technician/profileService";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: (fullName: string) => void; 
}

export default function ProfileModal({ isOpen, onClose, onProfileUpdate }: ProfileModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [userData, setUserData] = useState<UserDto>({
    gender: undefined,
    firstName: "",
    lastName: "",
    avatar: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
  });

  const [formData, setFormData] = useState<UpdateUserDto>({
    gender: undefined,
    firstName: "",
    lastName: "",
    avatar: "",
    dateOfBirth: "",
  });

  const maxBirthDate = profileUtils.getMaxBirthDate();

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const data = await getCurrentUser();
      
      setUserData(data);
      setFormData({
        gender: data.gender,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        avatar: data.avatar || "",
        dateOfBirth: data.dateOfBirth ? 
          profileUtils.formatDateForInput(data.dateOfBirth) : "",
      });
      setAvatarPreview(data.avatar || "");
    } catch (error: unknown) {
      console.error("Error loading user data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile data";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateUserDto, value: string | boolean | undefined): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'dateOfBirth' && typeof value === 'string' && value) {
      if (!profileUtils.isOver18(value)) {
        toast.error('You must be at least 18 years old', {
          id: 'age-error', 
          duration: 3000,
        });
      }
    }
  };

  const handleTextInputChange = (field: keyof UpdateUserDto) => (e: ChangeEvent<HTMLInputElement>): void => {
    handleInputChange(field, e.target.value);
  };

  const handleSelectChange = (field: keyof UpdateUserDto) => (e: ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value;
    if (field === 'gender') {
      if (value === "") {
        handleInputChange(field, undefined);
      } else {
        handleInputChange(field, value === "true");
      }
    } else {
      handleInputChange(field, value);
    }
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleInputChange('dateOfBirth', e.target.value);
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setFormData(prev => ({ ...prev, avatar: base64String }));
        setAvatarFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsSaving(true);

      const errors = profileUtils.validateFormData(formData);
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return;
      }

      const updateData: UpdateUserDto = {
        ...formData,
        gender: formData.gender === undefined ? undefined : formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      if (avatarFile && avatarPreview.startsWith('data:image')) {
        updateData.avatar = avatarPreview;
      }

      const updatedUser = await updateCurrentUser(updateData);

      setUserData(prev => ({
        ...prev,
        ...updatedUser,
      }));

      const fullName = `${formData.firstName} ${formData.lastName}`;
      localStorage.setItem('userFullName', fullName);
      if (userData.email) {
        localStorage.setItem('userEmail', userData.email);
      }

      if (onProfileUpdate) {
        onProfileUpdate(fullName);
      }

      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { fullName } 
      }));

    toast.success("Profile updated successfully!", {
      duration: 2000,  
    });
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (): void => {
    setFormData({
      gender: userData.gender,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      avatar: userData.avatar || "",
      dateOfBirth: userData.dateOfBirth ? 
        profileUtils.formatDateForInput(userData.dateOfBirth) : "",
    });
    setAvatarPreview(userData.avatar || "");
    setAvatarFile(null);
    setIsEditing(false);
  };

  const formatDate = (dateString?: string): string => {
    return profileUtils.formatDateForDisplay(dateString);
  };

  const getAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;
    
    try {
      const [year, month, day] = dateOfBirth.split('T')[0].split('-').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaUser className="text-2xl" />
            <h2 className="text-2xl font-bold">My Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading profile...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      width={400}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-4xl font-bold">
                      {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <FaCamera className="text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 text-center">
                  Click camera icon to change avatar (Max 5MB)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName || ""}
                    onChange={handleTextInputChange("firstName")}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {userData.firstName || "Not set"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName || ""}
                    onChange={handleTextInputChange("lastName")}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {userData.lastName || "Not set"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-blue-600" />
                  Email
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600 font-medium cursor-not-allowed">
                  {userData.email || "Not set"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-green-600" />
                  Phone Number
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600 font-medium cursor-not-allowed">
                  {userData.phoneNumber || "Not set"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender === undefined ? "" : formData.gender ? "true" : "false"}
                    onChange={handleSelectChange("gender")}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="true">Male</option>
                    <option value="false">Female</option>
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {userData.gender === undefined
                      ? "Not set"
                      : userData.gender
                      ? "Male"
                      : "Female"}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <FaCalendar className="inline mr-2 text-purple-600" />
                    Date of Birth
                  </label>
                  {!isEditing && userData.dateOfBirth && (
                    <span className="text-xs text-gray-500">
                      Age: {getAge(userData.dateOfBirth)} years
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <div>
                    <input
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={handleDateChange}
                      max={maxBirthDate}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 18 years old (born before {maxBirthDate})
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {formatDate(userData.dateOfBirth)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 font-semibold transition-all shadow-lg disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 font-semibold transition-all shadow-lg"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}