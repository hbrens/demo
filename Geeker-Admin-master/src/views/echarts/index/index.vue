<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecruitmentStatsStore } from '@/stores/modules/stats/recruitmentStats'

const recruitmentStatsStore = useRecruitmentStatsStore()

import CardData from './card-data.vue'
import LmRecruitmentChart from './lm-recruitment-chart.vue'

import OwnerRecruitmentStatus from './owner-recruitment-status.vue'
import OwnerRecruitmentLine from './owner-recruitment-line.vue'

const campusData = computed(() => recruitmentStatsStore.campusData)
const internalData = computed(() => recruitmentStatsStore.internalData)
const odData = computed(() => recruitmentStatsStore.odData)
const postDocData = computed(() => recruitmentStatsStore.postDocData)

</script>

<template>
  <div class="chart-container">
    <el-space direction="vertical" class="full-space pb-0" :size="0" fill>
      <CardData />
      <el-row :gutter="16" style="margin-top: 16px;">
        <el-col :span="24" :sm="24" class="chart-col">
          <OwnerRecruitmentStatus />
        </el-col>

      </el-row>
      <el-row :gutter="16" style="margin-top: 16px;">
        <el-col :span="10" :lg="10" :sm="24" class="chart-col">
          <OwnerRecruitmentLine />
        </el-col>

        <el-col :span="14" :lg="14" :sm="24" class="chart-col">
          <LmRecruitmentChart
            :campus-data="campusData"
            :internal-data="internalData"
            :od-data="odData"
            :post-doc-data="postDocData"
          />
        </el-col>
      </el-row>
    </el-space>
  </div>
</template>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 100%;
}

.chart-col {
  margin-bottom: 16px;
}

.full-space {
  width: 100%;
}
</style>