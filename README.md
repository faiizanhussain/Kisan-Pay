# KisanPay Project

## VIDEO DEMONSTRATION:
  ### [KISANPAY DEMONSTRATION VIDEO (Youtube)](https://youtu.be/Z63YGy731_o)

## Project Structure

- `backend/`: Contains all server-side code including API endpoints, database configurations, and server setup.
  - `config/`: Database configurations and other setups.
    .env:Contains the application configuration variables
    DATABASE_URL: Specifies the PostgreSQL connection string that includes the username, password, host, and database name.
    PORT: The port number on which the backend server runs.
    db.js:Sets up the PostgreSQL database connection using pooling from the pg library:
  - `routes/`: Definitions of endpoint routes for different functionalities and  Logic for handling requests.

  
- `frontend/`: React application that provides the user interface.
  - `src/`
    - `components/`: Reusable React components.
    - `pages/`: React components that represent whole pages.
    - `App.js`: Main React component that handles routing.
  - `public/`: Public assets like HTML templates and images.

## Setup Instructions

### Backend Setup
   `npm install`

   `node app.js` (for starting backend server)

### Frontend setup

`cd ../frontend`

`npm install`

`npm start` (for starting frontend server)

# NOTE:

## run this command :
  `npm install` before executing

## use `node --watch app.js` instead of nodemon

## edit your own correct database url in `backend/config/.env`
  because i have edited on my own according to databse
