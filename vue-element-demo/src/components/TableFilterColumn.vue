<template>
  <el-table-column :prop="prop" :label="label" :width="width">
    <template slot="header" slot-scope="scope">
      <div class="custom-table-header">
        <span>{{ label }}</span>
      
        <el-popover
          placement="bottom"
          width="200"
          trigger="click"
          :visible-change="handleVisibleChange"
          popper-class="filter-popover-container"
          v-model="popoverVisible">
          <table-filter-popover
            ref="filterPopover"
            :title="label + '筛选'"
            :options="filterOptions"
            :initial-selected="selectedValues"
            :visible="popoverVisible"
            @confirm="handleFilterConfirm"
            @cancel="handleFilterCancel"
          />
          <span 
            slot="reference" 
            class="filter-icon-wrapper"
          >
            <img 
              v-if="isFiltered" 
              class="filter-icon" 
              :src="require('@/assets/icons/icon-filter-active.svg')" 
              alt="筛选"
            />
            <img 
              v-else 
              class="filter-icon" 
              :src="require('@/assets/icons/icon-filter-normal.svg')" 
              alt="筛选"
            />
          </span>
        </el-popover>
      </div>
    </template>
    <template slot-scope="scope">
      <slot :row="scope.row">
        {{ scope.row[prop] }}
      </slot>
    </template>
  </el-table-column>
</template>

<script>
import TableFilterPopover from './TableFilterPopover.vue'

export default {
  name: 'TableFilterColumn',
  components: {
    TableFilterPopover
  },
  props: {
    prop: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    width: {
      type: [String, Number],
      default: ''
    },
    filterOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      popoverVisible: false,
      selectedValues: [],
      isFiltered: false
    }
  },
  methods: {
    handleVisibleChange(visible) {
      // 当popover打开时，直接调用子组件方法清空搜索框
      if (visible && this.$refs.filterPopover) {
        this.$refs.filterPopover.clearSearch();
        this.$refs.filterPopover.searchText = ''; // 直接设置搜索文本为空
      }
      
      // 当popover关闭且没有选中任何值时，重置过滤条件
      if (!visible && this.selectedValues.length === 0) {
        this.isFiltered = false;
        this.$emit('filter-change', []);
      }
    },
    handleFilterConfirm(values) {
      this.selectedValues = values;
      this.isFiltered = values.length > 0;
      this.popoverVisible = false;
      this.$emit('filter-change', values);
    },
    handleFilterCancel() {
      this.popoverVisible = false;
    }
  },
  watch: {
    popoverVisible(val) {
      // 当popover显示状态变化时，如果是打开状态，也尝试清空搜索框
      if (val && this.$refs.filterPopover) {
        this.$nextTick(() => {
          this.$refs.filterPopover.clearSearch();
          this.$refs.filterPopover.searchText = '';
        });
      }
    }
  }
}
</script>

<style scoped lang="less">
.custom-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .filter-icon-wrapper {
    cursor: pointer;
    margin-left: 5px;
    display: inline-flex;
    align-items: center;
    
    .filter-icon {
      width: 16px;
      height: 16px;
      vertical-align: middle;
    }
  }
}
</style>

<style lang="less">
.filter-popover-container {
  padding: 0;
}
</style> 