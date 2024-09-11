import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'

import 'element-plus/dist/index.css'
import 'normalize.css'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.mount('#app')

