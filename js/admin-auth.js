/* ===== BlueBush Admin — Supabase Auth (Google OAuth) =====
 *
 * Responsibilities:
 *   1. On page load: check existing Supabase session or handle OAuth callback.
 *   2. If a valid session exists, verify the user's email is in admin_roles.
 *   3. Expose role to the rest of admin.js (window.BB_ADMIN_ROLE).
 *   4. Provide handleGoogleLogin() and handleLogout() replacements.
 *
 * Requires (loaded before this script):
 *   - js/env.js          (window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
 *   - @supabase/supabase-js CDN (window.supabase.createClient)
 */

'use strict';

(function () {

  /* ── Supabase client ─────────────────────────────────── */
  let _sbClient = null;

  function getSbClient() {
    if (_sbClient) return _sbClient;
    if (
      !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY ||
      typeof window.supabase === 'undefined' ||
      typeof window.supabase.createClient !== 'function'
    ) {
      console.error('BlueBush Admin Auth: Supabase not available.');
      return null;
    }
    _sbClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      {
        auth: {
          // Use PKCE flow with the page itself as the redirect target.
          flowType: 'pkce',
          detectSessionInUrl: true,
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
    return _sbClient;
  }

  /* ── UI helpers ──────────────────────────────────────── */
  function showLogin() {
    document.getElementById('admin-app')?.classList.add('hidden');
    document.getElementById('login-overlay')?.classList.remove('hidden');
    document.getElementById('login-error')?.classList.remove('visible');
  }

  function showError(msg) {
    const el = document.getElementById('login-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
  }

  function setLoginLoading(loading) {
    const btn = document.getElementById('login-submit');
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Redirecting…' : 'Sign in with Google';
  }

  /* ── Role check ──────────────────────────────────────── */
  /**
   * Queries the admin_roles table using the user's JWT.
   * Returns the role string ('owner', 'admin', 'staff', 'viewer')
   * or null if the email is not allowlisted.
   * @param {object} session — Supabase session object
   * @returns {Promise<string|null>}
   */
  async function fetchAdminRole(session) {
    const client = getSbClient();
    if (!client) return null;
    try {
      const email = session?.user?.email;
      if (!email) return null;
      const { data, error } = await client
        .from('admin_roles')
        .select('role')
        .eq('email', email)
        .single();
      if (error || !data) return null;
      return data.role;
    } catch {
      return null;
    }
  }

  /* ── Initialise ──────────────────────────────────────── */
  /**
   * Called once on DOMContentLoaded.
   * Handles OAuth callback codes, checks existing sessions, and
   * either shows the app or the login screen.
   */
  async function initAuth() {
    const client = getSbClient();
    if (!client) {
      showError('Authentication service unavailable. Check Supabase configuration.');
      return;
    }

    // Exchange the PKCE code in the URL (after OAuth redirect) if present.
    const { data: { session }, error: sessionError } = await client.auth.getSession();

    if (sessionError) {
      console.error('BlueBush Admin: getSession error', sessionError);
      showLogin();
      return;
    }

    if (session) {
      await _handleSession(session);
    } else {
      showLogin();
    }
  }

  /**
   * Validates a Supabase session against the admin_roles allowlist
   * and either enters the admin app or shows an error.
   * @param {object} session
   */
  async function _handleSession(session) {
    const role = await fetchAdminRole(session);
    if (!role) {
      // Authenticated with Google but not in the allowlist.
      const client = getSbClient();
      if (client) await client.auth.signOut();
      showLogin();
      showError('Access denied. Your account is not authorised for this admin panel.');
      return;
    }

    // Expose role globally for the rest of admin.js to use.
    window.BB_ADMIN_ROLE = role;

    const email = session.user.email;
    const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email;

    // Show admin app (defined in admin.js).
    if (typeof window.showAdminApp === 'function') {
      window.showAdminApp(name, email, role);
    }
  }

  /* ── Public API ──────────────────────────────────────── */

  /**
   * Initiates Supabase Google OAuth (PKCE).
   * Redirects the browser to Google's consent page.
   */
  async function handleGoogleLogin() {
    const client = getSbClient();
    if (!client) {
      showError('Authentication service unavailable.');
      return;
    }
    setLoginLoading(true);
    const loc = window.location;
    const redirectTo = loc.origin + loc.pathname;
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      setLoginLoading(false);
      showError('Google sign-in failed: ' + error.message);
    }
    // On success the browser is redirected; no further action needed here.
  }

  /**
   * Signs out of Supabase and returns to the login screen.
   */
  async function handleLogout() {
    const client = getSbClient();
    if (client) {
      await client.auth.signOut().catch(() => {});
    }
    window.BB_ADMIN_ROLE = null;
    showLogin();
  }

  /**
   * Returns the current Supabase access token (JWT) for use in API calls.
   * Returns null when not authenticated.
   * @returns {Promise<string|null>}
   */
  async function getAccessToken() {
    const client = getSbClient();
    if (!client) return null;
    const { data: { session } } = await client.auth.getSession();
    return session?.access_token ?? null;
  }

  // ── Auth state listener — handles token refresh + tab sync ──
  // Initialised after getSbClient() to avoid a premature call.
  function attachAuthListener() {
    const client = getSbClient();
    if (!client) return;
    client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await _handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        window.BB_ADMIN_ROLE = null;
        showLogin();
      }
    });
  }

  // ── Expose on window ─────────────────────────────────────────
  window.bbAdminAuth = {
    initAuth,
    handleGoogleLogin,
    handleLogout,
    getAccessToken,
    fetchAdminRole,
  };

  // ── Boot ─────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      attachAuthListener();
      initAuth();
    });
  } else {
    attachAuthListener();
    initAuth();
  }

})();
