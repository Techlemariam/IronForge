/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        login(): Chainable<void>;
    }
}

Cypress.Commands.add('login', () => {
    // 1. Define Test User Credentials
    // Ideally from env vars, but hardcoding for this test-runner context is acceptable if restricted
    const email = 'test@ironforge.gg';
    const password = 'Password123!';

    // 2. Programmatic Login via Supabase REST API
    // We avoid the UI login flow to speed up tests and bypass potential UI flakes.
    const supabaseUrl = Cypress.env('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = Cypress.env('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase Env Vars missing in Cypress.');
    }

    cy.request({
        method: 'POST',
        url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
        headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
        },
        body: {
            email,
            password,
        },
    }).then((response) => {
        expect(response.status).to.eq(200);
        const { access_token, refresh_token, user } = response.body;

        // 3. Set the Cookie/LocalStorage logic that Supabase Client expects
        // Next.js SSR Supabase uses cookies.
        // We need to set the specific cookie name. Usually `sb-<ref>-auth-token`
        // We can check how to format this.

        // Actually, @supabase/ssr reads from cookies.
        // The cookie name format: `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
        // Let's deduce project ref.
        const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
        const cookieName = `sb-${projectRef}-auth-token`;

        // The cookie value is a serialized JSON of the session tokens
        const cookieValue = JSON.stringify([access_token, refresh_token, null, null, null]);

        // Set the cookie
        cy.setCookie(cookieName, cookieValue);

        // Also set localStorage for client-side hydration if needed
        window.localStorage.setItem(cookieName, JSON.stringify({
            access_token,
            refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            expires_in: 3600,
            token_type: 'bearer',
            user: user
        }));
    });
});
