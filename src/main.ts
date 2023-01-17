import './assets/style.css';

import { createApp } from 'vue';
import Popper from 'vue3-popper';

import App from './App.vue';

const app = createApp(App);
app.mount('#app');
// eslint-disable-next-line vue/multi-word-component-names
app.component('Popper', Popper);
