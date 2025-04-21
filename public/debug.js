// Self-executing function to run immediately
(function() {
  console.log('🚀 Debug script loaded and running!');
  
  // Show alert to confirm script is running
  setTimeout(() => {
    console.log('✅ Testing API direct access...');
    directApiTest();
  }, 1000);
})();

// Direct API test that runs automatically
function directApiTest() {
  const testUrl = 'http://localhost:8000/api/contact/';
  
  console.log(`🔄 Testing direct fetch to ${testUrl}`);
  
  fetch(testUrl, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    console.log('🔵 Raw response:', response);
    if (!response.ok) {
      throw new Error(`Status code: ${response.status}`);
    }
    return response.text(); // Get as text first to see raw response
  })
  .then(text => {
    console.log('📄 Raw response text:', text);
    
    try {
      // Try to parse as JSON
      const data = JSON.parse(text);
      console.log('📊 Parsed JSON data:', data);
      
      if (data && data.contact_messages) {
        console.log(`✅ Found ${data.contact_messages.length} messages in the API response`);
        // Create an overlay to show success
        showOverlay(`API is working! Found ${data.contact_messages.length} messages.`, 'success');
      } else {
        console.error('❌ Data does not contain contact_messages array:', data);
        showOverlay('API response format is incorrect', 'error');
      }
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      showOverlay('API returned invalid JSON', 'error');
    }
  })
  .catch(error => {
    console.error('❌ API fetch failed:', error);
    showOverlay(`API Error: ${error.message}`, 'error');
  });
}

function showOverlay(message, type) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '50%';
  overlay.style.left = '50%';
  overlay.style.transform = 'translate(-50%, -50%)';
  overlay.style.backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
  overlay.style.color = 'white';
  overlay.style.padding = '20px';
  overlay.style.borderRadius = '10px';
  overlay.style.zIndex = '10000';
  overlay.style.maxWidth = '80%';
  overlay.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  overlay.innerText = message;
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerText = 'Close';
  closeBtn.style.marginTop = '15px';
  closeBtn.style.padding = '5px 10px';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '5px';
  closeBtn.style.backgroundColor = 'white';
  closeBtn.style.color = type === 'success' ? '#4CAF50' : '#F44336';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => document.body.removeChild(overlay);
  
  overlay.appendChild(document.createElement('br'));
  overlay.appendChild(closeBtn);
  
  document.body.appendChild(overlay);
}

// Debug tool for testing API endpoints
function testContactAPI() {
  console.log('🔍 Testing contact API endpoint...');
  
  return fetch('http://localhost:8000/api/contact/', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    console.log('📡 Raw response status:', response.status);
    console.log('📡 Raw response headers:', response.headers);
    return response.json();
  })
  .then(data => {
    console.log('✅ API response data:', data);
    
    if (data && data.contact_messages && Array.isArray(data.contact_messages)) {
      console.log(`✅ Successfully found ${data.contact_messages.length} messages`);
      return data.contact_messages;
    } else {
      console.error('❌ Data structure is not as expected:', data);
      throw new Error('Invalid data structure');
    }
  })
  .catch(error => {
    console.error('❌ API request failed:', error);
    throw error;
  });
}

// Export to window for browser console access
window.testContactAPI = testContactAPI;

// Add a button to the page to run the test
document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button');
  button.textContent = 'Test Contact API';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '10px';
  button.style.backgroundColor = '#007bff';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  
  button.onclick = () => {
    testContactAPI()
      .then(messages => {
        alert(`Success! Found ${messages.length} messages.`);
      })
      .catch(error => {
        alert(`Error: ${error.message}`);
      });
  };
  
  document.body.appendChild(button);
}); 