// VueMultiCustomFilterWrapper.js - 包装Vue组件为AG-Grid筛选器
import { createApp } from 'vue'
import VueMultiCustomFilter from './VueMultiCustomFilter.vue'

class VueMultiCustomFilterWrapper {
  constructor() {
    this.vueComponent = null;
    this.vueApp = null;
    this.container = null;
    this.filterChangedCallback = null;
    this.api = null;
    this.column = null;
    this.colDef = null;
  }

  // AG-Grid筛选器接口方法
  init(params) {
    console.log('VueMultiCustomFilterWrapper init被调用', params);
    
    this.filterChangedCallback = params.filterChangedCallback;
    this.api = params.api;
    this.column = params.column;
    this.colDef = params.colDef;
    
    // 创建容器
    this.container = document.createElement('div');
    
    // 创建Vue应用
    this.vueApp = createApp(VueMultiCustomFilter, {
      // 传递props
      filterChangedCallback: this.filterChangedCallback,
      api: this.api,
      column: this.column,
      colDef: this.colDef
    });
    
    // 挂载Vue应用
    this.vueComponent = this.vueApp.mount(this.container);
    
    // 调用Vue组件的init方法
    if (this.vueComponent && typeof this.vueComponent.init === 'function') {
      this.vueComponent.init(params);
    }
    
    console.log('VueMultiCustomFilterWrapper 初始化完成');
  }

  // AG-Grid筛选器接口方法
  isFilterActive() {
    if (this.vueComponent && typeof this.vueComponent.isFilterActive === 'function') {
      return this.vueComponent.isFilterActive();
    }
    return false;
  }

  getModel() {
    if (this.vueComponent && typeof this.vueComponent.getModel === 'function') {
      return this.vueComponent.getModel();
    }
    return null;
  }

  setModel(model) {
    if (this.vueComponent && typeof this.vueComponent.setModel === 'function') {
      this.vueComponent.setModel(model);
    }
  }

  doesFilterPass(params) {
    if (this.vueComponent && typeof this.vueComponent.doesFilterPass === 'function') {
      return this.vueComponent.doesFilterPass(params);
    }
    return true;
  }

  getGui() {
    return this.container;
  }

  afterGuiAttached() {
    console.log('VueMultiCustomFilterWrapper GUI attached');
    if (this.vueComponent && typeof this.vueComponent.afterGuiAttached === 'function') {
      this.vueComponent.afterGuiAttached();
    }
  }

  afterGuiDetached() {
    console.log('VueMultiCustomFilterWrapper GUI detached');
    if (this.vueComponent && typeof this.vueComponent.afterGuiDetached === 'function') {
      this.vueComponent.afterGuiDetached();
    }
  }

  destroy() {
    console.log('VueMultiCustomFilterWrapper destroyed');
    if (this.vueComponent && typeof this.vueComponent.destroy === 'function') {
      this.vueComponent.destroy();
    }
    if (this.vueApp) {
      this.vueApp.unmount();
    }
    if (this.container) {
      this.container.remove();
    }
  }
}

export default VueMultiCustomFilterWrapper;
