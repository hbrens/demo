<template>
  <div class="card content-box">
    <el-table :data="tableData" border stripe class="relation-table">
      <el-table-column prop="name" label="名称" width="160" />

    <el-table-column label="关系树（从左至右）" min-width="600">
        <template #default="{ row }">
          <TreeCell :data="row.tree" :height="260" :key="row.id" :ref="el => (treeCellRefs[row.id] = el)" />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <div class="actions">
            <button class="btn" @click="treeCellRefs[row.id]?.expandAll()">展开</button>
            <button class="btn" @click="treeCellRefs[row.id]?.collapseAll()">折叠</button>
            <button class="btn primary" @click="treeCellRefs[row.id]?.resetTree()">重置</button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
  </template>

<script setup lang="ts" name="relationTable">
import { defineComponent, onMounted, onBeforeUnmount, ref, watch, nextTick, h } from "vue";
import * as echarts from "echarts";

interface TreeNode {
  name: string;
  id: string;
  children?: TreeNode[];
  collapsed?: boolean;
}

// 子单元格组件：渲染树图并暴露控制方法
const TreeCell = defineComponent({
  name: "TreeCell",
  props: {
    data: { type: Object as () => TreeNode, required: true },
    height: { type: Number, default: 240 }
  },
  setup(props, { expose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    let chart: echarts.ECharts | null = null;
    let ro: ResizeObserver | null = null;
    
    // 版本对齐布局函数 - 为版本关系图优化
    function alignVersions(data: TreeNode): TreeNode {
      const clonedData = JSON.parse(JSON.stringify(data));
      
      // 为每个节点添加版本标识和层级信息
      function addVersionInfo(node: TreeNode, level: number = 0) {
        // 添加层级信息，用于版本对齐
        (node as any).level = level;
        (node as any).version = `v${level + 1}`;
        
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => addVersionInfo(child, level + 1));
        }
      }
      
      // 自定义布局函数 - 确保每层固定150px宽度
      function customTreeLayout(node: any, level: number = 0, y: number = 0) {
        const layerWidth = 150; // 每层固定150px
        const nodeHeight = 40; // 节点高度
        
        // 设置节点位置 - 使用ECharts的坐标系统
        (node as any).x = level * layerWidth;
        (node as any).y = y;
        
        if (node.children && node.children.length > 0) {
          const childSpacing = nodeHeight * 1.5; // 子节点间距
          node.children.forEach((child: any, index: number) => {
            const childY = y + (index - (node.children.length - 1) / 2) * childSpacing;
            customTreeLayout(child, level + 1, childY);
          });
        }
      }
      
      addVersionInfo(clonedData);
      customTreeLayout(clonedData);
      return clonedData;
    }

    function getOption(data: TreeNode): echarts.EChartsOption {
      return {
        tooltip: { trigger: "item", triggerOn: "mousemove" },
        series: [
          {
            type: "tree",
            data: [data as any],
            layout: "orthogonal",
            orient: "LR",
            symbol: "circle",
            edgeShape: "polyline",
            lineStyle: { width: 1, color: "#c3c9d1" },
            roam: true,
            left: 80,
            right: 80,
            top: 40,
            bottom: 40,
            // 每层固定150px宽度 - 通过symbolSize和layout控制
            symbolSize: (value: any, params: any) => {
              // 根据层级设置不同的节点大小
              const level = (params.data as any)?.level || 0;
              return Math.max(8, 12 - level * 2);
            },
            label: {
              position: "left",
              verticalAlign: "middle",
              align: "right",
              distance: 10,
              formatter: ({ name, data }) => {
                const level = (data as any)?.level || 0;
                const version = `v${level + 1}`;
                return `{version|${version}} {box|${name}}`;
              },
              rich: {
                version: {
                  backgroundColor: "#409eff",
                  color: "#fff",
                  padding: [2, 6],
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: "bold"
                },
                box: {
                  backgroundColor: "#fff",
                  padding: [4, 10],
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  shadowBlur: 2,
                  shadowColor: "rgba(0,0,0,0.06)",
                  shadowOffsetX: 0,
                  shadowOffsetY: 1,
                  color: "#34495e",
                  fontSize: 12
                }
              }
            },
            leaves: {
              label: {
                position: "right",
                align: "left",
                distance: 10,
                formatter: ({ name, data }) => {
                  const level = (data as any)?.level || 0;
                  const version = `v${level + 1}`;
                  return `{version|${version}} {box|${name}}`;
                },
                rich: {
                  version: {
                    backgroundColor: "#409eff",
                    color: "#fff",
                    padding: [2, 6],
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: "bold"
                  },
                  box: {
                    backgroundColor: "#fff",
                    padding: [4, 10],
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    shadowBlur: 2,
                    shadowColor: "rgba(0,0,0,0.06)",
                    shadowOffsetX: 0,
                    shadowOffsetY: 1,
                    color: "#34495e",
                    fontSize: 12
                  }
                }
              }
            },
            expandAndCollapse: true,
            animationDuration: 200,
            animationDurationUpdate: 200,
            initialTreeDepth: 2,
            emphasis: {
              focus: "descendant"
            }
          }
        ]
      };
    }

    function init() {
      if (!containerRef.value) return;
      if (!chart) chart = echarts.init(containerRef.value);
      // 应用版本对齐布局
      const alignedData = alignVersions(props.data);
      chart.setOption(getOption(alignedData));
      chart.resize();
    }

    function expandAll() {
      chart?.setOption({ series: [{ initialTreeDepth: -1 }] });
    }
    function collapseAll() {
      chart?.setOption({ series: [{ initialTreeDepth: 1 }] });
    }
    function resetTree() {
      chart?.dispose();
      chart = null;
      nextTick(init);
    }

    const onResize = () => chart?.resize();

    onMounted(() => {
      init();
      // 监听容器尺寸变化，解决初始布局或列宽变动导致图表宽度很小的问题
      if (containerRef.value && "ResizeObserver" in window) {
        ro = new ResizeObserver(() => chart?.resize());
        ro.observe(containerRef.value);
      }
      window.addEventListener("resize", onResize);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", onResize);
      if (ro && containerRef.value) ro.unobserve(containerRef.value);
      ro = null;
      chart?.dispose();
      chart = null;
    });

    expose({ expandAll, collapseAll, resetTree });

    watch(() => props.data, () => init(), { deep: true });

    return () =>
      h(
        "div",
        { class: "tree-cell" },
        [
          h("div", {
            class: "chart",
            style: { height: `${props.height}px` },
            ref: (el: any) => (containerRef.value = el as HTMLDivElement)
          })
        ]
      );
  }
});

// 表格数据示例
const tableData = ref<Array<{ id: string; name: string; tree: TreeNode }>>([
  {
    id: "r1",
    name: "A 关系",
    tree: {
      name: "根 A",
      id: "A",
      children: [
        { name: "A-1", id: "A-1" }
      ]
    }
  },
  {
    id: "r2",
    name: "B 关系",
    tree: {
      name: "根 B",
      id: "B",
      children: [
        {
          name: "B-1",
          id: "B-1",
          children: [
            { name: "B-1-1", id: "B-1-1" },
            { name: "B-1-2", id: "B-1-2" }
          ]
        },
        {
          name: "B-2",
          id: "B-2",
          children: [
            { name: "B-2-1", id: "B-2-1" },
            {
              name: "B-2-2",
              id: "B-2-2",
              children: [{ name: "B-2-2-1", id: "B-2-2-1" }]
            }
          ]
        }
      ]
    }
  },
  {
    id: "r3",
    name: "C 关系",
    tree: {
      name: "根 C",
      id: "C",
      children: [
        { name: "C-1", id: "C-1" },
        { name: "C-2", id: "C-2" },
        {
          name: "C-3",
          id: "C-3",
          children: [
            { name: "C-3-1", id: "C-3-1" },
            { name: "C-3-2", id: "C-3-2" },
            { name: "C-3-3", id: "C-3-3" }
          ]
        }
      ]
    }
  },
  {
    id: "r4",
    name: "D 关系",
    tree: {
      name: "根 D",
      id: "D",
      children: [
        {
          name: "D-1",
          id: "D-1",
          children: [
            {
              name: "D-1-1",
              id: "D-1-1",
              children: [
                { name: "D-1-1-1", id: "D-1-1-1" },
                { name: "D-1-1-2", id: "D-1-1-2" }
              ]
            }
          ]
        },
        { name: "D-2", id: "D-2" }
      ]
    }
  },
  {
    id: "r5",
    name: "E 关系",
    tree: {
      name: "根 E",
      id: "E",
      children: [
        { name: "E-1", id: "E-1" },
        { name: "E-2", id: "E-2" },
        {
          name: "E-3",
          id: "E-3",
          children: [
            { name: "E-3-1", id: "E-3-1" },
            { name: "E-3-2", id: "E-3-2" }
          ]
        }
      ]
    }
  },
  {
    id: "r6",
    name: "F 关系（测试不同深度）",
    tree: {
      name: "根 F",
      id: "F",
      children: [
        { name: "F-1", id: "F-1" },
        {
          name: "F-2",
          id: "F-2",
          children: [
            { name: "F-2-1", id: "F-2-1" },
            {
              name: "F-2-2",
              id: "F-2-2",
              children: [
                { name: "F-2-2-1", id: "F-2-2-1" },
                { name: "F-2-2-2", id: "F-2-2-2" },
                {
                  name: "F-2-2-3",
                  id: "F-2-2-3",
                  children: [
                    { name: "F-2-2-3-1", id: "F-2-2-3-1" },
                    { name: "F-2-2-3-2", id: "F-2-2-3-2" }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
]);

// 记录每行 TreeCell 的实例，用于操作列调用
const treeCellRefs = ref<Record<string, any>>({}).value;


onMounted(() => {
  // 预留：数据来自接口时可在此请求后赋值 tableData
});
</script>

<style scoped lang="scss">
.relation-table { width: 100%; }
.actions { display: flex; gap: 8px; }
.btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.btn.primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}
.btn:hover { filter: brightness(0.98); }
.tree-cell .chart { width: 100%; }
</style>

