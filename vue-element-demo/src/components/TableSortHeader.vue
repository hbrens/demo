<template>
  <div class="table-sort-header">
    <span>{{ label }}</span>
    <span class="sort-icons">
      <i 
        class="el-icon-caret-top" 
        :class="{ 'active': sortOrder === 'asc' }"
        @click.stop="handleSort('asc')"></i>
      <i 
        class="el-icon-caret-bottom" 
        :class="{ 'active': sortOrder === 'desc' }"
        @click.stop="handleSort('desc')"></i>
    </span>
  </div>
</template>

<script>
export default {
  name: 'TableSortHeader',
  props: {
    prop: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    currentSort: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    sortOrder() {
      return this.currentSort.prop === this.prop ? this.currentSort.order : '';
    }
  },
  methods: {
    handleSort(order) {
      // 如果已经是当前排序方式，再次点击取消排序
      const newOrder = this.sortOrder === order ? '' : order;
      this.$emit('sort-change', {
        prop: this.prop,
        order: newOrder
      });
    }
  }
}
</script>

<style scoped lang="less">
.table-sort-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .sort-icons {
    display: flex;
    flex-direction: column;
    margin-left: 5px;
    
    i {
      font-size: 12px;
      color: #C0C4CC;
      cursor: pointer;
      height: 10px;
      
      &.active {
        color: #409EFF;
      }
      
      &:hover {
        color: #409EFF;
      }
    }
  }
}
</style> 