/* ===== BlueBush Admin — Supabase Auth (Google OAuth) =====
 *
 * Responsibilities:
 *   1. On page load: check existing Supabase session or handle OAuth callback.
 *   2. If a valid session exists, verify the user's email is in admin_roles.
 *   3. Expose role to the rest of admin.js (window.BB_ADMIN_ROLE).
 *   4. Provide handleGoogleLogin() and handleLogout() for the UI.
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
    const btn = document.getElementById('login-submit');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="flex-shrink:0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Sign in with Google`;
    }
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
    if (loading) {
      btn.textContent = 'Redirecting…';
    }
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

    // Try to get an existing session first.
    // With flowType:'pkce' + detectSessionInUrl:true, Supabase automatically
    // exchanges any ?code= present in the URL during client initialisation.
    let { data: { session }, error: sessionError } = await client.auth.getSession();

    if (sessionError) {
      console.error('BlueBush Admin: getSession error', sessionError);
      showLogin();
      showError('Session error: ' + sessionError.message);
      return;
    }

    // Explicit fallback: if detectSessionInUrl hasn't exchanged the code yet,
    // call exchangeCodeForSession directly (safe for GitHub Pages / static hosts).
    if (!session) {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      if (code) {
        try {
          const { data: exchangeData, error: exchangeError } =
            await client.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('BlueBush Admin: code exchange error', exchangeError);
            showLogin();
            showError('Sign-in failed: ' + exchangeError.message);
            return;
          }
          session = exchangeData?.session ?? null;
        } catch (e) {
          console.error('BlueBush Admin: exchangeCodeForSession threw', e);
          showLogin();
          showError('Sign-in failed. Please try again.');
          return;
        }
      }
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
    const name = session.user.user_metadata?.full_name
      || session.user.user_metadata?.name
      || email;

    // Clean up the PKCE ?code=... query param from the URL after a successful login.
    if (new URLSearchParams(location.search).has('code')) {
      history.replaceState({}, document.title, location.pathname);
    }

    // Show admin app (defined in admin.js). Guard against race where admin.js
    // may not yet have run; retry via requestAnimationFrame up to 60 frames (~1 s).
    let _retries = 0;
    function tryShowApp() {
      if (typeof window.showAdminApp === 'function') {
        window.showAdminApp(name, email, role);
      } else if (_retries++ < 60) {
        requestAnimationFrame(tryShowApp);
      } else {
        console.error('BlueBush Admin: showAdminApp not available after retries.');
        showError('App failed to load. Please refresh the page.');
      }
    }
    tryShowApp();
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
      await client.auth.signOut().catch(err => console.error('BlueBush Admin: signOut error', err));
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