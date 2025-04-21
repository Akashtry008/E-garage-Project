/**
 * Utility functions for handling appointments
 */

// Mock data for when API fails
const MOCK_APPOINTMENTS = [
  {
    id: "64f8b8155af72959c2e4412d",
    customer: "John Doe",
    service: "Oil Change",
    date: new Date().toISOString().split('T')[0],
    time: "10:00 AM",
    status: "Confirmed",
    payment: "Paid",
    email: "john@example.com",
    phone: "555-123-4567",
    notes: "Please check tire pressure as well"
  },
  {
    id: "64f8b8155af72959c2e4412e",
    customer: "Jane Smith",
    service: "Tire Rotation",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: "2:30 PM",
    status: "Pending",
    payment: "Unpaid",
    email: "jane@example.com",
    phone: "555-987-6543",
    notes: "Front tires only"
  },
  {
    id: "64f8b8155af72959c2e4412f",
    customer: "Robert Johnson",
    service: "Brake Inspection",
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
    time: "9:15 AM",
    status: "Scheduled",
    payment: "Unpaid",
    email: "robert@example.com",
    phone: "555-456-7890",
    notes: "Car makes grinding noise when braking"
  },
  {
    id: "64f8b8155af72959c2e44130",
    customer: "Sarah Williams",
    service: "Engine Diagnostic",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    time: "11:45 AM",
    status: "Completed",
    payment: "Paid",
    email: "sarah@example.com",
    phone: "555-234-5678",
    notes: "Check engine light keeps turning on"
  },
  {
    id: "64f8b8155af72959c2e44131",
    customer: "Michael Brown",
    service: "Battery Replacement",
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // Two days ago
    time: "3:00 PM",
    status: "Cancelled",
    payment: "Refunded",
    email: "michael@example.com",
    phone: "555-876-5432",
    notes: "Needed emergency service"
  }
];

/**
 * Fetches appointments from the API
 * @returns {Promise<Object>} Object containing appointments array and metadata
 */
export async function fetchAppointments() {
  try {
    console.log('Fetching appointments from API...');
    
    // Use the dedicated admin appointments endpoint
    const url = 'http://localhost:8000/api/bookings/admin/appointments';
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if the response has the expected structure
    if (data && data.bookings && Array.isArray(data.bookings)) {
      console.log(`Found ${data.bookings.length} appointments in response`);
      
      return {
        appointments: formatAppointments(data.bookings),
        count: data.count || data.bookings.length,
        status: data.status,
        source: 'api'
      };
    }
    
    // Fallback to mock data if API response isn't in expected format
    console.warn('Unexpected API response format. Using mock data.');
    return {
      appointments: MOCK_APPOINTMENTS,
      count: MOCK_APPOINTMENTS.length,
      status: true,
      source: 'mock'
    };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    
    // Return mock data on error
    console.warn('Using mock data due to error.');
    return {
      appointments: MOCK_APPOINTMENTS,
      count: MOCK_APPOINTMENTS.length,
      status: true,
      source: 'mock'
    };
  }
}

/**
 * Format appointments for display
 * @param {Array} appointments - Array of appointment objects from API
 * @returns {Array} Formatted appointment objects
 */
function formatAppointments(appointments) {
  return appointments.map(appt => ({
    id: appt._id || appt.id || 'N/A',
    customer: extractCustomerName(appt),
    service: extractServiceName(appt),
    date: appt.date || appt.appointment_date || appt.booking_date || 'N/A',
    time: appt.time || appt.appointment_time || extractTimeFromDateTime(appt) || 'N/A',
    status: appt.status || 'Pending',
    payment: appt.payment_status || appt.payment || 'Unpaid',
    email: appt.email || (appt.user && appt.user.email) || '',
    phone: appt.phone || (appt.user && appt.user.phone) || '',
    notes: appt.notes || appt.special_requests || '',
    raw: appt // Keep the raw data for reference
  }));
}

/**
 * Extract customer name from different possible structures
 * @param {Object} appt - Appointment object
 * @returns {String} Customer name
 */
function extractCustomerName(appt) {
  if (appt.customer_name) return appt.customer_name;
  if (appt.customer && typeof appt.customer === 'object') {
    if (appt.customer.name) return appt.customer.name;
    if (appt.customer.first_name) {
      return `${appt.customer.first_name} ${appt.customer.last_name || ''}`.trim();
    }
  }
  if (appt.user && typeof appt.user === 'object') {
    if (appt.user.name) return appt.user.name;
    if (appt.user.first_name) {
      return `${appt.user.first_name} ${appt.user.last_name || ''}`.trim();
    }
  }
  if (appt.name) return appt.name;
  if (appt.customer_id) return `Customer ID: ${appt.customer_id}`;
  if (appt.user_id) return `User ID: ${appt.user_id}`;
  return 'Unknown Customer';
}

/**
 * Extract service name from different possible structures
 * @param {Object} appt - Appointment object
 * @returns {String} Service name
 */
function extractServiceName(appt) {
  if (appt.service_name) return appt.service_name;
  if (appt.service && typeof appt.service === 'object' && appt.service.name) {
    return appt.service.name;
  }
  if (appt.service_id) return `Service ID: ${appt.service_id}`;
  if (appt.service_type) return appt.service_type;
  if (appt.service) return appt.service;
  return 'Unknown Service';
}

/**
 * Extract time from a datetime field if separate time isn't available
 * @param {Object} appt - Appointment object
 * @returns {String|null} Formatted time string or null
 */
function extractTimeFromDateTime(appt) {
  const dateTimeFields = ['datetime', 'appointment_datetime', 'booking_datetime', 'created_at'];
  
  for (const field of dateTimeFields) {
    if (appt[field]) {
      try {
        const date = new Date(appt[field]);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        console.warn(`Failed to parse datetime from ${field}:`, e);
      }
    }
  }
  
  return null;
}

/**
 * Format a date string for display
 * @param {String} dateString - Date string to format
 * @returns {String} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString; // Return the original string if it's not a valid date
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
} 