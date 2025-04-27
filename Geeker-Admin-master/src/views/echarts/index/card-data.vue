<script setup lang="ts">
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';

defineOptions({ name: 'CardData' });
import SvgIcon from '@/components/SvgIcon/index.vue'

import { useRecruitmentStatsStore } from '@/stores/modules/stats/recruitmentStats'

const recruitmentStatsStore = useRecruitmentStatsStore()


interface CardData {
  key: string;
  title: string;
  value: number;
  unit: string;
  color: {
    start: string;
    end: string;
  };
  icon: string;
}

const cardData = computed<CardData[]>(() => [
  {
    key: 'campus',
    title:  "校园招聘",
    value: recruitmentStatsStore.campusData.length,
    unit: '', 
    color: {
      start: '#ec4786',
      end: '#b955a4'
    },
    icon: 'xianxingdaoyu'
  },
  {
    key: 'internal',
    title: "内推",
    value: recruitmentStatsStore.internalData.length,
    unit: '',
    color: {
      start: '#865ec0',
      end: '#5144b4'
    },
    icon: 'xianxingdaoyu'
  },
  {
    key: 'od',
    title: "OD",
    value: recruitmentStatsStore.odData.length,
    unit: '',
    color: {
      start: '#56cdf3',
      end: '#719de3'
    },
    icon: 'xianxingdaoyu'
  },
  {
    key: 'postDoc',
    title: "博士后",
    value: recruitmentStatsStore.postDocData.length,
    unit: '',
    color: {
      start: '#fcbc25',
      end: '#f68057'
    },
    icon: 'xianxingdaoyu'
  }
]);

interface GradientBgProps {
  gradientColor: string;
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>();

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}
</script>

<template>
  <ElCard class="card-wrapper">
    <!-- define component start: GradientBg -->
    <DefineGradientBg v-slot="{ $slots, gradientColor }">
      <div class="gradient-bg" :style="{ backgroundImage: gradientColor }">
        <component :is="$slots.default" />
      </div>
    </DefineGradientBg>
    <!-- define component end: GradientBg -->
    <ElRow :gutter="16">
      <ElCol v-for="item in cardData" :key="item.key" :lg="6" :md="12" :sm="24" class="card-col">
        <GradientBg :gradient-color="getGradientColor(item.color)" class="card-content">
          <h3 class="card-title">{{ item.title }}</h3>
          <div class="card-info">
            <SvgIcon name="xianxingdaoyu" style="height: 50px;" />
            <span class="value-text">
              {{ item.value }}
            </span>
          </div>
        </GradientBg>
      </ElCol>
    </ElRow>
  </ElCard>
</template>

<style lang="scss" scoped>
.gradient-bg {
  border-radius: 8px;
  padding: 8px 16px 4px;
  color: white;
}

.card-col {
  margin: 8px 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 24px;
}

.card-info {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
}

.card-icon {
  font-size: 32px;
}

.value-text {
  font-size: 30px;
  color: white;
  
  :global(.dark) & {
    color: var(--dark-text-color);
  }
}
</style>
