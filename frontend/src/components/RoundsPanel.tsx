import { useState } from 'react';
import { roundsApi } from '../lib/api';
import { RoundDetailModal } from './RoundDetailModal';
import { useSubscription } from '../contexts/SubscriptionContext';

export interface Round {
  id: string;
  project_id: string;
  name: string;
  status: 'active' | 'frozen' | 'archived';
  description: string | null;
  feedback_count: number;
  created_at: string;
  updated_at: string;
  starts_at: string | null;
  ends_at: string | null;
}

interface Props {
  projectId: string;
  rounds: Round[];
  onRoundsChange: () => void;
  onFilterByRound: (roundId: string | null) => void;
  activeRoundFilter: string | null;
}

const statusBadge: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  frozen: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-100 text-gray-500',
};

export function RoundsPanel({ projectId, rounds, onRoundsChange, onFilterByRound, activeRoundFilter }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { hasFeature } = useSubscription();

  const handleFreeze = async (roundId: string) => {
    setActionLoading(roundId);
    try {
      await roundsApi.freeze(roundId);
      onRoundsChange();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to freeze round');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfreeze = async (roundId: string) => {
    setActionLoading(roundId);
    try {
      await roundsApi.unfreeze(roundId);
      onRoundsChange();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unfreeze round');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (roundId: string) => {
    if (!confirm('Archive this round? Feedback will be unassigned.')) return;
    setActionLoading(roundId);
    try {
      await roundsApi.delete(roundId);
      onRoundsChange();
      if (activeRoundFilter === roundId) onFilterByRound(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to archive round');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = () => {
    setEditingRound(null);
    setShowModal(true);
  };

  const handleEdit = (round: Round) => {
    setEditingRound(round);
    setShowModal(true);
  };

  const handleModalSave = async (data: { name: string; description: string; startsAt: string; endsAt: string }) => {
    try {
      if (editingRound) {
        await roundsApi.update(editingRound.id, data);
      } else {
        await roundsApi.create(projectId, data);
      }
      setShowModal(false);
      onRoundsChange();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save round');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Feedback Rounds</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onFilterByRound(null)}
            className={`px-3 py-1.5 text-xs rounded-md border ${
              activeRoundFilter === null ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {hasFeature('rounds') ? (
            <button
              onClick={handleCreate}
              className="px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800"
            >
              New Round
            </button>
          ) : (
            <span className="px-3 py-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md" title="Upgrade to Premium">
              Premium Feature
            </span>
          )}
        </div>
      </div>

      {rounds.length === 0 ? (
        <p className="text-sm text-gray-500">No rounds yet.</p>
      ) : (
        <div className="space-y-2">
          {rounds.map(round => (
            <div
              key={round.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                activeRoundFilter === round.id
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onFilterByRound(activeRoundFilter === round.id ? null : round.id)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{round.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge[round.status]}`}>
                    {round.status}
                  </span>
                  <span className="text-xs text-gray-400">{round.feedback_count} items</span>
                </div>
                {round.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{round.description}</p>
                )}
                {(round.starts_at || round.ends_at) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {round.starts_at && new Date(round.starts_at).toLocaleDateString()}
                    {round.starts_at && round.ends_at && ' - '}
                    {round.ends_at && new Date(round.ends_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              {hasFeature('rounds') && (
                <div className="flex gap-1 ml-3 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleEdit(round)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    disabled={actionLoading === round.id}
                  >
                    Edit
                  </button>
                  {round.status === 'active' && (
                    <button
                      onClick={() => handleFreeze(round.id)}
                      className="px-2 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                      disabled={actionLoading === round.id}
                    >
                      Freeze
                    </button>
                  )}
                  {round.status === 'frozen' && (
                    <button
                      onClick={() => handleUnfreeze(round.id)}
                      className="px-2 py-1 text-xs border border-green-300 text-green-600 rounded hover:bg-green-50"
                      disabled={actionLoading === round.id}
                    >
                      Unfreeze
                    </button>
                  )}
                  <button
                    onClick={() => handleArchive(round.id)}
                    className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                    disabled={actionLoading === round.id}
                  >
                    Archive
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RoundDetailModal
          round={editingRound}
          onSave={handleModalSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
