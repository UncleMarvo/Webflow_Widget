import { feedbackApi } from '../lib/api';
import type { Round } from './RoundsPanel';

interface Props {
  feedbackId: string;
  currentRoundId: string | null;
  currentRoundName: string | null;
  currentRoundStatus: string | null;
  rounds: Round[];
  onAssigned: () => void;
}

export function FeedbackRoundAssignment({
  feedbackId,
  currentRoundId,
  currentRoundName,
  currentRoundStatus,
  rounds,
  onAssigned,
}: Props) {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    const roundId = value === '' ? null : value;
    try {
      await feedbackApi.moveToRound(feedbackId, roundId);
      onAssigned();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to move feedback');
    }
  };

  // Don't allow changes if feedback is in a frozen round
  if (currentRoundStatus === 'frozen') {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700" title="Round is frozen">
        {currentRoundName || 'Frozen'}
      </span>
    );
  }

  // Only show assignable (active) rounds
  const assignableRounds = rounds.filter(r => r.status === 'active');

  return (
    <select
      value={currentRoundId || ''}
      onChange={handleChange}
      onClick={e => e.stopPropagation()}
      className="px-2 py-0.5 text-xs rounded-full border-0 cursor-pointer bg-purple-50 text-purple-700"
      title="Assign to round"
    >
      <option value="">Unassigned</option>
      {assignableRounds.map(round => (
        <option key={round.id} value={round.id}>{round.name}</option>
      ))}
    </select>
  );
}
