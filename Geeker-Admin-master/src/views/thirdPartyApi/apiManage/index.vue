<template>
  <div class="api-manage">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="API申请" name="myApplications">
        <MyApplications v-if="activeTab === 'myApplications'" />
      </el-tab-pane>
      <el-tab-pane label="API审核" name="apiReview">
        <ApiReview v-if="activeTab === 'apiReview'" />
      </el-tab-pane>
      <el-tab-pane label="密钥管理" name="keyManagement">
        <KeyManagement v-if="activeTab === 'keyManagement'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts" name="apiManage">
import { ref } from "vue";
import MyApplications from "./components/MyApplications.vue";
import ApiReview from "./components/ApiReview.vue";
import KeyManagement from "./components/KeyManagement.vue";

const activeTab = ref("myApplications");
</script>

<style lang="scss" scoped>
.api-manage {
  padding: 0;
}
</style>
