<template>
  <div class="vue-multi-custom-filter">
    <div class="filter-header">
      <div class="filter-title">Vue筛选条件</div>
      <div class="filter-actions">
        <button class="btn-select-all" @click="selectAll">全选</button>
        <button class="btn-clear-all" @click="clearAll">清空</button>
      </div>
    </div>
    <div class="filter-content">
      <div class="filter-search">
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索..." 
          v-model="searchText"
        />
      </div>
      <div class="filter-list">
        <div 
          v-for="option in filteredOptions" 
          :key="option.value"
          class="filter-option"
        >
          <label>
            <input 
              type="checkbox" 
              :value="option.value" 
              v-model="selectedValues"
            />
            <span class="option-text">{{ option.label }}</span>
            <span class="option-count">({{ option.count }})</span>
          </label>
        </div>
      </div>
    </div>
    <div class="filter-footer">
      <button class="btn-apply" @click="applyFilter">应用</button>
      <button class="btn-reset" @click="resetFilter">重置</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VueMultiCustomFilter',
  data() {
    return {
      selectedValues: [],
      allOptions: [],
      searchText: '',
      filterChangedCallback: null,
      api: null,
      column: null,
      colDef: null
    }
  },
  computed: {
    filteredOptions() {
      if (!this.searchText) {
        return this.allOptions;
      }
      return this.allOptions.filter(option => 
        option.label.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  },
  mounted() {
    console.log('VueMultiCustomFilter mounted');
  },
  methods: {
    // AG-Grid筛选器接口方法
    init(params) {
      console.log('VueMultiCustomFilter init被调用', params);
      this.filterChangedCallback = params.filterChangedCallback;
      this.api = params.api;
      this.column = params.column;
      this.colDef = params.colDef;
      
      this.initOptions();
    },
    
    initOptions() {
      console.log('VueMultiCustomFilter initOptions被调用');
      const colId = this.column.getColId();
      const allData = [];
      
      // 获取当前表格中的所有数据
      this.api.forEachNodeAfterFilterAndSort((node) => {
        if (node.data) {
          allData.push(node.data[colId]);
        }
      });
      
      console.log(`VueMultiCustomFilter for column ${colId}, total data rows:`, allData.length);
      
      const valueCounts = new Map();
      
      // 统计每个值的出现次数
      allData.forEach(value => {
        const count = valueCounts.get(value) || 0;
        valueCounts.set(value, count + 1);
      });
      
      // 转换为选项格式
      this.allOptions = Array.from(valueCounts.entries())
        .map(([value, count]) => ({
          value,
          label: String(value),
          count
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      
      // 默认全选
      this.selectedValues = this.allOptions.map(option => option.value);
      
      console.log(`VueMultiCustomFilter generated options for ${colId}:`, this.allOptions);
    },
    
    // UI操作方法
    selectAll() {
      this.selectedValues = this.allOptions.map(option => option.value);
    },
    
    clearAll() {
      this.selectedValues = [];
    },
    
    applyFilter() {
      console.log('VueMultiCustomFilter applyFilter被调用');
      this.filterChangedCallback();
    },
    
    resetFilter() {
      this.selectedValues = this.allOptions.map(option => option.value);
      this.filterChangedCallback();
    },
    
    // AG-Grid筛选器接口方法
    isFilterActive() {
      return this.selectedValues.length !== this.allOptions.length;
    },
    
    getModel() {
      if (!this.isFilterActive()) {
        return null;
      }
      return {
        filterType: 'vueMultiCustom',
        values: this.selectedValues
      };
    },
    
    setModel(model) {
      if (model && model.values) {
        this.selectedValues = model.values;
      } else {
        this.selectedValues = this.allOptions.map(option => option.value);
      }
    },
    
    doesFilterPass(params) {
      const value = params.data[this.column.getColId()];
      return this.selectedValues.includes(value);
    },
    
    getGui() {
      return this.$el;
    },
    
    afterGuiAttached() {
      console.log('VueMultiCustomFilter GUI attached');
    },
    
    afterGuiDetached() {
      console.log('VueMultiCustomFilter GUI detached');
    },
    
    destroy() {
      console.log('VueMultiCustomFilter destroyed');
    }
  }
}
</script>

<style scoped>
.vue-multi-custom-filter {
  width: 250px;
  padding: 12px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.filter-title {
  font-weight: 500;
  color: #303133;
}

.filter-actions {
  display: flex;
  gap: 4px;
}

.filter-actions button {
  padding: 2px 8px;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  background: #fff;
  cursor: pointer;
}

.filter-actions button:hover {
  background: #f5f7fa;
}

.filter-search {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
}

.filter-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
}

.filter-option {
  padding: 4px 0;
  border-bottom: 1px solid #f5f7fa;
}

.filter-option:last-child {
  border-bottom: none;
}

.filter-option label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 12px;
}

.option-text {
  margin-right: 4px;
}

.option-count {
  color: #909399;
  font-size: 11px;
}

.filter-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.filter-footer button {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  background: #fff;
  cursor: pointer;
}

.btn-apply {
  background: #409eff !important;
  color: white;
  border-color: #409eff !important;
}

.btn-apply:hover {
  background: #337ecc !important;
}
</style>
