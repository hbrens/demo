<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="成员" 
    width="900px"
  >
    <div class="dialog-container">
      <div class="left-section">
        <div class="search-header">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索群组/用户"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="search-content">
          <div class="left-lists">
            <div class="list-section">
              <div class="list-title">联系人</div>
              <el-scrollbar height="150px">
                <div 
                  class="list-item" 
                  v-for="item in contactList" 
                  :key="item.id"
                  @click="handleContactClick(item)"
                >
                  {{ item.name }}
                </div>
              </el-scrollbar>
            </div>
            <div class="list-section">
              <div class="list-title">群组</div>
              <el-scrollbar height="300px">
                <div 
                  class="list-item" 
                  v-for="item in filteredGroups" 
                  :key="item.id"
                  @click="handleGroupClick(item)"
                >
                  {{ item.name }}
                </div>
              </el-scrollbar>
            </div>
          </div>
          <div class="right-table">
            <el-table 
              ref="userTableRef"
              :data="userList" 
              style="width: 100%"
              @row-click="handleRowClick"
              @selection-change="handleSelectionChange"
              highlight-current-row
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="department" label="部门" />
            </el-table>
          </div>
        </div>
      </div>
      <div class="right-section">
        <div class="table-header">
          <span class="selected-count">已选中 {{ selectedUsers.length }}</span>
          <el-button 
            type="primary" 
            link 
            @click="handleClearAll"
          >
            全部移除
          </el-button>
        </div>
        <el-table :data="selectedUsers" style="width: 100%">
          <el-table-column prop="employeeId" label="工号" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column width="40">
            <template #default="{ row }">
              <el-icon 
                class="delete-icon" 
                @click="handleDelete(row)"
              >
                <Close />
              </el-icon>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" style="width: 120px">取消</el-button>
        <el-button type="primary" @click="handleConfirm" style="width: 120px">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { Close, Search } from '@element-plus/icons-vue';

const dialogVisible = ref(true);
const searchKeyword = ref('');
const userTableRef = ref();

// 模拟已选择的数据
const selectedUsers = ref([
  { employeeId: '001', name: '张三' },
  { employeeId: '002', name: '李四' },
]);

// 定义联系人类型
interface Contact {
  id: number;
  name: string;
  employeeId: string;
  department: string;
}

// 模拟联系人列表数据
const contactList = ref<Contact[]>([
  { id: 1, name: '张三', employeeId: '001', department: '技术部' },
  { id: 2, name: '赵六', employeeId: '004', department: '产品部' },
  { id: 3, name: '周九', employeeId: '007', department: '市场部' },
  { id: 4, name: '王十二', employeeId: '010', department: '销售部' },
  { id: 5, name: '刘十五', employeeId: '013', department: '人事部' },
  { id: 6, name: '黄十八', employeeId: '016', department: '财务部' },
]);

// 模拟群组列表数据
const groupList = ref([
  { id: 1, name: '技术部' },
  { id: 2, name: '产品部' },
  { id: 3, name: '市场部' },
  { id: 4, name: '销售部' },
  { id: 5, name: '人事部' },
  { id: 6, name: '财务部' },
  { id: 7, name: '行政部' },
  { id: 8, name: '客服部' },
]);

// 根据搜索关键词筛选群组
const filteredGroups = computed(() => {
  if (!searchKeyword.value) return groupList.value;
  return groupList.value.filter(group => 
    group.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 模拟不同部门的用户数据
const departmentUsers = {
  1: [
    { employeeId: '001', name: '张三', department: '技术部' },
    { employeeId: '002', name: '李四', department: '技术部' },
    { employeeId: '003', name: '王五', department: '技术部' },
  ],
  2: [
    { employeeId: '004', name: '赵六', department: '产品部' },
    { employeeId: '005', name: '钱七', department: '产品部' },
    { employeeId: '006', name: '孙八', department: '产品部' },
  ],
  3: [
    { employeeId: '007', name: '周九', department: '市场部' },
    { employeeId: '008', name: '吴十', department: '市场部' },
    { employeeId: '009', name: '郑十一', department: '市场部' },
  ],
  4: [
    { employeeId: '010', name: '王十二', department: '销售部' },
    { employeeId: '011', name: '李十三', department: '销售部' },
    { employeeId: '012', name: '张十四', department: '销售部' },
  ],
  5: [
    { employeeId: '013', name: '刘十五', department: '人事部' },
    { employeeId: '014', name: '陈十六', department: '人事部' },
    { employeeId: '015', name: '杨十七', department: '人事部' },
  ],
  6: [
    { employeeId: '016', name: '黄十八', department: '财务部' },
    { employeeId: '017', name: '赵十九', department: '财务部' },
    { employeeId: '018', name: '周二十', department: '财务部' },
  ],
  7: [
    { employeeId: '019', name: '吴二一', department: '行政部' },
    { employeeId: '020', name: '郑二二', department: '行政部' },
    { employeeId: '021', name: '王二三', department: '行政部' },
  ],
  8: [
    { employeeId: '022', name: '李二四', department: '客服部' },
    { employeeId: '023', name: '张二五', department: '客服部' },
    { employeeId: '024', name: '刘二六', department: '客服部' },
  ],
};

// 模拟用户表格数据
const userList = ref(departmentUsers[1]); // 默认显示技术部的数据

// 处理行点击
const handleRowClick = (row: any) => {
  // 检查是否已经在选中列表中
  const isExist = selectedUsers.value.some(item => item.employeeId === row.employeeId);
  if (!isExist) {
    // 如果不存在，则添加到选中列表
    selectedUsers.value.push({
      employeeId: row.employeeId,
      name: row.name
    });
    // 更新表格选中状态
    userTableRef.value?.toggleRowSelection(row, true);
  }
};

// 表格选择变化处理
const handleSelectionChange = (selection: any[]) => {
  // 将新选中的用户添加到已选择列表（去重）
  selection.forEach(item => {
    const isExist = selectedUsers.value.some(selected => selected.employeeId === item.employeeId);
    if (!isExist) {
      selectedUsers.value.push({
        employeeId: item.employeeId,
        name: item.name
      });
    }
  });
};

// 删除选中行
const handleDelete = (row: any) => {
  const index = selectedUsers.value.findIndex(item => item.employeeId === row.employeeId);
  if (index !== -1) {
    selectedUsers.value.splice(index, 1);
    // 同步更新表格选中状态
    const tableRow = userList.value.find(item => item.employeeId === row.employeeId);
    if (tableRow) {
      userTableRef.value?.toggleRowSelection(tableRow, false);
    }
  }
};

// 清空所有选中
const handleClearAll = () => {
  selectedUsers.value = [];
  // 清空表格选中状态
  userTableRef.value?.clearSelection();
};

// 搜索联系人
const searchContacts = async (keyword: string): Promise<Contact[]> => {
  // 模拟接口调用
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = contactList.value.filter(contact => 
        contact.name.toLowerCase().includes(keyword.toLowerCase()) ||
        contact.department.toLowerCase().includes(keyword.toLowerCase())
      );
      resolve(results);
    }, 300); // 模拟网络延迟
  });
};

// 搜索处理函数
const handleSearch = async (value: string) => {
  if (!value) {
    // 如果搜索框为空，恢复原始数据
    userList.value = departmentUsers[1];
    return;
  }

  try {
    // 搜索联系人
    const searchResults = await searchContacts(value);
    if (searchResults.length > 0) {
      // 如果有搜索结果，更新表格数据
      userList.value = searchResults;
    }
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

// 处理群组点击
const handleGroupClick = (group: any) => {
  // 更新表格数据
  userList.value = departmentUsers[group.id] || [];
  // 清空表格选中状态
  userTableRef.value?.clearSelection();
  // 同步已选中用户的选中状态
  nextTick(() => {
    userList.value.forEach(row => {
      const isSelected = selectedUsers.value.some(item => item.employeeId === row.employeeId);
      if (isSelected) {
        userTableRef.value?.toggleRowSelection(row, true);
      }
    });
  });
};

// 处理联系人点击
const handleContactClick = (contact: any) => {
  // 更新表格数据为单个联系人
  userList.value = [{
    employeeId: contact.employeeId,
    name: contact.name,
    department: contact.department
  }];
  
  // 清空表格选中状态
  userTableRef.value?.clearSelection();
  
  // 设置选中状态
  nextTick(() => {
    userTableRef.value?.toggleRowSelection(userList.value[0], true);
  });

  // 检查是否已经在选中列表中
  const isExist = selectedUsers.value.some(item => item.employeeId === contact.employeeId);
  if (!isExist) {
    // 如果不存在，则添加到选中列表
    selectedUsers.value.push({
      employeeId: contact.employeeId,
      name: contact.name
    });
  }
};

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false;
  // TODO: 处理取消逻辑
};

// 处理确定
const handleConfirm = () => {
  // TODO: 处理确定逻辑
  dialogVisible.value = false;
};
</script>

<style scoped>
.dialog-container {
  display: flex;
  gap: 10px;
  min-height: 500px;
}

.left-section {
  flex: 1;
  border: 1px solid #EEE;
  display: flex;
  flex-direction: column;
}

.search-header {
  padding: 12px;
  border-bottom: 1px solid #EEE;
}

.search-content {
  flex: 1;
  display: flex;
  gap: 10px;
}

.left-lists {
  width: 200px;
  display: flex;
  border: 1px solid #EEE;
  flex-direction: column;
}

.list-section {
  border: none;
}

.list-section:first-child {
  border-bottom: 1px solid #EEE;
}

.list-title {
  padding: 8px 12px;
  font-weight: bold;
  border-bottom: 1px solid #EEE;
  background-color: #F5F7FA;
}

.list-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.list-item:hover {
  background-color: #F5F7FA;
}

.list-item.active {
  background-color: #ECF5FF;
  color: #409EFF;
}

.right-table {
  flex: 1;
}

.right-section {
  width: 220px;
  border: 1px solid #EEE;
}

.table-header {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #EEE;
}

.selected-count {
  color: #606266;
  font-size: 14px;
}

.delete-icon {
  display: none;
  cursor: pointer;
  color: #F56C6C;
}

.el-table__row:hover .delete-icon {
  display: block;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
