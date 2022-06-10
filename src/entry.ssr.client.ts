import App from './App.svelte';

const app = new App({
  target: document.querySelector('#app') as Element,
  hydrate: true,
})

export default app;
