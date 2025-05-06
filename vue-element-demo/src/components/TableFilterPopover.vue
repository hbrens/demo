<template>
  <div class="table-filter-popover">
    <div class="filter-header">
      <span>{{ title }}</span>
    </div>
    
    <div class="filter-search">
      <el-input
        v-model="searchText"
        size="mini"
        placeholder="搜索选项"
        prefix-icon="el-icon-search"
        clearable>
      </el-input>
    </div>
    
    <div class="filter-body">
      <el-checkbox
        v-model="selectAll"
        @change="handleCheckAllChange"
      >全选</el-checkbox>
      <el-checkbox-group v-model="selectedValues" @change="handleCheckedChange">
        <el-checkbox 
          v-for="item in filteredOptions" 
          :key="item.value" 
          :label="item.value"
        >{{ item.label }}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="filter-footer">
      <el-button type="text" size="mini" @click="resetFilter">重置</el-button>
      <div class="footer-right">
        <el-button type="text" size="mini" @click="cancelFilter">取消</el-button>
        <el-button type="text" size="mini" @click="confirmFilter">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableFilterPopover',
  props: {
    title: {
      type: String,
      default: '筛选'
    },
    options: {
      type: Array,
      default: () => []
    },
    initialSelected: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedValues: [],
      selectAll: false,
      searchText: ''
    }
  },
  computed: {
    filteredOptions() {
      if (!this.searchText) {
        return this.options;
      }
      
      const searchTerm = this.searchText.toLowerCase();
      return this.options.filter(item => {
        return item.label.toString().toLowerCase().includes(searchTerm) || 
               item.value.toString().toLowerCase().includes(searchTerm);
      });
    }
  },
  created() {
    this.selectedValues = [...this.initialSelected];
    this.checkSelectAllStatus();
  },
  methods: {
    clearSearch() {
      this.searchText = '';
    },
    handleCheckAllChange(val) {
      this.selectedValues = val ? this.filteredOptions.map(item => item.value) : [];
    },
    handleCheckedChange(values) {
      this.selectAll = this.filteredOptions.length > 0 && 
        this.filteredOptions.every(item => values.includes(item.value));
    },
    checkSelectAllStatus() {
      this.selectAll = this.filteredOptions.length > 0 && 
        this.filteredOptions.every(item => this.selectedValues.includes(item.value));
    },
    resetFilter() {
      this.selectedValues = [];
      this.selectAll = false;
      this.searchText = '';
    },
    cancelFilter() {
      this.searchText = ''; // 取消时也清空搜索框
      this.$emit('cancel');
    },
    confirmFilter() {
      this.searchText = ''; // 确认时也清空搜索框
      this.$emit('confirm', this.selectedValues);
    }
  },
  watch: {
    searchText() {
      this.checkSelectAllStatus();
    },
    initialSelected(newVal) {
      this.selectedValues = [...newVal];
      this.checkSelectAllStatus();
    }
  }
}
</script>

<style scoped lang="less">
.table-filter-popover {
  padding: 10px;
  min-width: 150px;
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    span {
      font-weight: bold;
    }
  }
  
  .filter-search {
    margin-bottom: 10px;
  }
  
  .filter-body {
    margin-bottom: 10px;
    max-height: 200px;
    overflow-y: auto;
    
    .el-checkbox-group {
      display: flex;
      flex-direction: column;
      margin-top: 5px;
      
      .el-checkbox {
        margin-left: 0;
        margin-bottom: 5px;
      }
    }
  }
  
  .filter-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .footer-right {
      display: flex;
      
      .el-button + .el-button {
        margin-left: 10px;
      }
    }
  }
}
</style> 