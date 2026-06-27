import { useEffect, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import PageHeader from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-foreground' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { prefs, loading, updatePreferences } = usePreferences();
  const [interestsText, setInterestsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefs.interests?.length) {
      setInterestsText(prefs.interests.join(', '));
    }
  }, [prefs.interests]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Personalization" subtitle="Loading your preferences…" />
      </div>
    );
  }

  async function handleSaveInterests(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const interests = interestsText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      await updatePreferences({ interests });
      setMessage('Interests saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(key, value) {
    setError('');
    setMessage('');
    try {
      await updatePreferences({ [key]: value });
      setMessage('Preferences updated.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFeedMode(mode) {
    setError('');
    setMessage('');
    try {
      await updatePreferences({ feedMode: mode });
      setMessage('Feed preference saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <PageHeader
        title="Personalization"
        subtitle="Tailor your feed, layout, and notifications"
      />

      <div className="p-4 md:p-6 space-y-6 max-w-xl">
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <section className="rounded-2xl border p-4 md:p-5 bg-card">
          <h2 className="font-bold text-lg">Feed experience</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Choose what shows up first on your home timeline.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={prefs.feedMode === 'following' ? 'default' : 'outline'}
              className="rounded-full h-auto py-3 flex-col items-start px-4"
              onClick={() => handleFeedMode('following')}
            >
              <span className="font-semibold">Following</span>
              <span className="text-xs opacity-80 font-normal">People you follow</span>
            </Button>
            <Button
              variant={prefs.feedMode === 'foryou' ? 'default' : 'outline'}
              className="rounded-full h-auto py-3 flex-col items-start px-4"
              onClick={() => handleFeedMode('foryou')}
            >
              <span className="font-semibold">For You</span>
              <span className="text-xs opacity-80 font-normal">Trending & interests</span>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 md:p-5 bg-card">
          <h2 className="font-bold text-lg">Your interests</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add topics you care about. We use these to personalize your For You feed.
          </p>
          <form onSubmit={handleSaveInterests} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="interests">Topics (comma separated)</Label>
              <Input
                id="interests"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="design, music, tech"
              />
            </div>
            <Button type="submit" disabled={saving} className="rounded-full">
              {saving ? 'Saving…' : 'Save interests'}
            </Button>
          </form>
          {prefs.interests?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {prefs.interests.map((interest) => (
                <span key={interest} className="text-xs px-3 py-1 rounded-full bg-secondary font-medium">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border p-4 md:p-5 bg-card">
          <h2 className="font-bold text-lg">Display & notifications</h2>
          <Separator className="my-2" />
          <ToggleRow
            label="Show trending sidebar"
            description="Highlight popular topics on the right panel"
            checked={prefs.showTrending}
            onChange={(value) => handleToggle('showTrending', value)}
          />
          <ToggleRow
            label="Compact feed"
            description="Tighter spacing between posts"
            checked={prefs.compactFeed}
            onChange={(value) => handleToggle('compactFeed', value)}
          />
          <ToggleRow
            label="Message notifications"
            description="Highlight unread conversations in navigation"
            checked={prefs.notifyMessages}
            onChange={(value) => handleToggle('notifyMessages', value)}
          />
        </section>
      </div>
    </div>
  );
}
