// Rescue validation functions for the emergency rescue project
import { isNotEmpty, isValidLocation, isValidDate } from './index';

/**
 * Validates if a rescue request creation is valid
 * @param {Object} rescueData - The rescue request data object
 * @returns {Object} - Object with isValid flag and errors array
 */
export const validateRescueCreation = (rescueData) => {
  const errors = [];
  
  if (!isValidLocation(rescueData.location)) {
    errors.push('Valid location is required');
  }
  
  if (!isNotEmpty(rescueData.vehicleType)) {
    errors.push('Vehicle type is required');
  }
  
  if (!isNotEmpty(rescueData.issueDescription)) {
    errors.push('Issue description is required');
  }
  
  if (!isNotEmpty(rescueData.contactPhone) || rescueData.contactPhone.length < 10) {
    errors.push('Valid contact phone number is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if a rescue status update is valid
 * @param {Object} statusData - The status update data object
 * @returns {Object} - Object with isValid flag and errors array
 */
export const validateStatusUpdate = (statusData) => {
  const errors = [];
  
  if (!isNotEmpty(statusData.rescueId)) {
    errors.push('Rescue ID is required');
  }
  
  if (!isNotEmpty(statusData.status)) {
    errors.push('Status is required');
  } else if (!['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(statusData.status)) {
    errors.push('Invalid status value');
  }
  
  if (statusData.status === 'accepted' && !isNotEmpty(statusData.technicianId)) {
    errors.push('Technician ID is required when accepting a rescue');
  }
  
  if (statusData.status === 'completed' && !isNotEmpty(statusData.completionNotes)) {
    errors.push('Completion notes are required when completing a rescue');
  }
  
  if (statusData.status === 'cancelled' && !isNotEmpty(statusData.cancellationReason)) {
    errors.push('Cancellation reason is required when cancelling a rescue');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if a rescue feedback submission is valid
 * @param {Object} feedbackData - The feedback data object
 * @returns {Object} - Object with isValid flag and errors array
 */
export const validateFeedbackSubmission = (feedbackData) => {
  const errors = [];
  
  if (!isNotEmpty(feedbackData.rescueId)) {
    errors.push('Rescue ID is required');
  }
  
  if (!isNotEmpty(feedbackData.rating) || isNaN(feedbackData.rating) || 
      feedbackData.rating < 1 || feedbackData.rating > 5) {
    errors.push('Rating must be a number between 1 and 5');
  }
  
  // Comments are optional
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if an ETA update is valid
 * @param {Object} etaData - The ETA update data object
 * @returns {Object} - Object with isValid flag and errors array
 */
export const validateEtaUpdate = (etaData) => {
  const errors = [];
  
  if (!isNotEmpty(etaData.rescueId)) {
    errors.push('Rescue ID is required');
  }
  
  if (!isNotEmpty(etaData.estimatedArrivalTime)) {
    errors.push('Estimated arrival time is required');
  } else if (!isValidDate(etaData.estimatedArrivalTime)) {
    errors.push('Valid estimated arrival time is required');
  } else {
    const arrivalTime = new Date(etaData.estimatedArrivalTime);
    const now = new Date();
    
    if (arrivalTime <= now) {
      errors.push('Estimated arrival time must be in the future');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if a technician location update is valid
 * @param {Object} locationData - The location update data object
 * @returns {Object} - Object with isValid flag and errors array
 */
export const validateLocationUpdate = (locationData) => {
  const errors = [];
  
  if (!isNotEmpty(locationData.technicianId)) {
    errors.push('Technician ID is required');
  }
  
  if (!isValidLocation(locationData.location)) {
    errors.push('Valid location is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};