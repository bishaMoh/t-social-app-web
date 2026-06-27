import { useEffect, useState } from 'react';
import { tees } from '../api/client';
import TeeCard from '../components/TeeCard';
import PageHeader from '../components/PageHeader';

export default function Explore() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTees() {
    setLoading(true);
    setError('');
    try {
      const data = await tees.published();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTees();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Explore" subtitle="Discover trending tees across T Social" />

      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Trending now</h2>
          <p className="text-muted-foreground mt-1 text-sm">See what's happening on T Social right now.</p>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>

        {loading && <p className="text-muted-foreground text-center py-8">Loading…</p>}
        {!loading && items.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
            No published tees yet.
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="columns-1 md:columns-2 gap-4 space-y-4">
            {items.map((tee) => (
              <TeeCard key={tee.id} tee={tee} onUpdate={loadTees} variant="grid" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
