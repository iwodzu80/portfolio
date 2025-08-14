/**
 * Security-focused error handling utilities
 */

export interface SafeError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Sanitizes error messages to prevent information leakage
 */
export const sanitizeError = (error: any): SafeError => {
  // Default safe error message
  const defaultMessage = 'An error occurred. Please try again.';
  
  // If no error, return default
  if (!error) {
    return { message: defaultMessage };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { message: error.length > 200 ? defaultMessage : error };
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Don't expose sensitive system information
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /database/i,
      /connection/i,
      /internal/i,
      /server error/i,
      /stack trace/i
    ];

    const isSensitive = sensitivePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.stack || '')
    );

    if (isSensitive) {
      return { 
        message: defaultMessage,
        code: 'INTERNAL_ERROR'
      };
    }

    return {
      message: error.message.length > 200 ? defaultMessage : error.message,
      code: (error as any).code
    };
  }

  // Handle Supabase errors
  if (error && typeof error === 'object') {
    if (error.message) {
      // Common safe Supabase errors that can be shown to users
      const safeSupabaseErrors = [
        'Invalid login credentials',
        'Email not confirmed',
        'User not found',
        'Invalid email',
        'Password should be at least',
        'Row not found',
        'Duplicate key value',
        'Invalid input'
      ];

      const isSafe = safeSupabaseErrors.some(safe => 
        error.message.includes(safe)
      );

      if (isSafe) {
        return {
          message: error.message,
          code: error.code,
          details: error.details
        };
      }
    }

    return { 
      message: defaultMessage,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }

  return { message: defaultMessage };
};

/**
 * Logs errors securely without exposing sensitive information
 */
export const logError = (error: any, context?: string) => {
  const sanitized = sanitizeError(error);
  
  // In development, log the full error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  } else {
    // In production, only log sanitized errors
    console.error(`Error${context ? ` in ${context}` : ''}:`, sanitized);
  }
  
  return sanitized;
};