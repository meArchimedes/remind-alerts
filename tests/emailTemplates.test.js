const fs = require('fs');
const path = require('path');

describe('Email Templates', () => {
  const templatePaths = {
    birthday: path.join(__dirname, '../emails/birthdayTemplate.html'),
    anniversary: path.join(__dirname, '../emails/anniversaryTemplate.html'),
    default: path.join(__dirname, '../emails/defaultTemplate.html')
  };

  test('All email templates exist', () => {
    Object.values(templatePaths).forEach(templatePath => {
      expect(fs.existsSync(templatePath)).toBe(true);
    });
  });

  test('Birthday template contains birthday-specific content', () => {
    const template = fs.readFileSync(templatePaths.birthday, 'utf-8');
    expect(template).toContain('Birthday Reminder');
    expect(template).toContain('🎂');
  });

  test('Anniversary template contains anniversary-specific content', () => {
    const template = fs.readFileSync(templatePaths.anniversary, 'utf-8');
    expect(template).toContain('Anniversary Reminder');
    expect(template).toContain('💍');
  });

  test('Default template contains neutral content', () => {
    const template = fs.readFileSync(templatePaths.default, 'utf-8');
    expect(template).toContain('Event Reminder');
    expect(template).toContain('📅');
  });

  test('All templates have required placeholders', () => {
    const requiredPlaceholders = ['{{eventName}}', '{{eventDate}}', '{{logoUrl}}'];
    
    Object.values(templatePaths).forEach(templatePath => {
      const template = fs.readFileSync(templatePath, 'utf-8');
      requiredPlaceholders.forEach(placeholder => {
        expect(template).toContain(placeholder);
      });
    });
  });
});