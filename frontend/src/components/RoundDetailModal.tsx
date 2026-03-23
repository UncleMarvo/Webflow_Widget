import { useState } from 'react';
import type { Round } from './RoundsPanel';

interface Props {
  round: Round | null; // null = create mode
  onSave: (data: { name: string; description: string; startsAt: string; endsAt: string }) => void;
  onClose: () => void;
}

export function RoundDetailModal({ round, onSave, onClose }: Props) {
  const [name, setName] = useState(round?.name || '');
  const [description, setDescription] = useState(round?.description || '');
  const [startsAt, setStartsAt] = useState(round?.starts_at?.slice(0, 10) || '');
  const [endsAt, setEndsAt] = useState(round?.ends_at?.slice(0, 10) || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), startsAt, endsAt });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {round ? 'Edit Round' : 'New Round'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Round 1 - Discovery"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What's this round about?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date (optional)</label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={e => setStartsAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date (optional)</label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={e => setEndsAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : round ? 'Save Changes' : 'Create Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
