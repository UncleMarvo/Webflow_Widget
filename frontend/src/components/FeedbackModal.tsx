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

interface Props {
  feedback: FeedbackItem;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onPriorityChange: (id: string, priority: string) => void;
  statusColors: Record<string, string>;
  priorityColors: Record<string, string>;
}

export function FeedbackModal({ feedback, onClose, onStatusChange, onPriorityChange, statusColors, priorityColors }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Feedback Detail</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>

          {/* Screenshot */}
          {feedback.screenshot_url && (
            <div className="mb-4 relative">
              <img
                src={feedback.screenshot_url}
                alt="Screenshot"
                className="w-full rounded-lg border border-gray-200"
              />
              {feedback.x != null && feedback.y != null && (
                <div
                  className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${feedback.x}%`, top: `${feedback.y}%` }}
                />
              )}
            </div>
          )}

          {/* Annotation */}
          <div className="mb-6">
            <label className="block text-sm text-gray-500 mb-1">Comment</label>
            <p className="text-gray-900">{feedback.annotation}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Page</label>
              <p className="text-sm text-gray-900 truncate">{feedback.page_title || 'Untitled'}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">URL</label>
              <a href={feedback.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                {feedback.url}
              </a>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Device</label>
              <p className="text-sm text-gray-900">{feedback.device_type || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Browser</label>
              <p className="text-sm text-gray-900">
                {feedback.browser_name
                  ? `${feedback.browser_name}${feedback.browser_version ? ' ' + feedback.browser_version : ''}`
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">OS</label>
              <p className="text-sm text-gray-900">
                {feedback.os_name
                  ? `${feedback.os_name}${feedback.os_version ? ' ' + feedback.os_version : ''}`
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Viewport</label>
              <p className="text-sm text-gray-900">
                {feedback.viewport_width && feedback.viewport_height
                  ? `${feedback.viewport_width} x ${feedback.viewport_height}`
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Screen Resolution</label>
              <p className="text-sm text-gray-900">
                {feedback.screen_width && feedback.screen_height
                  ? `${feedback.screen_width} x ${feedback.screen_height}`
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Pixel Ratio</label>
              <p className="text-sm text-gray-900">{feedback.device_pixel_ratio || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Submitted</label>
              <p className="text-sm text-gray-900">{new Date(feedback.created_at).toLocaleString()}</p>
            </div>
            {feedback.x != null && feedback.y != null && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">Pin Position</label>
                <p className="text-sm text-gray-900">{Math.round(feedback.x)}%, {Math.round(feedback.y)}%</p>
              </div>
            )}
          </div>

          {/* User Agent */}
          {feedback.user_agent && (
            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-1">User Agent</label>
              <p
                className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md cursor-pointer hover:bg-gray-100 break-all"
                title="Click to copy"
                onClick={() => navigator.clipboard.writeText(feedback.user_agent!)}
              >
                {feedback.user_agent}
              </p>
            </div>
          )}

          {/* Status & Priority */}
          <div className="flex gap-4 border-t border-gray-200 pt-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Status</label>
              <select
                value={feedback.status}
                onChange={e => onStatusChange(feedback.id, e.target.value)}
                className={`px-3 py-1.5 text-sm rounded-md border-0 cursor-pointer ${statusColors[feedback.status] || ''}`}
              >
                <option value="todo">todo</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Priority</label>
              <select
                value={feedback.priority}
                onChange={e => onPriorityChange(feedback.id, e.target.value)}
                className={`px-3 py-1.5 text-sm rounded-md border-0 cursor-pointer ${priorityColors[feedback.priority] || ''}`}
              >
                <option value="low">low</option>
                <option value="normal">normal</option>
                <option value="high">high</option>
                <option value="urgent">urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
