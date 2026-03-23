import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsApi } from '../lib/api';
import { Layout } from '../components/Layout';
import { useSubscription } from '../contexts/SubscriptionContext';

interface Project {
  id: string;
  name: string;
  api_key: string;
  feedback_count: number;
  created_at: string;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const { tier, usage } = useSubscription();
  const navigate = useNavigate();

  const isAtProjectLimit = usage && usage.projects.limit !== null && usage.projects.count >= usage.projects.limit;

  const loadProjects = async () => {
    try {
      const { data } = await projectsApi.list();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await projectsApi.create(newName.trim());
      setNewName('');
      setShowCreate(false);
      await loadProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm font-medium"
        >
          New Project
        </button>
      </div>

      {isAtProjectLimit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              You've reached the project limit for your {tier?.displayName} tier ({usage?.projects.count}/{usage?.projects.limit} projects).
            </p>
            <p className="text-sm text-blue-700 mt-0.5">Upgrade to unlock more projects.</p>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 shrink-0"
            style={{ backgroundColor: '#3B82F6' }}
          >
            Upgrade to {tier?.tier === 'starter' ? 'Pro' : 'Agency'}
          </button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 flex gap-3">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Project name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => { setShowCreate(false); setNewName(''); }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            Cancel
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm font-medium"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {project.feedback_count} feedback item{project.feedback_count !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400 font-mono truncate">
                API Key: {project.api_key.substring(0, 16)}...
              </p>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
