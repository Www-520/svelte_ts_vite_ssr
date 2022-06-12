import App from './App.svelte';

const app = new App({
  target: document.querySelector('#app') as Element,
  hydrate: import.meta.env.MODE === 'ssr',
});

export default app;
