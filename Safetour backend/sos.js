// Twilio SOS backend endpoint
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;
const client = twilio(accountSid, authToken);

// POST /sos
router.post('/', async (req, res) => {
  const { contacts, message, userName, location, action } = req.body;
  
  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'Missing emergency contacts.' });
  }

  try {
    const results = [];
    const emergencyMessage = message || `🚨 EMERGENCY ALERT 🚨\n\nThis is ${userName || 'SafeTour User'}. I need immediate help!\n\nLocation: ${location || 'Unknown'}\nTime: ${new Date().toLocaleString()}\n\nPlease respond or call me back immediately!`;
    
    console.log(`Processing SOS request for ${contacts.length} contacts with action: ${action}`);
    console.log('Emergency message:', emergencyMessage);
    
    for (const contact of contacts) {
      if (!contact.phone) continue;
      
      // Format phone number - ensure it starts with + for international format
      let formattedPhone = contact.phone.replace(/\s+/g, '').replace(/-/g, '');
      if (!formattedPhone.startsWith('+')) {
        // If it's an Indian number starting with 91, add +
        if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
          formattedPhone = '+' + formattedPhone;
        }
        // If it's a 10-digit Indian number, add +91
        else if (formattedPhone.length === 10 && formattedPhone.match(/^[6-9]/)) {
          formattedPhone = '+91' + formattedPhone;
        }
        // If it's a 3-digit emergency number (like 100, 101, 102), keep as is
        else if (formattedPhone.length === 3) {
          formattedPhone = '+91' + formattedPhone;
        }
      }
      
      try {
        console.log(`Processing contact: ${contact.name} at ${formattedPhone}`);
        
        if (action === 'call' || action === 'both') {
          console.log(`Making call to ${contact.name} at ${formattedPhone}`);
          const call = await client.calls.create({
            twiml: `<Response><Say>Emergency Alert! ${userName || 'A SafeTour user'} needs immediate help. They are located at ${location || 'an unknown location'}. Please check on them immediately or call them back.</Say></Response>`,
            from: twilioPhone,
            to: formattedPhone
          });
          console.log(`Call successful: ${call.sid}`);
          results.push({ 
            contact: contact.name, 
            phone: formattedPhone, 
            call: { success: true, sid: call.sid } 
          });
        }
        
        if (action === 'sms' || action === 'both') {
          console.log(`Sending SMS to ${contact.name} at ${formattedPhone}`);
          console.log('SMS body:', emergencyMessage);
          const sms = await client.messages.create({
            body: emergencyMessage,
            from: twilioPhone,
            to: formattedPhone
          });
          console.log(`SMS successful: ${sms.sid}`);
          results.push({ 
            contact: contact.name, 
            phone: formattedPhone, 
            sms: { success: true, sid: sms.sid } 
          });
        }
      } catch (contactError) {
        console.error(`Error contacting ${contact.name} at ${formattedPhone}:`, contactError);
        results.push({ 
          contact: contact.name, 
          phone: formattedPhone, 
          error: contactError.message 
        });
      }
    }

    res.json({ 
      success: true, 
      message: `Emergency alert sent to ${contacts.length} contact(s)`,
      results 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /sos/call - Call specific contact
router.post('/call', async (req, res) => {
  const { contact, userName, location } = req.body;
  
  if (!contact || !contact.phone) {
    return res.status(400).json({ error: 'Missing contact phone number.' });
  }

  try {
    // Format phone number
    let formattedPhone = contact.phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.length === 10 && formattedPhone.match(/^[6-9]/)) {
        formattedPhone = '+91' + formattedPhone;
      } else if (formattedPhone.length === 3) {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    const call = await client.calls.create({
      twiml: `<Response><Say>Emergency Alert! ${userName || 'A SafeTour user'} needs immediate help. They are located at ${location || 'an unknown location'}. Please check on them immediately or call them back.</Say></Response>`,
      from: twilioPhone,
      to: formattedPhone
    });

    res.json({ 
      success: true, 
      message: `Calling ${contact.name} at ${formattedPhone}`,
      callSid: call.sid 
    });
  } catch (err) {
    console.error('Call error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /sos/sms - Send SMS to specific contact
router.post('/sms', async (req, res) => {
  const { contact, message, userName, location } = req.body;
  
  if (!contact || !contact.phone) {
    return res.status(400).json({ error: 'Missing contact phone number.' });
  }

  try {
    // Format phone number
    let formattedPhone = contact.phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.length === 10 && formattedPhone.match(/^[6-9]/)) {
        formattedPhone = '+91' + formattedPhone;
      } else if (formattedPhone.length === 3) {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    const emergencyMessage = message || `🚨 EMERGENCY ALERT 🚨\n\nThis is ${userName || 'SafeTour User'}. I need immediate help!\n\nLocation: ${location || 'Unknown'}\nTime: ${new Date().toLocaleString()}\n\nPlease respond or call me back immediately!`;
    
    const sms = await client.messages.create({
      body: emergencyMessage,
      from: twilioPhone,
      to: formattedPhone
    });

    res.json({ 
      success: true, 
      message: `SMS sent to ${contact.name} at ${formattedPhone}`,
      smsSid: sms.sid 
    });
  } catch (err) {
    console.error('SMS error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /sos/test - Test SMS functionality
router.post('/test', async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: 'Phone number required for test' });
  }

  try {
    // Format phone number
    let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.length === 10 && formattedPhone.match(/^[6-9]/)) {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    console.log(`Testing SMS to ${formattedPhone}`);
    console.log('Twilio config:', { 
      accountSid: accountSid ? 'Set' : 'Missing',
      authToken: authToken ? 'Set' : 'Missing',
      twilioPhone: twilioPhone || 'Missing'
    });

    const testMessage = 'Test message from SafeTour app. SMS functionality is working!';
    
    const sms = await client.messages.create({
      body: testMessage,
      from: twilioPhone,
      to: formattedPhone
    });

    console.log(`Test SMS successful: ${sms.sid}`);
    res.json({ 
      success: true, 
      message: `Test SMS sent to ${formattedPhone}`,
      smsSid: sms.sid,
      formattedPhone
    });
  } catch (err) {
    console.error('Test SMS error:', err);
    res.status(500).json({ 
      error: err.message,
      details: err.code || 'Unknown error'
    });
  }
});

module.exports = router;
