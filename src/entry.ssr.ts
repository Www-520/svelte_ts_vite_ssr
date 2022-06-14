import App from './App.svelte';

export default () => (App as any).render().html as string;
