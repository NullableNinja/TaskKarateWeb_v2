import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      strict: false
    }),
    paths: {
      base: dev ? '' : '/student-dashboard'
    },
    prerender: {
      handleHttpError: 'warn',
      entries: []
    }
  }
};
