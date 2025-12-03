<script setup lang="ts">
import PermissionApplyDialog from '@/layouts/components/Header/components/PermissionDialog/PermissionApplyDialog.vue';
import { ref } from 'vue';

const permissionApplyRef = ref<InstanceType<typeof PermissionApplyDialog> | null>(null)

const handleTest = () => {
  permissionApplyRef.value?.acceptParams()
}
</script>
<template>
  <div>
    <el-button @click="handleTest">
      click
    </el-button>

    <PermissionApplyDialog ref="permissionApplyRef" />
  </div>
</template>