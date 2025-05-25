# Deploying to GoDaddy with Your Domain

This guide will help you deploy your Birthday Reminder app to GoDaddy using your existing domain.

## Option 1: Deploy with Heroku (Free Tier) + GoDaddy Domain

### Step 1: Deploy to Heroku (Free Tier)

1. Create a Heroku account at [heroku.com](https://heroku.com) if you don't have one
2. Install the Heroku CLI:
   ```
   npm install -g heroku
   ```

3. Login to Heroku:
   ```
   heroku login
   ```

4. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```

5. Add a Procfile to your project root:
   ```
   echo "web: node server.js" > Procfile
   ```

6. Set up environment variables:
   ```
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your_session_secret
   heroku config:set MONGO_URI=your_mongodb_connection_string
   heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
   heroku config:set EMAIL=your_email
   heroku config:set EMAIL_PASSWORD=your_email_password
   heroku config:set DOMAIN=https://your-domain.com
   ```

7. Deploy your app:
   ```
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```

### Step 2: Connect GoDaddy Domain to Heroku

1. Log in to your GoDaddy account
2. Go to your domain's DNS settings
3. Add the following records:
   - Type: CNAME
   - Name: www
   - Value: your-app-name.herokuapp.com
   - TTL: 1 hour

4. Add another record for the root domain:
   - Type: A
   - Name: @
   - Value: 76.76.21.21 (Heroku's IP address)
   - TTL: 1 hour

5. Wait for DNS changes to propagate (can take up to 48 hours)

6. Update your Google OAuth settings:
   - Go to the Google Developer Console
   - Add your domain to the authorized redirect URIs:
     - https://your-domain.com/auth/google/callback

## Option 2: Deploy with Render (Free Tier) + GoDaddy Domain

Render offers a free tier that's easier to set up than Heroku:

1. Create an account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `npm install && npm run build`
   - Start Command: `node server.js`
   - Add environment variables (same as Heroku)

5. Deploy your app
6. Connect your GoDaddy domain following Render's instructions

## Option 3: Deploy with Netlify (Frontend) + Render (Backend)

1. Deploy the frontend to Netlify:
   - Create an account at [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

2. Deploy the backend to Render as described above
3. Connect your GoDaddy domain to Netlify

## Setting Up MongoDB Atlas (Free Tier)

For your database:

1. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier)
3. Set up a database user with password
4. Configure network access (allow access from anywhere for simplicity)
5. Get your connection string and use it for MONGO_URI

## Setting Up Google OAuth

1. Go to [console.developers.google.com](https://console.developers.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth credentials
5. Add authorized redirect URIs:
   - http://localhost:4000/auth/google/callback (for development)
   - https://your-domain.com/auth/google/callback (for production)

## Final Steps

1. Test your application thoroughly
2. Make sure all environment variables are set correctly
3. Verify that authentication works
4. Check that email notifications are being sent

Remember to update the DOMAIN environment variable to match your actual domain name.