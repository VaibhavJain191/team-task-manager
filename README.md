# 🚀 Team Task Manager

A full-stack MERN application that allows teams to create projects, assign tasks, and track progress with strict project-based role access. Designed as a simplified version of tools like Trello and Asana.

---

## 🔥 Features

* 🔐 User authentication with JWT (Signup/Login)
* 📁 Project creation and joining via Project ID
* 👥 Project-based role access (Owner & Members)
* ✅ Task creation, assignment, and status updates
* 📊 Dashboard with task insights (total, completed, pending, overdue)
* 🔄 Real-time UI updates without refresh

---

## 🛡️ Role-Based Access

### 👑 Project Owner (Admin)

* Create projects
* Add/remove members
* Assign tasks to any member
* View all tasks in the project

### 👤 Member

* View tasks of joined projects
* Update status of assigned tasks only
* Cannot assign tasks or manage members

---

## 🧱 Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Authentication:** JWT

---

## 📁 Folder Structure

```text
├── controllers/
├── middleware/
├── models/
├── routes/
├── config/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
├── server.js
├── package.json
```

---

## ⚙️ Setup Instructions

### 🔹 Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/VaibhavJain191/team-task-manager.git
   cd team-task-manager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file in root:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. Start backend server:

   ```bash
   npm run dev
   ```

---

### 🔹 Frontend Setup

1. Move to frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start frontend:

   ```bash
   npm run dev
   ```

4. Open browser:

   ```
   http://localhost:5173
   ```

---

## 🌐 API Overview

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Projects

* `GET /api/projects`
* `POST /api/projects`
* `POST /api/projects/join`
* `PUT /api/projects/:id/members`

### Tasks

* `GET /api/tasks`
* `POST /api/tasks`
* `PUT /api/tasks/:id/assign`
* `PUT /api/tasks/:id/status`

---

## 📊 Usage

1. Register a new user
2. Create a project → you become **Owner**
3. Share Project ID → others can join
4. Add members to your project
5. Create and assign tasks
6. Members update task status
7. Track everything via dashboard

---

## 🚀 Deployment

### Backend (Railway / Render)

* Set environment variables:

  * `MONGO_URI`
  * `JWT_SECRET`
  * `PORT`
* Start command:

  ```bash
  npm start
  ```

### Frontend (Vercel / Netlify)

* Deploy `frontend` folder
* Update API base URL in:

  ```
  src/services/api.js
  ```
## Live Demo

Frontend: https://team-task-manager-c827jfo67-vjs-projects-a222e98a.vercel.app/  
Backend: https://team-task-manager-production-4216.up.railway.app/

## 🔮 Future Improvements

* 🔔 Notifications system
* 📎 File attachments
* 🔍 Search & filters
* 📱 Responsive UI enhancements

---

## 👨‍💻 Author

**Vaibhav Jain**
GitHub: https://github.com/VaibhavJain191


