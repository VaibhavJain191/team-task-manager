# Team Task Manager

A full-stack task management application designed for small teams to organize projects and track progress. It enforces strict project-based access, ensuring that only project creators have admin control while members can manage their assigned tasks.

## Features

- User authentication with JWT
- Project creation and joining
- Role-based access control (project owners and members)
- Task creation, assignment, and status updates
- Dashboard with task statistics

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT

## Folder Structure

```text
├── controllers/
├── middleware/
├── models/
├── routes/
└── frontend/
    ├── src/
    │   ├── components/
    │   └── pages/
```

## Setup Instructions

### Backend

1. Clone the repository and navigate to the project directory.
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongo_url
   JWT_SECRET=your_secret
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Make sure to set these in your backend `.env` file:

- `PORT`: Port for the server (e.g., 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key used for signing JWT tokens

## Usage

1. Sign up for a new account.
2. Create a new project (you automatically become the owner).
3. Add members to your project using their email or user ID.
4. Create tasks and assign them to your members.
5. Track progress as members update their task statuses.

## Deployment Steps

### Backend

1. Deploy the backend on platforms like Render or Railway.
2. Set the environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`) in your hosting dashboard.
3. Use the start command: `npm start`

### Frontend

1. Deploy the frontend on Vercel or Netlify.
2. Update the API base URL in your frontend configuration to point to the deployed backend.

## Future Improvements

- Notifications
- File attachments
- Better UI
