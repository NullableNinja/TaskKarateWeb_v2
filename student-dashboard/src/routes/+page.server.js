import { redirect } from '@sveltejs/kit';

/**
 * Server-side redirect from the root of the student-dashboard app
 * SvelteKit throws redirect exceptions from load functions.
 */
export function load() {
  throw redirect(302, '/login');
}
