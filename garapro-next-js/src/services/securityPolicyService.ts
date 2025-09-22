// services/securityPolicyService.ts
export interface SecurityPolicy {
    minPasswordLength: number;
    requireSpecialChar: boolean;
    requireNumber: boolean;
    requireUppercase: boolean;
    sessionTimeout: number; // in minutes
    maxLoginAttempts: number;
    accountLockoutTime: number; // in minutes
    mfaRequired: boolean;
    passwordExpiryDays: number;
    enableBruteForceProtection: boolean;
  }
  
  class SecurityPolicyService {
    private policy: SecurityPolicy = {
      minPasswordLength: 8,
      requireSpecialChar: true,
      requireNumber: true,
      requireUppercase: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      accountLockoutTime: 15,
      mfaRequired: false,
      passwordExpiryDays: 90,
      enableBruteForceProtection: true
    };
  
    getPolicy(): SecurityPolicy {
      return this.policy;
    }
  
    updatePolicy(newPolicy: Partial<SecurityPolicy>): SecurityPolicy {
      this.policy = { ...this.policy, ...newPolicy };
      // In a real application, this would make an API call to persist the settings
      return this.policy;
    }
  
    validatePassword(password: string): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];
      
      if (password.length < this.policy.minPasswordLength) {
        errors.push(`Password must be at least ${this.policy.minPasswordLength} characters long`);
      }
      
      if (this.policy.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
      
      if (this.policy.requireNumber && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      
      if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    getSessionTimeoutInMs(): number {
      return this.policy.sessionTimeout * 60 * 1000;
    }
  
    isBruteForceProtectionEnabled(): boolean {
      return this.policy.enableBruteForceProtection;
    }
  }
  
  export const securityPolicyService = new SecurityPolicyService();