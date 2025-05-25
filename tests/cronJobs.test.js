const path = require('path');
const fs = require('fs');

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

// Import the functions to test
const { getEmailTemplate, getEmailSubject, shouldSendToday } = require('../services/cronJobsTestExport');

describe('Cron Jobs Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmailTemplate', () => {
    test('returns birthday template for birthday events', () => {
      const mockTemplate = '<html>Birthday Template</html>';
      fs.readFileSync.mockReturnValue(mockTemplate);
      path.join.mockReturnValue('/path/to/birthdayTemplate.html');
      
      const result = getEmailTemplate('birthday');
      expect(result).toBe(mockTemplate);
      expect(path.join).toHaveBeenCalledWith(expect.anything(), "../emails/birthdayTemplate.html");
    });

    test('returns anniversary template for anniversary events', () => {
      const mockTemplate = '<html>Anniversary Template</html>';
      fs.readFileSync.mockReturnValue(mockTemplate);
      path.join.mockReturnValue('/path/to/anniversaryTemplate.html');
      
      const result = getEmailTemplate('anniversary');
      expect(result).toBe(mockTemplate);
      expect(path.join).toHaveBeenCalledWith(expect.anything(), "../emails/anniversaryTemplate.html");
    });

    test('returns default template for other events', () => {
      const mockTemplate = '<html>Default Template</html>';
      fs.readFileSync.mockReturnValue(mockTemplate);
      path.join.mockReturnValue('/path/to/defaultTemplate.html');
      
      const result = getEmailTemplate('other');
      expect(result).toBe(mockTemplate);
      expect(path.join).toHaveBeenCalledWith(expect.anything(), "../emails/defaultTemplate.html");
    });

    test('falls back to default template if specific template fails', () => {
      const mockDefaultTemplate = '<html>Default Template</html>';
      
      // First call throws error, second call returns default template
      fs.readFileSync
        .mockImplementationOnce(() => { throw new Error('File not found'); })
        .mockImplementationOnce(() => mockDefaultTemplate);
      
      path.join
        .mockReturnValueOnce('/path/to/birthdayTemplate.html')
        .mockReturnValueOnce('/path/to/defaultTemplate.html');
      
      const result = getEmailTemplate('birthday');
      expect(result).toBe(mockDefaultTemplate);
    });
  });

  describe('getEmailSubject', () => {
    test('returns birthday subject for birthday events', () => {
      const result = getEmailSubject('birthday', 'John\'s Birthday');
      expect(result).toContain('Birthday Reminder');
      expect(result).toContain('John\'s Birthday');
    });

    test('returns anniversary subject for anniversary events', () => {
      const result = getEmailSubject('anniversary', 'Wedding Anniversary');
      expect(result).toContain('Anniversary Reminder');
      expect(result).toContain('Wedding Anniversary');
    });

    test('returns default subject for other events', () => {
      const result = getEmailSubject('other', 'Team Meeting');
      expect(result).toContain('Event Reminder');
      expect(result).toContain('Team Meeting');
    });
  });

  describe('shouldSendToday', () => {
    test('returns true for day_of reminder on the event day (MM/DD format)', () => {
      const reminder = {
        eventDate: '05/15',
        reminderType: 'day_of'
      };
      
      const result = shouldSendToday(
        reminder,
        '2023-05-15', // todayYYYYMMDD
        '2023-05-16', // tomorrowYYYYMMDD
        '05/15',      // todayMMDD
        '05/16'       // tomorrowMMDD
      );
      
      expect(result).toBe(true);
    });
    
    test('returns true for day_before reminder on the day before event (YYYY-MM-DD format)', () => {
      const reminder = {
        eventDate: '2023-05-16',
        reminderType: 'day_before'
      };
      
      const result = shouldSendToday(
        reminder,
        '2023-05-15', // todayYYYYMMDD
        '2023-05-16', // tomorrowYYYYMMDD
        '05/15',      // todayMMDD
        '05/16'       // tomorrowMMDD
      );
      
      expect(result).toBe(true);
    });
    
    test('returns false when event date does not match criteria', () => {
      const reminder = {
        eventDate: '05/17',
        reminderType: 'day_of'
      };
      
      const result = shouldSendToday(
        reminder,
        '2023-05-15', // todayYYYYMMDD
        '2023-05-16', // tomorrowYYYYMMDD
        '05/15',      // todayMMDD
        '05/16'       // tomorrowMMDD
      );
      
      expect(result).toBe(false);
    });
  });
});