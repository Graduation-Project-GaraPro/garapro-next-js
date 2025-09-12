// Validation utility functions for the emergency rescue project

/**
 * Validates if a value is not empty (null, undefined, empty string, or empty array)
 * @param {*} value - The value to check
 * @returns {boolean} - True if the value is not empty
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validates if a string is a valid email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if the email is valid
 */
export const isValidEmail = (email) => {
  if (!isNotEmpty(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a string is a valid phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if the phone number is valid
 */
export const isValidPhone = (phone) => {
  if (!isNotEmpty(phone)) return false;
  // Basic phone validation - can be adjusted based on country format requirements
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates if a value is a valid location (has latitude and longitude)
 * @param {Object} location - The location object to validate
 * @returns {boolean} - True if the location is valid
 */
export const isValidLocation = (location) => {
  if (!location || typeof location !== 'object') return false;
  
  const { latitude, longitude } = location;
  
  if (latitude === undefined || longitude === undefined) return false;
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) return false;
  
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Validates if a string is a valid date format
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - True if the date is valid
 */
export const isValidDate = (dateString) => {
  if (!isNotEmpty(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validates if a rescue request has all required fields
 * @param {Object} request - The rescue request object
 * @returns {Object} - Object with isValid flag and errors array
 */
export const validateRescueRequest = (request) => {
  const errors = [];
  
  if (!isNotEmpty(request.userId)) {
    errors.push('User ID is required');
  }
  
  if (!isValidLocation(request.location)) {
    errors.push('Valid location is required');
  }
  
  if (!isNotEmpty(request.vehicleType)) {
    errors.push('Vehicle type is required');
  }
  
  if (!isNotEmpty(request.issueDescription)) {
    errors.push('Issue description is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if a chat message is valid
 * @param {Object} message - The message object
 * @returns {boolean} - True if the message is valid
 */
export const isValidMessage = (message) => {
  if (!message || typeof message !== 'object') return false;
  
  // Check required fields
  if (!isNotEmpty(message.content)) return false;
  if (!isNotEmpty(message.sender)) return false;
  
  return true;
};

/**
 * Validates if a technician profile has all required fields
 * @param {Object} profile - The technician profile object
 * @returns {Object} - Object with isValid flag and errors array
 */
export const validateTechnicianProfile = (profile) => {
  const errors = [];
  
  if (!isNotEmpty(profile.name)) {
    errors.push('Name is required');
  }
  
  if (!isValidEmail(profile.email)) {
    errors.push('Valid email is required');
  }
  
  if (!isValidPhone(profile.phone)) {
    errors.push('Valid phone number is required');
  }
  
  if (!isNotEmpty(profile.specialization)) {
    errors.push('Specialization is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if a status update is valid
 * @param {Object} statusUpdate - The status update object
 * @returns {boolean} - True if the status update is valid
 */
export const isValidStatusUpdate = (statusUpdate) => {
  if (!statusUpdate || typeof statusUpdate !== 'object') return false;
  
  // Check required fields
  if (!isNotEmpty(statusUpdate.status)) return false;
  if (!['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(statusUpdate.status)) return false;
  
  return true;
};