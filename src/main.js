// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import VueResource from 'vue-resource'
import moment from 'moment'
Vue.prototype.moment = moment

Vue.use(VueResource)

Vue.config.productionTip = false

Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  template: '<App/>',
  components: { App }
})
