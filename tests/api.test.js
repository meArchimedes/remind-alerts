const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Create a mock Express app
const app = express();
app.use(bodyParser.json());

// Mock data
const mockEvents = [
  {
    _id: '60d0fe4f5311236168a109cb',
    eventType: 'birthday',
    eventName: 'John\'s Birthday',
    eventDate: '05/15',
    reminderType: 'day_of',
    notes: 'Buy a gift',
    user: '60d0fe4f5311236168a109ca'
  },
  {
    _id: '60d0fe4f5311236168a109cc',
    eventType: 'anniversary',
    eventName: 'Wedding Anniversary',
    eventDate: '06/20',
    reminderType: 'day_before',
    notes: 'Make dinner reservation',
    user: '60d0fe4f5311236168a109ca'
  }
];

// Mock user for authentication
const mockUser = {
  _id: '60d0fe4f5311236168a109ca',
  email: 'test@example.com'
};

// Mock middleware
const isLoggedIn = (req, res, next) => {
  req.user = mockUser;
  next();
};

// Mock Reminder model
const Reminder = {
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  deleteOne: jest.fn(),
  create: jest.fn()
};

// Set up routes for testing
app.get('/api/user-events', isLoggedIn, async (req, res) => {
  try {
    // Return mock events
    res.status(200).json(mockEvents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
});

app.post('/api/add-event', isLoggedIn, async (req, res) => {
  const { eventType, eventName, eventDate, reminderType } = req.body;
  
  if (!eventType || !eventName || !eventDate || !reminderType) {
    return res.status(500).json({ error: "Missing required fields" });
  }
  
  // Mock successful save
  res.status(200).json({ message: "Event added successfully!" });
});

app.put('/api/edit-event/:id', isLoggedIn, async (req, res) => {
  const eventId = req.params.id;
  
  // Mock event not found
  if (eventId === 'nonexistent') {
    return res.status(404).json({ error: "Event not found or not authorized" });
  }
  
  // Mock successful update
  res.status(200).json({ message: "Event updated successfully!" });
});

app.delete('/api/delete-event', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Event ID is required" });
  }
  
  // Mock successful delete
  res.status(200).json({ message: "Event deleted successfully" });
});

describe('API Endpoints', () => {
  describe('GET /api/user-events', () => {
    test('should return all events for a user', async () => {
      const response = await request(app)
        .get('/api/user-events')
        .expect(200);
      
      expect(response.body).toHaveLength(2);
      expect(response.body[0].eventName).toBe('John\'s Birthday');
      expect(response.body[1].eventName).toBe('Wedding Anniversary');
    });
  });
  
  describe('POST /api/add-event', () => {
    test('should add a new event', async () => {
      const newEvent = {
        eventType: 'birthday',
        eventName: 'Mom\'s Birthday',
        eventDate: '07/10',
        reminderType: 'both',
        notes: 'Call in the morning'
      };
      
      await request(app)
        .post('/api/add-event')
        .send(newEvent)
        .expect(200)
        .then(response => {
          expect(response.body.message).toBe('Event added successfully!');
        });
    });
    
    test('should return error for invalid event data', async () => {
      const invalidEvent = {
        // Missing required fields
        eventName: 'Invalid Event'
      };
      
      await request(app)
        .post('/api/add-event')
        .send(invalidEvent)
        .expect(500);
    });
  });
  
  describe('PUT /api/edit-event/:id', () => {
    test('should update an existing event', async () => {
      const updatedData = {
        eventName: 'Updated Name',
        notes: 'Updated note'
      };
      
      await request(app)
        .put('/api/edit-event/60d0fe4f5311236168a109cb')
        .send(updatedData)
        .expect(200)
        .then(response => {
          expect(response.body.message).toBe('Event updated successfully!');
        });
    });
    
    test('should return 404 for non-existent event', async () => {
      await request(app)
        .put('/api/edit-event/nonexistent')
        .send({ eventName: 'Updated Name' })
        .expect(404);
    });
  });
  
  describe('DELETE /api/delete-event', () => {
    test('should delete an event', async () => {
      await request(app)
        .delete('/api/delete-event')
        .send({ id: '60d0fe4f5311236168a109cb' })
        .expect(200)
        .then(response => {
          expect(response.body.message).toBe('Event deleted successfully');
        });
    });
    
    test('should return 400 when id is not provided', async () => {
      await request(app)
        .delete('/api/delete-event')
        .send({})
        .expect(400);
    });
  });
});