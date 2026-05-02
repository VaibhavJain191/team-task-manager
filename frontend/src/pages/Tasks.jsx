import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Toast from '../components/Toast.jsx';
import api from '../services/api.js';

function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload._id || payload.userId || payload.sub,
    };
  } catch {
    return null;
  }
}

function getId(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value._id || value.id || '';
}

function getProjectName(project) {
  if (!project) {
    return 'No project';
  }

  if (typeof project === 'string') {
    return project;
  }

  return project.title || project.name || getId(project);
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

function formatDate(value) {
  if (!value) {
    return 'No due date';
  }

  return new Date(value).toLocaleDateString();
}

function Tasks() {
  const currentUser = getCurrentUser();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function loadTasks() {
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tasks.');
    }
  }

  async function loadProjects() {
    try {
      const { data } = await api.get('/api/projects');
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load projects.');
    }
  }

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  const selectedProject = projects.find((p) => getId(p) === form.project);
  const projectMembers = selectedProject && Array.isArray(selectedProject.members) ? selectedProject.members : [];
  const canAssignNewTask = selectedProject && getId(selectedProject.createdBy) === currentUser?.id;

  async function handleCreateTask(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.project) {
      setError('Please select a project.');
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(form).filter(([, value]) => value !== '')
    );

    setIsLoading(true);
    try {
      const { data } = await api.post('/api/tasks', payload);

      setForm({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        dueDate: '',
        priority: 'Medium',
      });
      setSuccess(data.message || 'Task created successfully.');
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(taskId, status) {
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      const { data } = await api.patch(`/api/tasks/${taskId}/status`, { status });
      setSuccess(data.message || 'Task status updated successfully.');
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update task status.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAssignTask(taskId, userId) {
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      const { data } = await api.put(`/api/tasks/${taskId}/assign`, { userId });
      setSuccess(data.message || 'Task assigned successfully.');
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to assign task.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <h1>Tasks</h1>

        <form className="panel" onSubmit={handleCreateTask}>
          <h2>Create Task</h2>
          <div className="form-grid">
            <label>
              Title
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              Project
              <select name="project" value={form.project} onChange={handleChange} required>
                <option value="">Select project</option>
                {projects.map((project) => {
                  const isCreator = getId(project.createdBy) === currentUser?.id;
                  return (
                    <option 
                      key={getId(project)} 
                      value={getId(project)}
                      disabled={!isCreator}
                    >
                      {project.title || project.name} {!isCreator ? '(Creator only)' : ''}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              Assign To
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                onClick={() => {
                  if (!form.project) {
                    setError('Please select a project first.');
                  } else if (!canAssignNewTask) {
                    setError('Only project creator can assign tasks.');
                  }
                }}
              >
                {!form.project ? (
                  <option value="">Select project first</option>
                ) : !canAssignNewTask ? (
                  <option value="">Only creator can assign</option>
                ) : (
                  <>
                    <option value="">Unassigned</option>
                    {projectMembers.map((member) => (
                      <option key={member._id || getId(member)} value={member._id}>
                        {member.name || member.email || member._id}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </label>
            <label>
              Due Date
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
            </label>
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} />
          </label>
          <button type="submit" disabled={isLoading || !form.project || !canAssignNewTask}>
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </form>

        <Toast message={error} type="error" onClose={() => setError('')} />
        <Toast message={success} type="success" onClose={() => setSuccess('')} />

        <section className="list">
          {tasks.map((task) => {
            const taskId = getId(task);
            const taskProject = projects.find((p) => getId(p) === getId(task.project));
            const taskProjectMembers = taskProject && Array.isArray(taskProject.members) ? taskProject.members : [];
            const canAssign = task.project && getId(task.project.createdBy) === currentUser?.id;

            return (
              <article className="list-item task-card" key={taskId}>
                <div className="task-details">
                  <h3>{task.title || task.name}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta">
                    <span>Project: {getProjectName(task.project)}</span>
                    <span>Assigned To: {getUserName(task.assignedTo)}</span>
                    <span>Status: {task.status === 'in-progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'To Do'}</span>
                    <span>Due: {formatDate(task.dueDate)}</span>
                    <span>Priority: {task.priority || 'Medium'}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <select
                    value={task.status || 'todo'}
                    onChange={(event) => handleStatusChange(taskId, event.target.value)}
                    disabled={getId(task.assignedTo) !== currentUser?.id || isLoading}
                    title={getId(task.assignedTo) !== currentUser?.id ? 'Only the assigned user can update status' : ''}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <select
                    value={getId(task.assignedTo)}
                    onChange={(event) => handleAssignTask(taskId, event.target.value)}
                    disabled={!canAssign || taskProjectMembers.length === 0 || isLoading}
                    title={!canAssign ? 'Only project creator can assign tasks' : ''}
                  >
                    <option value="">Unassigned</option>
                    {taskProjectMembers.map((member) => (
                      <option key={member._id || getId(member)} value={member._id}>
                        {member.name || member.email || member._id}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            );
          })}
          {tasks.length === 0 && <p className="muted">No tasks found.</p>}
        </section>
      </main>
    </>
  );
}

export default Tasks;
