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
      role: payload.role,
      email: payload.email,
      name: payload.name,
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

function getMembers(project) {
  return Array.isArray(project.members) ? project.members : [];
}

function isAdminProject(project, currentUser) {
  const creatorId = getId(project.createdBy);

  return creatorId === currentUser?.id;
}

function Projects() {
  const currentUser = getCurrentUser();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinProjectId, setJoinProjectId] = useState('');
  const [memberInputs, setMemberInputs] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function loadProjects() {
    try {
      const { data } = await api.get('/api/projects');
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load projects.');
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreateProject(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      const { data } = await api.post('/api/projects', {
        title: name,
        name,
        description,
      });

      setName('');
      setDescription('');
      setSuccess(data.message || 'Project created successfully.');
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create project.');
    } finally {
      setIsLoading(false);
    }
  }


  async function handleAddMember(projectId, memberValue) {
    const userId = memberValue.trim();

    if (!userId) {
      setError('Enter a user email or userId.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

  try {
    const { data } = await api.put(`/api/projects/${projectId}/members`, { userId });

    await loadProjects();

    setMemberInputs((currentInputs) => ({
      ...currentInputs,
      [projectId]: '',
    }));

    setSuccess(data.message || 'Member added successfully.');
  } catch (err) {
    setError(err.response?.data?.message || 'Unable to add member.');
  } finally {
    setIsLoading(false);
  }
}
  async function handleJoinProject(event) {
    event.preventDefault();

    if (!currentUser?.id) {
      setError('Unable to find current user from token.');
      return;
    }

    if (!joinProjectId.trim()) {
      setError('Enter a projectId.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { data } = await api.post(`/api/projects/join`, {
        projectId: joinProjectId.trim(),
      });

      setJoinProjectId('');
      setSuccess(data.message || 'Joined project successfully.');
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to join project.');
    } finally {
      setIsLoading(false);
    }
  }

  const alreadyJoined = projects.some((p) => getId(p) === joinProjectId.trim());

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-header">
          <h1>Projects</h1>
        </div>

        <form className="panel" onSubmit={handleCreateProject}>
          <h2>Create Project</h2>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </form>

        <form className="panel" onSubmit={handleJoinProject}>
          <h2>Join Project</h2>
          <label>
            Project ID
            <input
              value={joinProjectId}
              onChange={(event) => setJoinProjectId(event.target.value)}
              placeholder="Enter projectId"
              required
            />
          </label>
          <button type="submit" disabled={isLoading || alreadyJoined}>
            {isLoading ? 'Joining...' : alreadyJoined ? 'Already joined' : 'Join Project'}
          </button>
        </form>

        <Toast message={error} type="error" onClose={() => setError('')} />
        <Toast message={success} type="success" onClose={() => setSuccess('')} />

        <section className="list">
          {projects.map((project) => {
            const projectId = getId(project);
            const members = getMembers(project);
            const canManageMembers = isAdminProject(project, currentUser);

            return (
              <article className="list-item project-card" key={projectId}>
                <div className="project-header">
                  <div>
                    <h3>{project.title || project.name}</h3>
                    {project.description && <p>{project.description}</p>}
                    <p className="muted">Project ID: {projectId}</p>
                  </div>
                </div>

                <div className="members-section">
                  <h4>Members</h4>
                  {members.length > 0 ? (
                    <ul className="members-list">
                      {members.map((member) => (
                        <li key={getId(member)}>
                          <span>{member.name || member.email}</span>
                          <small>{member.email || getId(member)}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No members found.</p>
                  )}
                </div>

                {canManageMembers && (
                  <div className="member-controls">
                    <input
                      value={memberInputs[projectId] || ''}
                      onChange={(event) => (
                        setMemberInputs({
                          ...memberInputs,
                          [projectId]: event.target.value,
                        })
                      )}
                      placeholder="User email or userId"
                    />
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleAddMember(projectId, memberInputs[projectId] || '')}
                    >
                      {isLoading ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          {projects.length === 0 && <p className="muted">No projects found.</p>}
        </section>
      </main>
    </>
  );
}

export default Projects;
