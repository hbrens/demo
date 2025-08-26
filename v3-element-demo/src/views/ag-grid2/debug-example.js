// 调试示例：展示Vue组件和JavaScript类的差异

// 1. 纯JavaScript类（工作正常）
class PureJSFilter {
  constructor() {
    this.value = 'test';
  }
  
  isFilterActive() {
    return true;
  }
  
  getModel() {
    return { value: this.value };
  }
  
  doesFilterPass(params) {
    return true;
  }
}

// 2. 模拟Vue组件的defineExpose（有问题）
const createVueLikeFilter = () => {
  const methods = {
    isFilterActive: () => true,
    getModel: () => ({ value: 'test' }),
    doesFilterPass: (params) => true
  };
  
  // 模拟Vue的defineExpose行为
  return new Proxy(methods, {
    get(target, prop) {
      console.log(`访问属性: ${prop}`);
      return target[prop];
    }
  });
};

// 3. 测试函数
export const testFilterInterfaces = () => {
  console.log('=== 测试纯JavaScript类 ===');
  const jsFilter = new PureJSFilter();
  console.log('isFilterActive存在:', 'isFilterActive' in jsFilter);
  console.log('isFilterActive类型:', typeof jsFilter.isFilterActive);
  console.log('所有属性:', Object.getOwnPropertyNames(jsFilter));
  
  console.log('\n=== 测试Vue-like代理对象 ===');
  const vueFilter = createVueLikeFilter();
  console.log('isFilterActive存在:', 'isFilterActive' in vueFilter);
  console.log('isFilterActive类型:', typeof vueFilter.isFilterActive);
  console.log('所有属性:', Object.getOwnPropertyNames(vueFilter));
  
  // 测试AG-Grid可能使用的检查方式
  console.log('\n=== 测试AG-Grid接口检查 ===');
  
  // 方式1：直接属性访问
  console.log('JS Filter - 直接访问:', typeof jsFilter.isFilterActive);
  console.log('Vue Filter - 直接访问:', typeof vueFilter.isFilterActive);
  
  // 方式2：Object.keys检查
  console.log('JS Filter - Object.keys:', Object.keys(jsFilter));
  console.log('Vue Filter - Object.keys:', Object.keys(vueFilter));
  
  // 方式3：hasOwnProperty检查
  console.log('JS Filter - hasOwnProperty:', jsFilter.hasOwnProperty('isFilterActive'));
  console.log('Vue Filter - hasOwnProperty:', vueFilter.hasOwnProperty('isFilterActive'));
  
  // 方式4：in操作符检查
  console.log('JS Filter - in操作符:', 'isFilterActive' in jsFilter);
  console.log('Vue Filter - in操作符:', 'isFilterActive' in vueFilter);
};

// 4. 解决方案：正确的Vue组件暴露方式
export const createCorrectVueFilter = () => {
  // 创建一个包含所有方法的对象
  const filterMethods = {
    isFilterActive: function() {
      return this.selectedValues.length !== this.allOptions.length;
    },
    getModel: function() {
      if (!this.isFilterActive()) {
        return null;
      }
      return {
        filterType: 'multiCustom',
        values: this.selectedValues
      };
    },
    setModel: function(model) {
      if (model && model.values) {
        this.selectedValues = model.values;
      } else {
        this.selectedValues = this.allOptions.map(option => option.value);
      }
    },
    doesFilterPass: function(params) {
      const value = params.data[this.column.getColId()];
      return this.selectedValues.includes(value);
    },
    getGui: function() {
      return this.gui;
    },
    afterGuiAttached: function() {
      console.log('GUI attached');
    },
    afterGuiDetached: function() {
      console.log('GUI detached');
    },
    destroy: function() {
      console.log('Filter destroyed');
    }
  };
  
  // 创建一个构造函数
  const FilterConstructor = function() {
    this.selectedValues = [];
    this.allOptions = [];
    this.gui = null;
    this.column = null;
    
    // 将方法绑定到实例
    Object.keys(filterMethods).forEach(methodName => {
      this[methodName] = filterMethods[methodName].bind(this);
    });
  };
  
  return FilterConstructor;
};

export default {
  testFilterInterfaces,
  createCorrectVueFilter
};
