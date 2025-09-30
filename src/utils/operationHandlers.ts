import { toast } from "sonner";
import { logError } from "@/utils/errorHandler";

export interface OperationOptions {
  onSuccess?: (data?: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Generic operation wrapper with consistent error handling and toast notifications
 */
export const executeOperation = async <T>(
  operation: () => Promise<T>,
  options?: OperationOptions
): Promise<{ data: T | null; error: any }> => {
  try {
    const data = await operation();
    
    if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    
    options?.onSuccess?.(data);
    return { data, error: null };
  } catch (error: any) {
    const sanitized = logError(error, 'operation');
    
    if (options?.errorMessage) {
      toast.error(options.errorMessage);
    }
    
    options?.onError?.(sanitized);
    return { data: null, error: sanitized };
  }
};

/**
 * Wrapper for update operations with consistent state management
 */
export const executeUpdateOperation = async <T>(
  updateFn: () => Promise<any>,
  stateFn: () => void,
  options?: OperationOptions
): Promise<{ data: any; error: any }> => {
  return executeOperation(
    async () => {
      const result = await updateFn();
      stateFn();
      return result;
    },
    options
  );
};