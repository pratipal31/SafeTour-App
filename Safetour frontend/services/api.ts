// API service for SafeTour backend
const BASE_URL = 'http://192.168.1.106:5001'; // Change this to your backend URL

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  relation: string;
}

export interface SOSRequest {
  contacts: EmergencyContact[];
  message?: string;
  userName: string;
  location: string;
  latitude?: number;
  longitude?: number;
  action: 'call' | 'sms' | 'both';
}

class ApiService {
  // User Management
  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async saveUser(user: Partial<User>): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // Emergency Services
  async sendSOS(request: SOSRequest): Promise<{ success: boolean; message: string; results?: any[] }> {
    try {
      const response = await fetch(`${BASE_URL}/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error sending SOS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send SOS alert';
      return { success: false, message: `Emergency service error: ${errorMessage}` };
    }
  }

  async callContact(contact: EmergencyContact, userName: string, location: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/sos/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact, userName, location }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error making call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to make emergency call';
      return { success: false, message: `Call service error: ${errorMessage}` };
    }
  }

  async sendSMS(contact: EmergencyContact, userName: string, location: string, message?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/sos/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact, userName, location, message }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send emergency SMS';
      return { success: false, message: `SMS service error: ${errorMessage}` };
    }
  }

  // Test SMS functionality
  async testSMS(phone: string): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log(`Testing SMS to ${phone} via ${BASE_URL}/sos/test`);
      
      const response = await fetch(`${BASE_URL}/sos/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      // Get response as text first to handle non-JSON responses
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText.substring(0, 200));

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON. Response was:', responseText);
        throw new Error(`Server returned non-JSON response. Status: ${response.status}. Response: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error testing SMS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to test SMS';
      return { success: false, message: `SMS test error: ${errorMessage}` };
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
