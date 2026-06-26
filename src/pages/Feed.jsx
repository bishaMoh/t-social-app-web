import { useEffect, useState } from 'react';
import { tees } from '../api/client';
import TeeCard from '../components/TeeCard';

export default function Feed() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  async function loadFeed() {
    setLoading(true);
    setError('');
    try {
      const data = await tees.feed();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setPosting(true);
    setError('');
    try {
      await tees.create({ text: text.trim(), published: true });
      setText('');
      await loadFeed();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="page">
      <section className="panel composer">
        <h1>Your feed</h1>
        <p className="muted">Tees from you and people you follow.</p>
        <form onSubmit={handlePost} className="composer-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
          />
          <button type="submit" className="btn btn-primary" disabled={posting}>
            {posting ? 'Posting…' : 'Post tee'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="stack">
        {loading && <p className="muted">Loading feed…</p>}
        {!loading && items.length === 0 && (
          <div className="empty">No tees yet. Follow someone or post your first tee.</div>
        )}
        {items.map((tee) => (
          <TeeCard key={tee.id} tee={tee} onUpdate={loadFeed} />
        ))}
      </section>
    </main>
  );
}
