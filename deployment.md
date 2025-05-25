# Deployment Guide for Birthday Reminder App

This guide will help you deploy the Birthday Reminder application to a production environment.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database (Atlas or self-hosted)
- SMTP server for sending emails
- Google OAuth credentials (for authentication)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=4000
NODE_ENV=production
SESSION_SECRET=your_session_secret_here

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
EMAIL=your_email_address
EMAIL_PASSWORD=your_email_password
DOMAIN=https://your-domain.com
```

## Deployment Steps

### 1. Build the Frontend

```bash
npm run build
```

This will create a production build of the React application in the `dist` directory.

### 2. Serve Static Files

Update the server.js file to serve the static files from the build directory:

```javascript
// Add this to server.js
app.use(express.static(path.join(__dirname, 'dist')));

// Add this route at the end of your routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### 3. Deploy to a Hosting Service

#### Option 1: Heroku

1. Install the Heroku CLI and log in
   ```bash
   npm install -g heroku
   heroku login
   ```

2. Create a new Heroku app
   ```bash
   heroku create your-app-name
   ```

3. Set up environment variables
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your_session_secret
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
   heroku config:set EMAIL=your_email
   heroku config:set EMAIL_PASSWORD=your_email_password
   heroku config:set DOMAIN=https://your-app-name.herokuapp.com
   ```

4. Push to Heroku
   ```bash
   git push heroku main
   ```

#### Option 2: AWS EC2

1. Launch an EC2 instance
2. Install Node.js and npm
3. Clone your repository
4. Set up environment variables
5. Install PM2 for process management
   ```bash
   npm install -g pm2
   pm2 start server.js
   ```

6. Set up Nginx as a reverse proxy

#### Option 3: Vercel or Netlify (Frontend) + Separate Backend

1. Deploy the frontend to Vercel or Netlify
2. Deploy the backend to a service like Heroku, AWS, or DigitalOcean

## Post-Deployment

1. Update the Google OAuth callback URL in the Google Developer Console to match your production domain
2. Test the application thoroughly in the production environment
3. Set up monitoring and logging
4. Configure regular database backups

## Troubleshooting

- If emails are not being sent, check your SMTP configuration and firewall settings
- If authentication fails, verify your Google OAuth credentials and callback URLs
- For database connection issues, check your MongoDB connection string and network access settings