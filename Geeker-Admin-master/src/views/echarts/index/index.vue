<script setup lang="ts">
import { ref } from 'vue'
import { useRecruitmentStatsStore } from '@/stores/modules/stats/recruitmentStats'

const recruitmentStatsStore = useRecruitmentStatsStore()

import CardData from './card-data.vue'
import LmRecruitmentChart from './lm-recruitment-chart.vue'

const campusData = recruitmentStatsStore.campusData
const internalData = recruitmentStatsStore.internalData
const odData = recruitmentStatsStore.odData
const postDocData = recruitmentStatsStore.postDocData

</script>

<template>
  <div class="chart-container">
    <el-space direction="vertical" class="full-space pb-0" :size="0" fill>
      <CardData />
      <el-row :gutter="0" style="margin-top: 16px;">
        <el-col :span="24" class="chart-col">
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