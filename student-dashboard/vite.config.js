import { sveltekit } from '@sveltejs/kit/vite';

const dev = process.argv.includes('dev');

export default {
  plugins: [sveltekit()],
  base: dev ? '' : '/student-dashboard/'
};
