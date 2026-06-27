import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { follows } from '../api/client';
import { Card, CardContent } from '../components/ui/card';
import PageHeader from '../components/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadRequests() {
    setLoading(true);
    setError('');
    try {
      const data = await follows.pending();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleAccept(followId) {
    try {
      await follows.accept(followId);
      await loadRequests();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(followId) {
    try {
      await follows.reject(followId);
      await loadRequests();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Follow requests" subtitle="People who want to follow you" />

      <div className="p-4 md:p-6">
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        <section className="grid gap-4">
        {loading && <p className="text-muted-foreground text-center py-8">Loading…</p>}
        {!loading && requests.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
            No pending requests.
          </div>
        )}
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <Link to={`/users/${request.follower.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.follower.profilePicture} alt={request.follower.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {request.follower.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-base">{request.follower.name}</span>
                  <span className="text-sm text-muted-foreground">@{request.follower.username}</span>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handleAccept(request.id)}>
                  Accept
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleReject(request.id)}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </section>
      </div>
    </div>
  );
}
