# Birthday & Event Reminder Application

A full-stack application to help users remember important dates like birthdays, anniversaries, and other events.

## Features

- User authentication with Google OAuth
- Create, edit, and delete event reminders
- Different reminder types (birthday, anniversary, other events)
- Email notifications for upcoming events
- Customized email templates based on event type
- Responsive UI built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Passport.js with Google OAuth
- **Email**: Nodemailer
- **Scheduling**: node-cron

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Google OAuth credentials

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/bday-reminder.git
   cd bday-reminder
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   EMAIL=your_email_for_sending_reminders
   EMAIL_PASSWORD=your_email_password
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Testing

Run the test suite with:
```bash
npm test
```

## Deployment

See [deployment.md](deployment.md) for detailed deployment instructions.

## Project Structure

```
bday-reminder/
├── emails/                  # Email templates
├── models/                  # MongoDB models
├── public/                  # Static assets
├── services/                # Backend services
├── src/                     # React frontend
│   ├── components/          # React components
│   └── ...
├── tests/                   # Test files
├── utils/                   # Utility functions
├── .env                     # Environment variables
├── server.js                # Express server
└── package.json
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.