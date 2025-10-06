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
  const { contact, message } = req.body;
  if (!contact) {
    return res.status(400).json({ error: 'Missing emergency contact.' });
  }
  try {
    // Send SMS
    await client.messages.create({
      body: message || 'SOS! I need help.',
      from: twilioPhone,
      to: contact
    });

    // Make call
    await client.calls.create({
      twiml: '<Response><Say>SOS! This is an automated emergency call. Please check on your contact immediately.</Say></Response>',
      from: twilioPhone,
      to: contact
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
