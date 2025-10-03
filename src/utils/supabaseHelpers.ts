/**
 * Adds updated_at timestamp to update operations
 */
export function withTimestamp(data: Record<string, any>): Record<string, any> {
  return {
    ...data,
    updated_at: new Date().toISOString()
  };
}

