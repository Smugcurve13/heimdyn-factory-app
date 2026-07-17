// ponytail: temporary login bypass, auto-expires by timestamp. Delete this file
// and its two call sites (lib/auth.ts, components/AuthProvider.tsx) after the window closes.
export const BYPASS_UNTIL = Date.parse('2026-07-18T02:54:14Z'); // 24h from deploy setup (2026-07-17T02:54Z); edit to cancel/extend
export const bypassActive = () => Date.now() < BYPASS_UNTIL;

// Synthetic session used while the bypass is active.
export const BYPASS_USER = {
  user_id: 0,
  email: 'guest@heimdyn.local',
  username: 'Guest',
  role: 'superadmin',
};
