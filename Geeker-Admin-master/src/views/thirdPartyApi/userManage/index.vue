<template>
  <div class="card">
    <div class="header">
      <h4 class="title">用户管理</h4>
      <el-button type="primary" @click="loadUsers">刷新</el-button>
    </div>

    <el-table :data="userList" border stripe style="width: 100%">
      <el-table-column prop="username" label="用户名">
        <template #default="{ row }">
          {{ row.username }}
          <el-tag v-if="row.id === currentUserId" size="small" type="info" style="margin-left: 8px">当前账号</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'success' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间">
        <template #default="{ row }">
          {{ row.created_at?.slice(0, 10) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-if="row.id !== currentUserId" type="danger" link @click="handleDelete(row)">删除</el-button>
          <span v-else style="color: var(--el-text-color-secondary); font-size: 12px">—</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts" name="userManage">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUsers, deleteUser } from "@/api/modules/thirdPartyUser";
import type { UserItem } from "@/api/modules/thirdPartyUser";

const userList = ref<UserItem[]>([]);
const currentUserId = ref<number>(1); // 当前登录用户 ID

// 加载用户列表
const loadUsers = async () => {
  try {
    const data = await getUsers();
    userList.value = data as unknown as UserItem[];
  } catch (e: any) {
    ElMessage.error(e.message || "加载用户列表失败");
  }
};

// 删除用户
const handleDelete = async (user: UserItem) => {
  try {
    await ElMessageBox.confirm(
      `确定删除用户 "${user.username}"？此操作不可恢复。`,
      "警告",
      { type: "warning" }
    );
    await deleteUser(user.id);
    ElMessage.success("用户已删除");
    loadUsers();
  } catch (e: any) {
    if (e !== "cancel") ElMessage.error(e.message);
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style lang="scss" scoped>
.card {
  padding: 20px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .title {
    margin: 0;
    font-size: 17px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
}
</style>
