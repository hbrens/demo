<template>
  <div>
    <el-button @click="resetDateFilter">清除日期过滤器</el-button>
    <el-button @click="clearFilter">清除所有过滤器</el-button>
    <el-table
      ref="filterTable"
      :data="tableData"
      style="width: 100%">
      <el-table-column
        prop="date"
        label="日期"
        sortable
        width="180"
        column-key="date"
        :filters="[{text: '2016-05-01', value: '2016-05-01'}, {text: '2016-05-02', value: '2016-05-02'}, {text: '2016-05-03', value: '2016-05-03'}, {text: '2016-05-04', value: '2016-05-04'}]"
        :filter-method="filterHandler"
      >
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="address"
        label="地址"
        >
        <template slot="header" slot-scope="scope">
          <el-popover
            placement="top-start"
            title="标题"
            width="200"
            trigger="click"
            >
            <el-button slot="reference">hover 激活</el-button>
            <div slot="default">
              <div>
                <el-input v-model="searchTerm"></el-input>
              </div>
              <div>
                <el-radio-group v-model="activeAddress">
                  <el-radio v-for="item in filterAddressOptions" :label="item.label" :value="item.value"></el-radio>
                </el-radio-group>
              </div>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        prop="tag"
        label="标签"
        width="100"
        :filters="[{ text: '家', value: '家' }, { text: '公司', value: '公司' }]"
        :filter-method="filterTag"
        filter-placement="bottom-end">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.tag === '家' ? 'primary' : 'success'"
            disable-transitions>{{scope.row.tag}}</el-tag>
        </template>
      </el-table-column>
    </el-table>
    {{filterAddressOptions}}
  </div>
</template>

<script>
export default {
  data() {
    return {
      showAddressFilter: false,
      searchTerm: '',
      activeAddress: '',
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        tag: '家'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄',
        tag: '公司'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄',
        tag: '家'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄',
        tag: '公司'
      }],
      addressOptions: [
        { label: '北京', value: '北京' },
        { label: '上海', value: '上海' },
        { label: '广州', value: '广州' },
        { label: '深圳', value: '深圳' },
        { label: '杭州', value: '杭州' },
        { label: '成都', value: '成都' },
        { label: '南京', value: '南京' },
        { label: '武汉', value: '武汉' },
        { label: '西安', value: '西安' },
        { label: '重庆', value: '重庆' }
      ]
    }
  },
  computed: {
    filterAddressOptions () {
      if (this.searchTerm) {
        return this.addressOptions.filter(item => {
          return Object.keys(item).some(key => {
            return item[key] && item[key].toString().toLowerCase().includes(this.searchTerm.toString().toLowerCase())
          })
        })
      }
      return this.addressOptions
    }
  },
  methods: {
    resetDateFilter() {
      this.$refs.filterTable.clearFilter('date');
    },
    clearFilter() {
      this.$refs.filterTable.clearFilter();
    },
    formatter(row, column) {
      return row.address;
    },
    filterTag(value, row) {
      return row.tag === value;
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    }
  }
}
</script>