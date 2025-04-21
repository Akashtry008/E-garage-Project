/**
 * Utility functions for handling contact messages
 */

// Fetch messages from the API
export async function fetchMessages() {
  console.log('Fetching messages from API...');
  
  try {
    // Try debug endpoint first
    const debugResponse = await fetch('http://localhost:8000/api/contact/debug', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!debugResponse.ok) {
      console.warn(`Debug endpoint failed with status ${debugResponse.status}`);
      
      // Try main endpoint as fallback
      const mainResponse = await fetch('http://localhost:8000/api/contact/', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!mainResponse.ok) {
        throw new Error(`All endpoints failed. Main endpoint returned ${mainResponse.status}`);
      }
      
      return processResponse(await mainResponse.text());
    }
    
    return processResponse(await debugResponse.text());
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

// Process the API response
function processResponse(responseText) {
  try {
    // Fix for malformed JSON (sometimes servers add whitespace or BOM characters)
    const cleanText = responseText.trim().replace(/^\ufeff/, '');
    
    // Log the raw response for debugging
    console.log('Raw API response:', cleanText);
    
    // Try to fix common JSON formatting issues
    let fixedText = cleanText;
    
    // Handle case where there's HTML in the response
    if (fixedText.includes('<html') || fixedText.includes('<!DOCTYPE')) {
      console.error('Response contains HTML instead of JSON');
      throw new Error('Server returned HTML instead of JSON. The API may be down or misconfigured.');
    }
    
    // Try to extract JSON from a non-JSON response (sometimes API returns text with JSON embedded)
    if (!fixedText.startsWith('{') && !fixedText.startsWith('[')) {
      const jsonMatch = fixedText.match(/(\{.*\}|\[.*\])/s);
      if (jsonMatch) {
        fixedText = jsonMatch[0];
        console.warn('Extracted JSON from non-JSON response:', fixedText);
      }
    }
    
    // Parse the response
    const data = JSON.parse(fixedText);
    
    // Check if the response has the expected structure
    if (data && data.contact_messages && Array.isArray(data.contact_messages)) {
      console.log(`Found ${data.contact_messages.length} messages in response`);
      
      return {
        messages: formatMessages(data.contact_messages),
        count: data.count || data.contact_messages.length,
        status: data.status
      };
    } else {
      console.warn('Unexpected API response format:', data);
      
      // Try to extract messages if data is an array directly
      if (Array.isArray(data)) {
        console.log('Response appears to be a direct array of messages');
        return {
          messages: formatMessages(data),
          count: data.length,
          status: true
        };
      }
      
      throw new Error('API response does not contain message data in expected format');
    }
  } catch (error) {
    console.error('Error processing response:', error);
    throw error;
  }
}

// Format messages for display
function formatMessages(messages) {
  return messages.map(msg => ({
    id: msg._id || msg.id || 'N/A',
    name: msg.name || 'N/A',
    email: msg.email || 'N/A',
    phone: msg.phone || 'N/A',
    subject: msg.subject || 'N/A',
    message: msg.message || 'N/A',
    created_at: msg.created_at || new Date().toISOString()
  }));
}

// Format a date string for display
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
}

// Mock data for testing or fallback
export const MOCK_MESSAGES = [
  {
    id: "mock1",
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    subject: "Service Inquiry",
    message: "I need information about your garage services.",
    created_at: new Date().toISOString()
  },
  {
    id: "mock2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "9876543210",
    subject: "Appointment Request",
    message: "I would like to schedule an appointment for next week.",
    created_at: new Date().toISOString()
  }
]; 