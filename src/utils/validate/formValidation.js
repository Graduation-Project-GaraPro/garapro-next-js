// Form and input validation functions for the emergency rescue project
import { isNotEmpty, isValidEmail, isValidPhone } from './index';

/**
 * Validates a text input field
 * @param {string} value - The input value
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and error message
 */
export const validateTextField = (value, options = {}) => {
  const {
    required = false,
    minLength = 0,
    maxLength = Number.MAX_SAFE_INTEGER,
    label = 'Field'
  } = options;
  
  if (required && !isNotEmpty(value)) {
    return {
      isValid: false,
      error: `${label} is required`
    };
  }
  
  if (isNotEmpty(value)) {
    if (value.length < minLength) {
      return {
        isValid: false,
        error: `${label} must be at least ${minLength} characters`
      };
    }
    
    if (value.length > maxLength) {
      return {
        isValid: false,
        error: `${label} must not exceed ${maxLength} characters`
      };
    }
  }
  
  return {
    isValid: true,
    error: ''
  };
};

/**
 * Validates an email input field
 * @param {string} value - The email value
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and error message
 */
export const validateEmailField = (value, options = {}) => {
  const {
    required = false,
    label = 'Email'
  } = options;
  
  if (required && !isNotEmpty(value)) {
    return {
      isValid: false,
      error: `${label} is required`
    };
  }
  
  if (isNotEmpty(value) && !isValidEmail(value)) {
    return {
      isValid: false,
      error: `${label} is not a valid email address`
    };
  }
  
  return {
    isValid: true,
    error: ''
  };
};

/**
 * Validates a phone input field
 * @param {string} value - The phone value
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and error message
 */
export const validatePhoneField = (value, options = {}) => {
  const {
    required = false,
    label = 'Phone number'
  } = options;
  
  if (required && !isNotEmpty(value)) {
    return {
      isValid: false,
      error: `${label} is required`
    };
  }
  
  if (isNotEmpty(value) && !isValidPhone(value)) {
    return {
      isValid: false,
      error: `${label} is not a valid phone number`
    };
  }
  
  return {
    isValid: true,
    error: ''
  };
};

/**
 * Validates a password input field
 * @param {string} value - The password value
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and error message
 */
export const validatePasswordField = (value, options = {}) => {
  const {
    required = false,
    minLength = 6,
    requireSpecialChar = false,
    requireNumber = false,
    requireUppercase = false,
    label = 'Password'
  } = options;
  
  if (required && !isNotEmpty(value)) {
    return {
      isValid: false,
      error: `${label} is required`
    };
  }
  
  if (isNotEmpty(value)) {
    if (value.length < minLength) {
      return {
        isValid: false,
        error: `${label} must be at least ${minLength} characters`
      };
    }
    
    if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return {
        isValid: false,
        error: `${label} must contain at least one special character`
      };
    }
    
    if (requireNumber && !/\d/.test(value)) {
      return {
        isValid: false,
        error: `${label} must contain at least one number`
      };
    }
    
    if (requireUppercase && !/[A-Z]/.test(value)) {
      return {
        isValid: false,
        error: `${label} must contain at least one uppercase letter`
      };
    }
  }
  
  return {
    isValid: true,
    error: ''
  };
};

/**
 * Validates a confirm password field
 * @param {string} confirmValue - The confirm password value
 * @param {string} passwordValue - The original password value
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and error message
 */
export const validateConfirmPasswordField = (confirmValue, passwordValue, options = {}) => {
  const {
    required = false,
    label = 'Confirm password'
  } = options;
  
  if (required && !isNotEmpty(confirmValue)) {
    return {
      isValid: false,
      error: `${label} is required`
    };
  }
  
  if (isNotEmpty(confirmValue) && confirmValue !== passwordValue) {
    return {
      isValid: false,
      error: 'Passwords do not match'
    };
  }
  
  return {
    isValid: true,
    error: ''
  };
};

/**
 * Validates a number input field
 * @param {string|number} value - The number value
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and error message
 */
export const validateNumberField = (value, options = {}) => {
  const {
    required = false,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    integer = false,
    label = 'Number'
  } = options;
  
  if (required && !isNotEmpty(value)) {
    return {
      isValid: false,
      error: `${label} is required`
    };
  }
  
  if (isNotEmpty(value)) {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${label} must be a valid number`
      };
    }
    
    if (numValue < min) {
      return {
        isValid: false,
        error: `${label} must be at least ${min}`
      };
    }
    
    if (numValue > max) {
      return {
        isValid: false,
        error: `${label} must not exceed ${max}`
      };
    }
    
    if (integer && !Number.isInteger(numValue)) {
      return {
        isValid: false,
        error: `${label} must be an integer`
      };
    }
  }
  
  return {
    isValid: true,
    error: ''
  };
};

/**
 * Validates a select/dropdown field
 * @param {string} value - The selected value
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and error message
 */
export const validateSelectField = (value, options = {}) => {
  const {
    required = false,
    allowedValues = null,
    label = 'Selection'
  } = options;
  
  if (required && !isNotEmpty(value)) {
    return {
      isValid: false,
      error: `${label} is required`
    };
  }
  
  if (isNotEmpty(value) && Array.isArray(allowedValues) && !allowedValues.includes(value)) {
    return {
      isValid: false,
      error: `${label} must be one of the allowed values`
    };
  }
  
  return {
    isValid: true,
    error: ''
  };
};

/**
 * Validates a Vietnam vehicle license plate field
 * Supports formats like: 92H-89873, 59A-123.45, 30G-12345
 * @param {string} value - The license plate value
 * @param {Object} options - Validation options
 * @returns {Object} - Object with isValid flag and error message
 */
export const validateLicensePlateField = (value, options = {}) => {
  const {
    required = false,
    label = 'Biển số xe'
  } = options;

  if (required && !isNotEmpty(value)) {
    return {
      isValid: false,
      error: `${label} is required`
    };
  }

  if (isNotEmpty(value)) {
    const input = String(value).toUpperCase().trim();
    // Patterns: NNX-12345 or NNX-123.45 (N: digit, X: letter or alnum)
    const patterns = [
      /^[0-9]{2}[A-Z][A-Z0-9]?-[0-9]{5}$/,
      /^[0-9]{2}[A-Z][A-Z0-9]?-[0-9]{4}$/,
      /^[0-9]{2}[A-Z][A-Z0-9]?-[0-9]{3}\.[0-9]{2}$/
    ];
    const matches = patterns.some((re) => re.test(input));
    if (!matches) {
      return {
        isValid: false,
        error: `${label} không đúng định dạng (ví dụ: 92H-89873, 59A-123.45)`
      };
    }
  }

  return {
    isValid: true,
    error: ''
  };
};