// Check for OAuth PKCE code in the URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    // Exchange the code for a session
    supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error }) => {
            if (error) {
                console.error('Error exchanging code for session:', error);
                return;
            }

            // Successful authentication
            console.log('Session exchanged successfully:', data);
            // Hide login overlay
            hideLoginOverlay();

            // Proceed with role check
            roleCheck();
            showAdminApp();
        });
} else {
    // Existing role allowlist logic
    roleCheck();
}