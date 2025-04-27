<template>
  <el-card class="chart-card">
    <div class="chart-container" ref="chartRef"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, BarSeriesOption } from 'echarts'

const props = defineProps({
  campusData: {
    type: Array,
    default: () => []
  },
  internalData: {
    type: Array,
    default: () => []
  },
  odData: {
    type: Array,
    default: () => []
  },
  postDocData: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref()
let myChart: echarts.ECharts | null = null

// 处理数据，按LM分组统计各类招聘数量
const processData = () => {
  const lmMap = new Map()
  
  // 处理校园招聘数据
  props.campusData.forEach((item: any) => {
    if (!lmMap.has(item.lm)) {
      lmMap.set(item.lm, { campus: 0, internal: 0, od: 0, postDoc: 0 })
    }
    lmMap.get(item.lm).campus++
  })

  // 处理内部推荐数据
  props.internalData.forEach((item: any) => {
    if (!lmMap.has(item.lm)) {
      lmMap.set(item.lm, { campus: 0, internal: 0, od: 0, postDoc: 0 })
    }
    lmMap.get(item.lm).internal++
  })

  // 处理社会招聘数据
  props.odData.forEach((item: any) => {
    if (!lmMap.has(item.lm)) {
      lmMap.set(item.lm, { campus: 0, internal: 0, od: 0, postDoc: 0 })
    }
    lmMap.get(item.lm).od++
  })

  // 处理博士后数据
  props.postDocData.forEach((item: any) => {
    if (!lmMap.has(item.lm)) {
      lmMap.set(item.lm, { campus: 0, internal: 0, od: 0, postDoc: 0 })
    }
    lmMap.get(item.lm).postDoc++
  })

  return lmMap
}

// 初始化图表
const initChart = () => {
  console.log(props.campusData)
  const lmData = processData()
  const lmNames = Array.from(lmData.keys())
  const colors = ['#60acfc', '#32d3eb', '#5bc49f', '#feb64d']
  
  const series: BarSeriesOption[] = [
    {
      name: '校园招聘',
      type: 'bar',
      data: lmNames.map(lm => lmData.get(lm).campus),
      barGap: '30%',
      itemStyle: {
        color: colors[0],
        borderRadius: [4, 4, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        fontSize: 12,
        color: '#666'
      }
    },
    {
      name: '内部推荐',
      type: 'bar',
      data: lmNames.map(lm => lmData.get(lm).internal),
      itemStyle: {
        color: colors[1],
        borderRadius: [4, 4, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        fontSize: 12,
        color: '#666'
      }
    },
    {
      name: '社会招聘',
      type: 'bar',
      data: lmNames.map(lm => lmData.get(lm).od),
      itemStyle: {
        color: colors[2],
        borderRadius: [4, 4, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        fontSize: 12,
        color: '#666'
      }
    },
    {
      name: '博士后',
      type: 'bar',
      data: lmNames.map(lm => lmData.get(lm).postDoc),
      itemStyle: {
        color: colors[3],
        borderRadius: [4, 4, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        fontSize: 12,
        color: '#666'
      }
    }
  ]

  const option: EChartsOption = {
    title: {
      text: 'LM招聘需求分布',
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
      padding: [8, 12]
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
      data: lmNames,
      axisLabel: {
        interval: 0,
        rotate: 30,
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
      name: '数量',
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
    series
  }

  if (myChart) {
    myChart.setOption(option)
  }
}

// 监听数据变化
watch(
  () => [props.campusData, props.internalData, props.odData, props.postDocData],
  () => {
    initChart()
  },
  { deep: true }
)

onMounted(() => {
  myChart = echarts.init(chartRef.value)
  initChart()

  window.addEventListener('resize', () => {
    myChart?.resize()
  })
})
</script>

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