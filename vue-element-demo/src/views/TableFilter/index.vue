<template>
  <div class="table-filter-container">
    <h1>TableFilter</h1>
    <el-table
      :data="filteredTableData"
      border
      style="width: 100%">
      <el-table-column
        prop="id"
        label="ID"
        width="60">
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        width="120">
      </el-table-column>
      
      <table-filter-column
        prop="gender"
        label="性别"
        width="80"
        :filter-options="genderFilterOptions"
        @filter-change="handleGenderFilterChange">
        <template slot-scope="{ row }">
          <el-tag :type="row.gender === '男' ? 'primary' : row.gender === '女' ? 'danger' : 'info'" size="small">
            {{ row.gender }}
          </el-tag>
        </template>
      </table-filter-column>
      
      <el-table-column
        prop="age"
        label="年龄"
        width="80">
      </el-table-column>
      
      <table-filter-column
        prop="class"
        label="班级"
        width="100"
        :filter-options="classFilterOptions"
        @filter-change="handleClassFilterChange">
      </table-filter-column>
      
      <el-table-column
        prop="address"
        label="地址">
      </el-table-column>
      <el-table-column
        prop="date"
        label="日期"
        width="180">
      </el-table-column>
      
      <table-filter-column
        prop="status"
        label="状态"
        width="100"
        :filter-options="dynamicStatusFilterOptions"
        @filter-change="handleStatusFilterChange">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === '活跃' ? 'success' : row.status === '待处理' ? 'warning' : 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </table-filter-column>
    </el-table>
  </div>
</template>

<script>
import TableFilterColumn from '@/components/TableFilterColumn.vue'

export default {
  name: 'TableFilter',
  components: {
    TableFilterColumn
  },
  data() {
    return {
      tableData: [],
      filters: {
        gender: [],
        class: [],
        status: []
      },
      genderFilterOptions: [
        { value: '男', label: '男' },
        { value: '女', label: '女' },
        { value: '未知', label: '未知' }
      ],
      classFilterOptions: [
        { value: 1001, label: '1001' },
        { value: 1002, label: '1002' },
        { value: 1003, label: '1003' },
        { value: 1004, label: '1004' },
        { value: 1005, label: '1005' },
        { value: 1006, label: '1006' }
      ],
      statusOptions: [
        { value: '活跃', label: '活跃' },
        { value: '待处理', label: '待处理' },
        { value: '已完成', label: '已完成' },
        { value: '关闭', label: '关闭' }
      ]
    }
  },
  computed: {
    // 预筛选数据（不包含状态筛选）
    preFilteredData() {
      return this.tableData.filter(item => {
        const genderFilterPass = this.filters.gender.length === 0 || this.filters.gender.includes(item.gender);
        const classFilterPass = this.filters.class.length === 0 || this.filters.class.includes(item.class);
        
        return genderFilterPass && classFilterPass;
      });
    },
    
    // 最终筛选后的数据（包含所有筛选条件）
    filteredTableData() {
      return this.preFilteredData.filter(item => {
        const statusFilterPass = this.filters.status.length === 0 || this.filters.status.includes(item.status);
        return statusFilterPass;
      });
    },
    
    // 动态状态筛选选项
    dynamicStatusFilterOptions() {
      // 获取预筛选数据中存在的状态值
      const availableStatusValues = [...new Set(this.preFilteredData.map(item => item.status))];
      
      // 返回只包含当前存在状态的选项
      return this.statusOptions.filter(option => 
        availableStatusValues.includes(option.value)
      );
    }
  },
  created() {
    this.tableData = this.generateMockData();
  },
  methods: {
    handleGenderFilterChange(values) {
      this.filters.gender = values;
      // 当性别筛选条件变化时，重置状态筛选
      this.filters.status = [];
    },
    handleClassFilterChange(values) {
      this.filters.class = values;
      // 当班级筛选条件变化时，重置状态筛选
      this.filters.status = [];
    },
    handleStatusFilterChange(values) {
      this.filters.status = values;
    },
    generateMockData() {
      const statusOptions = ['活跃', '待处理', '已完成', '关闭'];
      const genderOptions = ['男', '女', '未知'];
      const classOptions = [1001, 1002, 1003, 1004, 1005, 1006];
      const namePrefix = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴'];
      const nameSuffix = ['伟', '芳', '娜', '秀英', '敏', '静', '强', '磊', '洋', '艳'];
      const addressPrefix = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '武汉市', '成都市', '重庆市', '西安市'];
      const addressSuffix = ['东城区', '西城区', '朝阳区', '海淀区', '江北区', '南山区', '高新区', '金牛区', '武侯区', '长安区'];
      
      const mockData = [];

      for (let i = 1; i <= 40; i++) {
        const randomNamePrefix = namePrefix[Math.floor(Math.random() * namePrefix.length)];
        const randomNameSuffix = nameSuffix[Math.floor(Math.random() * nameSuffix.length)];
        const randomAddressPrefix = addressPrefix[Math.floor(Math.random() * addressPrefix.length)];
        const randomAddressSuffix = addressSuffix[Math.floor(Math.random() * addressSuffix.length)];
        
        mockData.push({
          id: i,
          name: randomNamePrefix + randomNameSuffix,
          gender: genderOptions[Math.floor(Math.random() * genderOptions.length)],
          age: Math.floor(Math.random() * 40) + 20, // 20-60岁
          class: classOptions[Math.floor(Math.random() * classOptions.length)],
          address: `${randomAddressPrefix}${randomAddressSuffix}某某路${Math.floor(Math.random() * 100) + 1}号`,
          date: this.generateRandomDate(),
          status: statusOptions[Math.floor(Math.random() * statusOptions.length)]
        });
      }

      return mockData;
    },
    generateRandomDate() {
      const start = new Date(2020, 0, 1);
      const end = new Date();
      const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      
      return randomDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
    }
  }
}
</script>

<style scoped lang="less">
.table-filter-container {
  padding: 20px;
  
  h1 {
    margin-bottom: 20px;
  }
}
</style>

