import { useEffect, useState } from 'react';
import { tees } from '../api/client';
import TeeCard from '../components/TeeCard';

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
    <main className="page">
      <section className="panel">
        <h1>Explore</h1>
        <p className="muted">All published tees on T Social.</p>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="stack">
        {loading && <p className="muted">Loading…</p>}
        {!loading && items.length === 0 && <div className="empty">No published tees yet.</div>}
        {items.map((tee) => (
          <TeeCard key={tee.id} tee={tee} onUpdate={loadTees} />
        ))}
      </section>
    </main>
  );
}
