require('svelte/register');
const App = require('./App.svelte').default;

export default (props: any) => App.render(props);
