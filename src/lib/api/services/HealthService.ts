import { testConnection } from '@/lib/googleSheets';

/**
 * Health service
 * Handles health check operations
 */
export class HealthService {
  /**
   * Test Google Sheets connection
   */
  static async testConnection() {
    return testConnection();
  }
}










