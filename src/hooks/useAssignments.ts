import { useEffect, useState } from 'react';
import { assignmentService } from '../services/assets';
import type { Assignment } from '../types';

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    assignmentService.getMyAssignments()
      .then(res => {
        if (res.success && res.data) {
          setAssignments(res.data);
        } else {
          setError(res.error || 'Zimmetler alınamadı');
        }
      })
      .catch(() => setError('Zimmetler alınamadı'))
      .finally(() => setLoading(false));
  }, []);

  return { assignments, loading, error };
}
