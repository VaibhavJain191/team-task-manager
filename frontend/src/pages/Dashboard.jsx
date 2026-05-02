import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';

const defaultStats = {
  total: 0,
  completed: 0,
  pending: 0,
  overdue: 0,
};

function getId(value) {
  if (!value) {
    return 'unassigned';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value._id || value.id || value.email || 'unassigned';
}

function getUserName(user) {
  if (!user) {
    return 'Unassigned';
  }

  if (typeof user === 'string') {
    return user;
  }

  return user.name || user.email || getId(user);
}

function groupTasksByUser(tasks) {
  const grouped = {};

  tasks.forEach((task) => {
    const user = task.assignedTo;
    const userId = getId(user);

    if (!grouped[userId]) {
      grouped[userId] = {
        id: userId,
        name: getUserName(user),
        count: 0,
      };
    }

    grouped[userId].count += 1;
  });

  return Object.values(grouped);
}

function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [tasksPerUser, setTasksPerUser] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardResponse, tasksResponse] = await Promise.all([
          api.get('/api/tasks/dashboard'),
          api.get('/api/tasks'),
        ]);
        const dashboardData = dashboardResponse.data;
        const tasksData = tasksResponse.data;
        const tasks = Array.isArray(tasksData) ? tasksData : tasksData.tasks || [];

        setStats({
          total: dashboardData.total ?? dashboardData.totalTasks ?? 0,
          completed: dashboardData.completed ?? dashboardData.completedTasks ?? 0,
          pending: dashboardData.pending ?? dashboardData.pendingTasks ?? 0,
          overdue: dashboardData.overdue ?? dashboardData.overdueTasks ?? 0,
        });
        setTasksPerUser(groupTasksByUser(tasks));
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard.');
      }
    }

    loadDashboard();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page">
        <h1>Dashboard</h1>
        {error && <p className="error">{error}</p>}
        <section className="stats-grid">
          <article>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </article>
          <article>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </article>
          <article>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </article>
          <article>
            <span>Overdue</span>
            <strong>{stats.overdue}</strong>
          </article>
        </section>

        <section className="panel dashboard-section">
          <h2>Tasks per User</h2>
          <div className="user-task-list">
            {tasksPerUser.map((user) => (
              <article className="user-task-card" key={user.id}>
                <span>{user.name}</span>
                <strong>{user.count}</strong>
              </article>
            ))}
            {tasksPerUser.length === 0 && <p className="muted">No tasks found.</p>}
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
