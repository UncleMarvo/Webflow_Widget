import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi, feedbackApi } from '../lib/api';
import { Layout } from '../components/Layout';
import { FeedbackModal } from '../components/FeedbackModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { useSubscription } from '../contexts/SubscriptionContext';

interface Project {
  id: string;
  name: string;
  api_key: string;
  created_at: string;
}

interface FeedbackItem {
  id: string;
  url: string;
  page_title: string | null;
  x: number | null;
  y: number | null;
  annotation: string;
  screenshot_url: string | null;
  device_type: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  browser_name: string | null;
  browser_version: string | null;
  os_name: string | null;
  os_version: string | null;
  user_agent: string | null;
  device_pixel_ratio: number | null;
  screen_width: number | null;
  screen_height: number | null;
  status: string;
  priority: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
  const { hasFeature } = useSubscription();

  const loadFeedback = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await feedbackApi.list(id, { page, status: statusFilter || undefined });
      setFeedback(data.feedback);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    }
  }, [id, page, statusFilter]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectsApi.get(id).then(r => { setProject(r.data); setEditName(r.data.name); }),
      loadFeedback(),
    ]).finally(() => setLoading(false));
  }, [id, loadFeedback]);

  const handleStatusChange = async (feedbackId: string, status: string) => {
    await feedbackApi.update(feedbackId, { status });
    await loadFeedback();
  };

  const handlePriorityChange = async (feedbackId: string, priority: string) => {
    await feedbackApi.update(feedbackId, { priority });
    await loadFeedback();
  };

  const handleExportCsv = async () => {
    if (!id) return;
    const { data } = await projectsApi.exportCsv(id);
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'feedback'}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteProject = async () => {
    if (!id || !confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    await projectsApi.delete(id);
    navigate('/projects');
  };

  const handleUpdateName = async () => {
    if (!id || !editName.trim()) return;
    await projectsApi.update(id, editName.trim());
    setProject(prev => prev ? { ...prev, name: editName.trim() } : null);
    setShowSettings(false);
  };

  const handleRegenApiKey = async () => {
    if (!id || !confirm('Regenerate API key? The old key will stop working immediately.')) return;
    const { data } = await projectsApi.regenerateApiKey(id);
    setProject(prev => prev ? { ...prev, api_key: data.api_key } : null);
  };

  const embedCode = project ? `<script src="YOUR_DOMAIN/embed.js" data-api-key="${project.api_key}"></script>` : '';

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Project not found</div>
      </Layout>
    );
  }

  const statusColors: Record<string, string> = {
    'todo': 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'done': 'bg-green-100 text-green-700',
  };

  const priorityColors: Record<string, string> = {
    'low': 'bg-gray-100 text-gray-600',
    'normal': 'bg-gray-100 text-gray-700',
    'high': 'bg-orange-100 text-orange-700',
    'urgent': 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button onClick={() => navigate('/projects')} className="text-sm text-gray-500 hover:text-gray-700 mb-1">&larr; Back to projects</button>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowEmbed(!showEmbed)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Embed Code</button>
          <button onClick={handleExportCsv} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Export CSV</button>
          <button onClick={() => setShowSettings(!showSettings)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Settings</button>
          {!hasFeature('rounds') && (
            <button
              onClick={() => setUpgradeFeature('rounds')}
              className="px-3 py-1.5 text-sm border border-amber-300 text-amber-700 bg-amber-50 rounded-md hover:bg-amber-100"
            >
              Rounds
            </button>
          )}
          {!hasFeature('api_access') && (
            <button
              onClick={() => setUpgradeFeature('api_access')}
              className="px-3 py-1.5 text-sm border border-amber-300 text-amber-700 bg-amber-50 rounded-md hover:bg-amber-100"
            >
              API Access
            </button>
          )}
        </div>
      </div>

      {/* Embed Code Panel */}
      {showEmbed && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Embed Code</h3>
          <p className="text-sm text-gray-600 mb-3">Add this script to your website's custom code section (before &lt;/body&gt;):</p>
          <code className="block bg-gray-50 p-4 rounded-md text-sm font-mono break-all">{embedCode}</code>
          <button
            onClick={() => navigator.clipboard.writeText(embedCode)}
            className="mt-3 px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Project Settings</h3>
          <div className="flex gap-3">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button onClick={handleUpdateName} className="px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800">Save</button>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">API Key</label>
            <div className="flex gap-3 items-center">
              <code className="flex-1 bg-gray-50 px-3 py-2 rounded-md text-sm font-mono truncate">
                {showApiKey ? project.api_key : project.api_key.substring(0, 8) + '•'.repeat(32)}
              </code>
              <button onClick={() => setShowApiKey(!showApiKey)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              <button onClick={handleRegenApiKey} className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50">Regenerate</button>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button onClick={handleDeleteProject} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete Project</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['', 'todo', 'in-progress', 'done'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-md border ${statusFilter === s ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            {s === '' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No feedback yet. Add the embed code to your website to start collecting feedback.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map(item => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer transition-all"
              onClick={() => setSelectedFeedback(item)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.annotation}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{item.page_title || item.url}</p>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                  {item.device_type && (
                    <span className="text-xs text-gray-400">{item.device_type}</span>
                  )}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[item.priority] || ''}`}>
                    {item.priority}
                  </span>
                  <select
                    value={item.status}
                    onChange={e => { e.stopPropagation(); handleStatusChange(item.id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    className={`px-2 py-0.5 text-xs rounded-full border-0 cursor-pointer ${statusColors[item.status] || ''}`}
                  >
                    <option value="todo">todo</option>
                    <option value="in-progress">in-progress</option>
                    <option value="done">done</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                </span>
                {item.screenshot_url && (
                  <span className="text-xs text-blue-500">Has screenshot</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <FeedbackModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          statusColors={statusColors}
          priorityColors={priorityColors}
        />
      )}

      {/* Upgrade Modal */}
      {upgradeFeature && (
        <UpgradeModal feature={upgradeFeature} onClose={() => setUpgradeFeature(null)} />
      )}
    </Layout>
  );
}
