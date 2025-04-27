<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { useRecruitmentStatsStore } from '@/stores/modules/stats/recruitmentStats'

const recruitmentStatsStore = useRecruitmentStatsStore()
const chartRef = ref()

// 计算各个owner的招聘数据
const ownerData = computed(() => {
  const campusData = recruitmentStatsStore.campusData
  const internalData = recruitmentStatsStore.internalData
  const odData = recruitmentStatsStore.odData
  const postDocData = recruitmentStatsStore.postDocData

  // 统计每个owner的各渠道招聘数量
  const ownerStats: Record<string, Record<string, number>> = {}

  const processData = (data: any[], channel: string) => {
    data.forEach(item => {
      if (!ownerStats[item.owner]) {
        ownerStats[item.owner] = {
          '校园招聘': 0,
          '社会招聘': 0,
          '内部推荐': 0,
          '博士后': 0
        }
      }
      switch (channel) {
        case 'campus':
          ownerStats[item.owner]['校园招聘']++
          break
        case 'od':
          ownerStats[item.owner]['社会招聘']++
          break
        case 'internal':
          ownerStats[item.owner]['内部推荐']++
          break
        case 'postDoc':
          ownerStats[item.owner]['博士后']++
          break
      }
    })
  }

  processData(campusData, 'campus')
  processData(internalData, 'internal')
  processData(odData, 'od')
  processData(postDocData, 'postDoc')

  return ownerStats
})

const initChart = () => {
  const chartDom = chartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const owners = Object.keys(ownerData.value)
  const channels = ['校园招聘', '社会招聘', '内部推荐', '博士后']
  
  const option: EChartsOption = {
    title: {
      text: 'Owner招聘渠道分布',
      left: 'center',
      top: '20px',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#666'
      },
      padding: [8, 12],
      formatter: (params: any) => {
        let result = params[0].axisValue + '<br/>'
        let total = 0
        params.forEach((item: any) => {
          total += item.value
          result += item.seriesName + ': ' + item.value + '人<br/>'
        })
        result += '<div style="margin-top: 4px;border-top: 1px solid #ccc;padding-top: 4px">'
        result += '总计: ' + total + '人'
        result += '</div>'
        return result
      }
    },
    legend: {
      top: '60px',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#666',
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '130px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: owners,
      axisLabel: {
        interval: 0,
        rotate: owners.length > 6 ? 30 : 0,
        color: '#666',
        fontSize: 12
      },
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        color: '#666',
        fontSize: 12,
        padding: [0, 0, 0, 30]
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#eee',
          type: 'dashed'
        }
      }
    },
    series: channels.map((channel, index) => ({
      name: channel,
      type: 'bar' as const,
      stack: 'total',
      barWidth: '40%',
      label: {
        show: true,
        formatter: '{c}人',
        fontSize: 12,
        color: '#666'
      },
      emphasis: {
        focus: 'series' as const
      },
      itemStyle: {
        color: getChannelColor(channel),
        borderRadius: index === channels.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
      },
      data: owners.map(owner => ownerData.value[owner][channel])
    }))
  }

  option && myChart.setOption(option)

  // 响应式处理
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 根据渠道返回不同的颜色
const getChannelColor = (channel: string): string => {
  const colorMap: Record<string, string> = {
    '校园招聘': '#60acfc',
    '社会招聘': '#32d3eb',
    '内部推荐': '#5bc49f',
    '博士后': '#feb64d'
  }
  return colorMap[channel] || '#60acfc'
}

// 监听数据变化，重新渲染图表
watch(() => ownerData.value, () => {
  initChart()
}, { deep: true })

onMounted(() => {
  initChart()
})
</script>

<template>
  <el-card class="chart-card" :body-style="{ padding: '20px' }">
    <div ref="chartRef" class="chart-container"></div>
  </el-card>
</template>

<style lang="scss" scoped>
.chart-card {
  width: 100%;
  margin-bottom: 20px;

  .chart-container {
    width: 100%;
    height: 500px;
  }
}
</style> 