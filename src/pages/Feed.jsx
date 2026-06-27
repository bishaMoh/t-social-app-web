import { useEffect, useState } from 'react';
import { tees } from '../api/client';
import { usePreferences } from '../context/PreferencesContext';
import TeeCard from '../components/TeeCard';
import PageHeader from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const { user } = useAuth();
  const { prefs } = usePreferences();
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [feedTab, setFeedTab] = useState(prefs.feedMode || 'following');

  useEffect(() => {
    setFeedTab(prefs.feedMode || 'following');
  }, [prefs.feedMode]);

  async function loadFeed(mode = feedTab) {
    setLoading(true);
    setError('');
    try {
      const data = mode === 'foryou' ? await tees.forYou() : await tees.feed();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed(feedTab);
  }, [feedTab]);

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setPosting(true);
    setError('');
    try {
      await tees.create({ text: text.trim(), published: true });
      setText('');
      await loadFeed(feedTab);
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Home" subtitle="Your personalized timeline">
        <div className="flex rounded-full border p-0.5 bg-secondary/30">
          <Button
            size="sm"
            variant={feedTab === 'following' ? 'default' : 'ghost'}
            className="rounded-full px-4 h-8"
            onClick={() => setFeedTab('following')}
          >
            Following
          </Button>
          <Button
            size="sm"
            variant={feedTab === 'foryou' ? 'default' : 'ghost'}
            className="rounded-full px-4 h-8"
            onClick={() => setFeedTab('foryou')}
          >
            For You
          </Button>
        </div>
      </PageHeader>

      <div className="flex px-4 py-4 border-b gap-3 bg-card/50">
        <Avatar className="h-11 w-11 flex-shrink-0 ring-2 ring-background">
          <AvatarImage src={user?.profilePicture} alt={user?.name} />
          <AvatarFallback className="bg-secondary text-foreground font-bold">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <form onSubmit={handlePost} className="flex-1 flex flex-col gap-2">
          <textarea
            className="w-full resize-none outline-none bg-transparent placeholder:text-muted-foreground text-lg min-h-[72px] py-1.5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What is happening?!"
            rows={2}
          />
          <div className="flex justify-between items-center border-t pt-3 mt-1">
            <div className="text-sm text-destructive">{error}</div>
            <Button type="submit" disabled={posting || !text.trim()} className="rounded-full px-6 font-bold">
              {posting ? 'Posting…' : 'Post'}
            </Button>
          </div>
        </form>
      </div>

      <div className={`flex flex-col ${prefs.compactFeed ? 'gap-0' : ''}`}>
        {loading && <p className="text-muted-foreground text-center py-8">Loading feed…</p>}
        {!loading && items.length === 0 && (
          <div className="text-center py-16 px-6 text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Nothing here yet</p>
            <p className="text-sm">
              {feedTab === 'foryou'
                ? 'Add interests in Settings to improve your For You feed.'
                : 'Follow someone or post your first tee.'}
            </p>
          </div>
        )}
        {items.map((tee) => (
          <TeeCard
            key={tee.id}
            tee={tee}
            onUpdate={() => loadFeed(feedTab)}
            compact={prefs.compactFeed}
          />
        ))}
      </div>
    </div>
  );
}
