// User management backend endpoint
const express = require('express');
const router = express.Router();

// In-memory user storage (in production, use a proper database)
let users = {};

// GET /user/:id - Get user data
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const user = users[id];
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ success: true, user });
});

// POST /user - Create or update user
router.post('/', (req, res) => {
  const { id, name, email, phone, emergencyContacts } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  users[id] = {
    id,
    name: name || 'SafeTour User',
    email: email || '',
    phone: phone || '',
    emergencyContacts: emergencyContacts || [],
    createdAt: users[id]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json({ 
    success: true, 
    message: 'User data saved successfully',
    user: users[id] 
  });
});

// PUT /user/:id - Update user data
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!users[id]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[id] = {
    ...users[id],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  res.json({ 
    success: true, 
    message: 'User data updated successfully',
    user: users[id] 
  });
});

// DELETE /user/:id - Delete user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  if (!users[id]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  delete users[id];
  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = router;
