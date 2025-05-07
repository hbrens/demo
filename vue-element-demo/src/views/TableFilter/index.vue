<template>
  <div class="table-filter-container">
    <h1>TableFilter</h1>
    
    <div class="table-info" v-if="sortInfo.prop">
      <el-tag size="small" type="info">
        当前排序：{{ getSortFieldLabel(sortInfo.prop) }} - {{ sortInfo.order === 'asc' ? '升序' : '降序' }}
        <i class="el-icon-close" @click="clearSort"></i>
      </el-tag>
    </div>
    
    <el-table
      :data="processedTableData"
      border
      style="width: 100%">
      <el-table-column
        prop="id"
        width="60">
        <template slot="header">
          <table-sort-header 
            prop="id" 
            label="ID" 
            :current-sort="sortInfo"
            @sort-change="handleSortChange" />
        </template>
      </el-table-column>
      
      <el-table-column
        prop="name"
        width="120">
        <template slot="header">
          <table-sort-header 
            prop="name" 
            label="姓名" 
            :current-sort="sortInfo"
            @sort-change="handleSortChange" />
        </template>
      </el-table-column>
      
      <table-filter-column
        prop="gender"
        label="性别"
        width="80"
        :filter-options="genderFilterOptions"
        :sortable="true"
        :current-sort="sortInfo"
        @filter-change="handleGenderFilterChange"
        @sort-change="handleSortChange">
        <template slot-scope="{ row }">
          <el-tag :type="row.gender === '男' ? 'primary' : row.gender === '女' ? 'danger' : 'info'" size="small">
            {{ row.gender }}
          </el-tag>
        </template>
      </table-filter-column>
      
      <el-table-column
        prop="age"
        width="80">
        <template slot="header">
          <table-sort-header 
            prop="age" 
            label="年龄" 
            :current-sort="sortInfo"
            @sort-change="handleSortChange" />
        </template>
      </el-table-column>
      
      <table-filter-column
        prop="class"
        label="班级"
        width="100"
        :filter-options="classFilterOptions"
        :sortable="true"
        :current-sort="sortInfo"
        @filter-change="handleClassFilterChange"
        @sort-change="handleSortChange">
      </table-filter-column>
      
      <el-table-column
        prop="address">
        <template slot="header">
          <table-sort-header 
            prop="address" 
            label="地址" 
            :current-sort="sortInfo"
            @sort-change="handleSortChange" />
        </template>
      </el-table-column>
      
      <el-table-column
        prop="date"
        width="180">
        <template slot="header">
          <table-sort-header 
            prop="date" 
            label="日期" 
            :current-sort="sortInfo"
            @sort-change="handleSortChange" />
        </template>
      </el-table-column>
      
      <table-filter-column
        prop="status"
        label="状态"
        width="100"
        :filter-options="dynamicStatusFilterOptions"
        :sortable="true"
        :current-sort="sortInfo"
        @filter-change="handleStatusFilterChange"
        @sort-change="handleSortChange">
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
import TableSortHeader from '@/components/TableSortHeader.vue'

export default {
  name: 'TableFilter',
  components: {
    TableFilterColumn,
    TableSortHeader
  },
  data() {
    return {
      tableData: [],
      filters: {
        gender: [],
        class: [],
        status: []
      },
      sortInfo: {
        prop: '',
        order: ''
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
        { value: 1006, label: '1006' },
        { value: 1007, label: '1007' },
        { value: 1008, label: '1008' },
        { value: 1009, label: '1009' },
        { value: 1010, label: '1010' },
        { value: 1011, label: '1011' },
        { value: 1012, label: '1012' },
        { value: 1013, label: '1013' },
        { value: 1014, label: '1014' },
        { value: 1015, label: '1015' },
        { value: 1016, label: '1016' },
        { value: 1017, label: '1017' },
        { value: 1018, label: '1018' },
        { value: 1019, label: '1019' },
        { value: 1020, label: '1020' },
        { value: 1021, label: '1021' },
        { value: 1022, label: '1022' },
        { value: 1023, label: '1023' },
        { value: 1024, label: '1024' },
        { value: 1025, label: '1025' },
        { value: 1026, label: '1026' },
        { value: 1027, label: '1027' },
        { value: 1028, label: '1028' },
        { value: 1029, label: '1029' },
        { value: 1030, label: '1030' },
        { value: 1031, label: '1031' },
        { value: 1032, label: '1032' },
        { value: 1033, label: '1033' },
        { value: 1034, label: '1034' },
        { value: 1035, label: '1035' },
        { value: 1036, label: '1036' },
        { value: 1037, label: '1037' },
        { value: 1038, label: '1038' },
        { value: 1039, label: '1039' },
        { value: 1040, label: '1040' }
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
    
    // 筛选后的数据（包含所有筛选条件）
    filteredTableData() {
      return this.preFilteredData.filter(item => {
        const statusFilterPass = this.filters.status.length === 0 || this.filters.status.includes(item.status);
        return statusFilterPass;
      });
    },
    
    // 最终处理后的数据（包含筛选和排序）
    processedTableData() {
      // 如果没有排序，直接返回筛选后的数据
      if (!this.sortInfo.prop || !this.sortInfo.order) {
        return this.filteredTableData;
      }
      
      // 对筛选后的数据进行排序
      const sortProp = this.sortInfo.prop;
      const sortOrder = this.sortInfo.order;
      
      return [...this.filteredTableData].sort((a, b) => {
        let valueA = a[sortProp];
        let valueB = b[sortProp];
        
        // 根据不同类型的数据进行比较
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          // 对日期字符串进行特殊处理
          if (sortProp === 'date') {
            valueA = new Date(valueA.replace(/-/g, '/')).getTime();
            valueB = new Date(valueB.replace(/-/g, '/')).getTime();
          } else {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
          }
        }
        
        // 根据排序方向返回比较结果
        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
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
    // 处理排序变化
    handleSortChange(sort) {
      this.sortInfo = sort;
    },
    
    // 清除排序
    clearSort() {
      this.sortInfo = {
        prop: '',
        order: ''
      };
    },
    
    // 获取排序字段的显示标签
    getSortFieldLabel(prop) {
      const labelMap = {
        'id': 'ID',
        'name': '姓名',
        'gender': '性别',
        'age': '年龄',
        'class': '班级',
        'address': '地址',
        'date': '日期',
        'status': '状态'
      };
      
      return labelMap[prop] || prop;
    },
    
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
      const classOptions = [];
      for (let i = 1001; i <= 1040; i++) {
        classOptions.push(i);
      }
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
  
  .table-info {
    margin-bottom: 15px;
    
    .el-tag {
      .el-icon-close {
        margin-left: 5px;
        cursor: pointer;
        
        &:hover {
          color: #F56C6C;
        }
      }
    }
  }
}
</style>

