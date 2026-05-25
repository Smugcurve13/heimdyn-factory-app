'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LayoutDashboard, Trash2, ArrowRight } from 'lucide-react';
import { loadDashboards, createDashboard, deleteDashboard, SavedDashboard } from '@/lib/dashboardStorage';

export default function MakeYourOwnPage() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<SavedDashboard[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const refresh = () => { loadDashboards().then(setDashboards); };

  useEffect(() => {
    refresh();
    window.addEventListener('dashboards-updated', refresh);
    return () => window.removeEventListener('dashboards-updated', refresh);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const dash = await createDashboard(name.trim());
    setName('');
    setCreating(false);
    router.push(`/make-your-own/${dash.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Dashboards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage your custom dashboard views</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> New Dashboard
        </button>
      </div>

      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-base">Name your dashboard</h2>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Weekly Production Review"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setCreating(false); setName(''); }}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={!name.trim()}
                className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors">
                Create & Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard grid */}
      {dashboards.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center h-[55vh] rounded-2xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-accent/10 transition-colors"
          onClick={() => setCreating(true)}
        >
          <div className="rounded-full bg-muted p-4 mb-4">
            <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold">No dashboards yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click here or press <span className="font-medium text-foreground">New Dashboard</span> to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((dash) => (
            <div key={dash.id}
              className="rounded-xl border bg-card shadow-sm p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>
                <button
                  onClick={() => { deleteDashboard(dash.id).then(refresh); }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive/20 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{dash.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dash.items.length} item{dash.items.length !== 1 ? 's' : ''} · Created {new Date(dash.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => router.push(`/make-your-own/${dash.id}`)}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg border py-2 text-xs font-medium hover:bg-accent transition-colors"
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
