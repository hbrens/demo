<template>
  <div class="table-scroll">
    <el-button @click="handleTest">滚动</el-button>
    <el-table :data="tableData" style="width: 100%" max-height="500">
      <el-table-column prop="date" label="日期" width="180"></el-table-column>
      <el-table-column prop="name" label="姓名" width="180"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: []
    }
  },

  mounted () {
    this.mockData()
  },
  methods: {
    handleTest () {
      // 点击的时候 tabledata长度在4条和100条之间切换，是切换，不是累加
      if (this.tableData.length === 4) {
        this.mockData()
      } else {
        this.tableData = this.tableData.slice(0, 4)
      }
    },
    mockData () {
      const mockData = []
      for (let i = 1; i <= 100; i++) {
        mockData.push({
          date: `2024-03-${String(i).padStart(2, '0')}`,
          name: `王小虎${i}号`,
          address: `上海市普陀区金沙江路 ${1518 + i} 弄`
        })
      }
      this.tableData = mockData
    }
  }
}

</script>

<style lang="less" scoped>
.table-scroll {
  .el-table {
    // 这里可以写 less 样式
    margin-top: 20px;
    
    // 嵌套语法示例
    &::before {
      display: none;
    }
  }
}

::v-deep(.el-table__body-wrapper) {
  overflow-y: scroll;
}
</style>