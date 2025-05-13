<script setup lang="tsx">

import { ref, shallowRef, onMounted, h, render } from 'vue';
import { AgGridVue } from 'ag-grid-vue3'
import { ElButton, ElCheckbox } from 'element-plus'
import CustomHeader from './CustomHeader.vue'
import AthleteEditor from './AthleteEditor.vue'
import CustomLargeTextEditor from './CustomLargeTextEditor.vue'
import ColumnConfig from './ColumnConfig.vue'

import {
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  NumberEditorModule,
  TextEditorModule,
  ValidationModule,
  SelectEditorModule,
  TextFilterModule,
  NumberFilterModule,
  LocaleModule,
  CellStyleModule,
  RenderApiModule,
  themeAlpine,
  themeBalham,
  themeMaterial,
  themeQuartz,
  CustomEditorModule,
  ColumnApiModule,
  EventApiModule,
  LargeTextEditorModule,
} from "ag-grid-community";


ModuleRegistry.registerModules([
  NumberEditorModule,
  TextEditorModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  SelectEditorModule,
  LocaleModule,
  CustomEditorModule,
  NumberFilterModule,
  ValidationModule /* Development Only */,
  TextFilterModule,
  CellStyleModule,
  LargeTextEditorModule,
  RenderApiModule,
  ColumnApiModule,
  EventApiModule
]);

import { AG_GRID_LOCALE_CN } from '@ag-grid-community/locale';


const gridApi = shallowRef(null);

const localeText = ref(AG_GRID_LOCALE_CN);

const rowData = ref([]);

// 添加编辑状态控制
const isEditable = ref(true);

const athleteFilterParams = {
  filterOptions: ["contains", "notContains"],
  textFormatter: (r) => {
    if (r == null) return null;
    return r
      .toLowerCase()
  },
  debounceMs: 200,
  maxNumConditions: 1,
}

const onDeleteRow = (params) => {
  console.log(params, 'delete')
}

const columnTypes = ref({
  editableColumn: {
    editable: params => isEditable.value && params.data.year > 2010,
    cellClass: params => params.data.year > 2010 ? 'editable-cell' : ''
  }
});

const dialogVisible = ref(false);
const currentEditData = ref({
  rowIndex: null,
  athlete: ''
});

const columnDefs = ref([
  { 
    field: "athlete", 
    type: 'editableColumn', 
    filterParams: athleteFilterParams,
    headerComponent: CustomHeader,
    editable: false,
    pinned: 'left',
    onCellDoubleClicked: (params) => {
      if (isEditable.value && params.data.year > 2010) {
        currentEditData.value = {
          rowIndex: params.rowIndex,
          athlete: params.value
        };
        dialogVisible.value = true;
      }
    }
  },
  { field: "age", type: 'editableColumn' },
  { 
    field: "country",
    type: 'editableColumn',
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
        values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
    },
  },
  { field: "year", type: 'editableColumn' },
  // { field: "date", type: 'editableColumn' },
  // { field: "gold", type: 'editableColumn' },
  // { field: "silver", type: 'editableColumn' },
  {
    field: "sport", 
    headerName: "涉及到的运动涉及到的运动涉及到的运动",
    type: 'editableColumn',
    width: 50,
    cellEditor: CustomLargeTextEditor,
    cellEditorPopup: true,
    cellEditorParams: {
      maxLength: 1000,    // 最大字符数
      rows: 10,           // 文本框行数
      cols: 50            // 文本框列数
    }
  },
  // { field: "total", type: 'editableColumn' },
  {
    headerName: "年龄和年份", 
    colId: 'ageYear',
    valueGetter: (params) => {
      return params.data.age + ' ' + params.data.year;
    },
    hide: true,
    editable: false
  },
  {
    headerName: '操作',
    field: 'action',
    width: 70,
    editable: false,
    cellRenderer: (params) => {
      const container = document.createElement('div');
      // 创建 Vue 组件
      const button = h(
        ElButton,
        {
          type: 'danger',
          size: 'small',
          onClick: () => onDeleteRow(params.data)
        },
        () => '删除'
      );
      // 渲染组件
      render(button, container);
      return container;
    }
  }
]);



const onCellValueChanged = (params) => {
  console.log('单元格数据已更改:', {
    行索引: params.rowIndex,
    列名: params.colDef.field,
    旧值: params.oldValue,
    新值: params.value,
    行数据: params.data
  })
}

// 添加原始数据存储
const originalData = ref([]);
// 添加选中的年龄值数组
const selectedAges = ref([20, 24, 25, 30, 40]);

// 修改 updateData 函数
const updateData = (data) => {
    // 保存原始数据
    originalData.value = data.slice(0, 1000);
    
    // 获取所有唯一的 country 值
    const uniqueCountries = [...new Set(data.map(item => item.country))].sort();
    
    // 更新 country 列的 cellEditorParams
    const countryCol = columnDefs.value.find(col => col.field === 'country');
    if (countryCol) {
      countryCol.cellEditorParams = {
        values: uniqueCountries
      };
    }
    
    // 更新表格数据
    rowData.value = data.slice(0, 1000);
};

// 添加手动筛选函数
const filterBySelectedAges = () => {
  if (!originalData.value.length) return;
  
  // 根据选中的年龄值筛选数据
  const filteredData = originalData.value.filter(item => 
    selectedAges.value.includes(item.age)
  );
  
  // 更新表格数据
  rowData.value = filteredData;
};

// 修改 restoreFromHardCoded 函数
function restoreFromHardCoded() {
  filterBySelectedAges();
}

// 添加常量用于存储列配置的key
const COLUMN_CONFIG_STORAGE_KEY = 'ag-grid-column-config';
const COLUMN_WIDTH_STORAGE_KEY = 'ag-grid-column-width';

// 保存列配置到localStorage
const saveColumnConfigToStorage = () => {
  if (!gridApi.value) return;
  
  // 获取当前列状态
  const columnState = gridApi.value.getColumnState();
  
  try {
    // 保存到localStorage
    localStorage.setItem(COLUMN_CONFIG_STORAGE_KEY, JSON.stringify(columnState));
    console.log('列配置已保存到localStorage');
  } catch (error) {
    console.error('保存列配置到localStorage失败:', error);
  }
};

// 从localStorage加载列配置
const loadColumnConfigFromStorage = () => {
  if (!gridApi.value) return false;
  
  try {
    // 从localStorage获取
    const savedConfig = localStorage.getItem(COLUMN_CONFIG_STORAGE_KEY);
    if (!savedConfig) return false;
    
    const columnState = JSON.parse(savedConfig);
    console.log('从localStorage加载列配置:', columnState);
    
    // 获取当前所有列ID，用于检测新增的列
    const currentColIds = gridApi.value.getColumnDefs()
      .map(col => col.field || col.colId)
      .filter(Boolean);
    
    // 过滤出有效的列状态（仅包含当前存在的列）
    const validColumnState = columnState.filter(col => 
      currentColIds.includes(col.colId)
    );
    
    // 应用列状态
    gridApi.value.applyColumnState({
      state: validColumnState,
      applyOrder: true,
      defaultState: { hide: false }
    });
    
    return true;
  } catch (error) {
    console.error('从localStorage加载列配置失败:', error);
    return false;
  }
};

// 清除localStorage中的列配置
const clearColumnConfigStorage = () => {
  try {
    localStorage.removeItem(COLUMN_CONFIG_STORAGE_KEY);
    localStorage.removeItem(COLUMN_WIDTH_STORAGE_KEY);
    console.log('列配置已从localStorage中清除');
  } catch (error) {
    console.error('清除localStorage中的列配置失败:', error);
  }
};

// 修改onGridReady函数，加载保存的配置
const onGridReady = (params) => {
  console.log('表格已准备就绪，初始化API');
  // 保存gridApi
  gridApi.value = params.api;
  
  // 记录API状态
  console.log('gridApi状态:', !!gridApi.value);
  console.log('gridApi', gridApi.value);

  // 获取数据
  fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    .then((resp) => resp.json())
    .then((data) => {
      updateData(data);
      console.log('数据加载完成');
      
      // 在数据加载完成后，尝试从localStorage加载列配置
      setTimeout(() => {
        loadColumnConfigFromStorage();
      }, 100);
    })
    .catch(error => {
      console.error('获取数据时出错:', error);
    });
    
  // 监听列大小改变事件，保存配置
  gridApi.value.addEventListener('columnResized', (event) => {
    if (event.finished) {
      console.log('列大小已改变，保存配置');
      saveColumnConfigToStorage();
    }
  });
  
  // 监听列移动事件，保存配置
  gridApi.value.addEventListener('columnMoved', (event) => {
    console.log('列顺序已改变，保存配置');
    saveColumnConfigToStorage();
  });
  
  // 监听列可见性改变事件，保存配置
  gridApi.value.addEventListener('columnVisible', (event) => {
    console.log('列可见性已改变，保存配置');
    saveColumnConfigToStorage();
  });
  
  // 监听列固定状态改变事件，保存配置
  gridApi.value.addEventListener('columnPinned', (event) => {
    console.log('列固定状态已改变，保存配置');
    saveColumnConfigToStorage();
  });
};

// 添加切换编辑状态的方法
const toggleEditable = () => {
  isEditable.value = !isEditable.value;
  // 刷新表格以更新编辑状态
  gridApi.value.refreshCells({ force: true });
};

const defaultColDef = ref({
  filter: true,
  suppressMenuHide: true, // 显示菜单按钮（三个点）
  // 添加表头样式相关配置
  wrapHeaderText: true, // 允许表头文字换行
  autoHeaderHeight: true, // 表头高度自动调整
})

// 添加列显示控制
const visibleColumns = ref(columnDefs.value.map(col => ({
  field: col.field || col.colId,
  headerName: col.headerName || col.field || col.colId,
  visible: col.hide !== true
})));

// 添加切换列可见性的方法
const toggleColumnVisibility = (field, visible) => {
  if (gridApi.value) {
    gridApi.value.setColumnVisible(field, visible);
  }
};

// 添加保存编辑数据的方法
const handleSaveAthlete = () => {
  if (currentEditData.value.rowIndex !== null) {
    gridApi.value.getRowNode(currentEditData.value.rowIndex).setDataValue(
      'athlete',
      currentEditData.value.athlete
    );
  }
  dialogVisible.value = false;
};

// 修改筛选方法
const setAgeYearFilter = () => {
  if (gridApi.value) {
    gridApi.value.setFilterModel({
      'ageYear': {
        filterType: 'text',
        operator: 'OR',
        conditions: [
          {
            type: 'contains',
            filter: '30'
          },
          {
            type: 'contains',
            filter: '2008'
          }
        ]
      }
    });
  }
};

// 添加列配置抽屉控制
const columnConfigDrawerVisible = ref(false);

// 添加当前列配置数据
const currentColumnConfig = ref([]);

// 打开列配置抽屉前获取最新列状态
const openColumnConfigDrawer = () => {
  // 获取最新的列配置
  currentColumnConfig.value = getColumnConfigData();
  // 打开抽屉
  columnConfigDrawerVisible.value = true;
};

// 处理应用列配置更改
const handleApplyColumnChanges = (updatedColumnDefs) => {
  console.log('接收到列配置更新请求');

  if (!gridApi.value) {
    console.error('API未初始化，请等待表格加载完成');
    alert('表格尚未完全加载，请稍后再试');
    return;
  }
  
  try {
    console.log('开始应用列配置更改...');
    
    // 获取原始定义中明确设置为隐藏的列
    const permanentlyHiddenColumns = columnDefs.value
      .filter(col => col.hide === true)
      .map(col => ({
        colId: col.field || col.colId,
        hide: true,
        pinned: col.pinned || null
      }))
      .filter(col => col.colId); // 确保colId存在
    
    console.log('永久隐藏的列:', permanentlyHiddenColumns);
    
    // 创建完整的列状态，同时包含可见性、顺序和固定位置
    const configuredColumnState = updatedColumnDefs.map(col => {
      const colId = col.field || col.colId;
      return {
        colId: colId,
        hide: !col.visible, // AG-Grid使用hide属性
        pinned: col.pinned || null
      };
    });
    
    // 合并用户配置的列状态和永久隐藏的列状态
    const allColumnState = [
      ...configuredColumnState,
      ...permanentlyHiddenColumns
    ];
    
    // 一次性应用所有列状态
    console.log('应用列状态:', allColumnState);
    gridApi.value.applyColumnState({
      state: allColumnState,
      applyOrder: true, // 应用列顺序
      defaultState: { hide: false } // 默认显示列
    });
    
    // 刷新表格
    gridApi.value.refreshHeader();
    
    // 同步visibleColumns并包含pinned信息
    visibleColumns.value = updatedColumnDefs.map(col => ({
      field: col.field || col.colId,
      headerName: col.headerName || col.field || col.colId,
      visible: col.visible,
      pinned: col.pinned
    }));
    
    // 更新当前列配置，确保下次打开抽屉时显示最新状态
    currentColumnConfig.value = getColumnConfigData();
    
    // 保存配置到localStorage
    saveColumnConfigToStorage();
    
    // 关闭抽屉
    columnConfigDrawerVisible.value = false;
    
    console.log('列配置应用完成');
  } catch (error) {
    console.error('应用列配置时出错:', error);
    alert('设置列配置失败，请查看控制台获取详细信息');
  }
};

// 准备完整的列定义数据（包含pinned属性）
const getColumnConfigData = () => {
  // 获取原始定义中明确设置为隐藏的列ID列表
  const permanentlyHiddenColumns = columnDefs.value
    .filter(col => col.hide === true)
    .map(col => col.field || col.colId)
    .filter(Boolean);
  
  console.log('永久隐藏的列:', permanentlyHiddenColumns);
  
  // 如果gridApi存在，则从当前表格状态获取列配置
  if (gridApi.value) {
    // 获取当前列状态
    const columnState = gridApi.value.getColumnState();
    console.log('当前列状态:', columnState);
    
    // 将列状态转换为所需的格式，并过滤掉永久隐藏的列
    return columnState
      .filter(col => !permanentlyHiddenColumns.includes(col.colId))
      .map(col => {
        // 查找原始列定义以获取headerName
        const originalCol = columnDefs.value.find(c => (c.field || c.colId) === col.colId);
        
        return {
          field: col.colId,
          headerName: originalCol?.headerName || originalCol?.field || col.colId,
          visible: !col.hide, // 注意这里是取反，因为AG-Grid用hide表示隐藏
          pinned: col.pinned || null
        };
      });
  } else {
    // 如果gridApi不存在，则使用原始列定义，过滤掉永久隐藏的列
    return columnDefs.value
      .filter(col => col.hide !== true)
      .map(col => ({
        field: col.field || col.colId,
        headerName: col.headerName || col.field || col.colId,
        visible: true, // 默认显示
        pinned: col.pinned || null
      }));
  }
};

// 重置所有列配置到默认状态
const resetAllColumnConfig = () => {
  if (!gridApi.value) return;
  
  try {
    // 清除localStorage中的配置
    clearColumnConfigStorage();
    
    // 重置列配置到原始定义
    const defaultColumnState = columnDefs.value.map(col => ({
      colId: col.field || col.colId,
      hide: col.hide === true,
      pinned: col.pinned || null,
      // 如果原始定义中有宽度，则保留
      width: col.width
    })).filter(col => col.colId);
    
    // 应用默认列状态
    gridApi.value.applyColumnState({
      state: defaultColumnState,
      applyOrder: true,
      defaultState: { hide: false }
    });
    
    // 刷新表格
    gridApi.value.refreshHeader();
    
    // 关闭抽屉
    columnConfigDrawerVisible.value = false;
    
    // 更新当前列配置
    currentColumnConfig.value = getColumnConfigData();
    
    console.log('已恢复所有列配置到默认状态');
  } catch (error) {
    console.error('恢复默认列配置失败:', error);
  }
};

</script>

<template>
  <div class="grid-page">
    <div class="grid-container card">
      <div class="grid-header">
        <el-button 
          :type="isEditable ? 'warning' : 'primary'" 
          @click="toggleEditable"
        >
          {{ isEditable ? '禁用编辑' : '启用编辑' }}
        </el-button>

        <el-button @click="restoreFromHardCoded">设置过滤</el-button>

        <!-- 添加列配置按钮，修改点击事件为openColumnConfigDrawer -->
        <el-button 
          type="primary" 
          @click="openColumnConfigDrawer"
        >
          表格列配置
        </el-button>

        <!-- 添加年龄多选控件 -->
        <div class="age-filter">
          <span>年龄筛选：</span>
          <el-checkbox-group v-model="selectedAges" @change="filterBySelectedAges">
            <el-checkbox :label="20">20岁</el-checkbox>
            <el-checkbox :label="24">24岁</el-checkbox>
            <el-checkbox :label="25">25岁</el-checkbox>
            <el-checkbox :label="30">30岁</el-checkbox>
            <el-checkbox :label="40">40岁</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div class="grid-content">
        <ag-grid-vue
          style="width: 100%; height: 100%;"
          @grid-ready="onGridReady"
          @cell-value-changed="onCellValueChanged"
          :columnDefs="columnDefs"
          :columnTypes="columnTypes"
          :suppressScrollOnNewData="true"
          :defaultColDef="defaultColDef"
          :localeText="localeText"
          :rowData="rowData"
          :suppressColumnVirtualisation="true"
          :suppressColumnMoveAnimation="false"
          :maintainColumnOrder="true">
        </ag-grid-vue>
      </div>
    </div>

    <!-- 添加编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑运动员信息"
      width="30%"
    >
      <el-form>
        <el-form-item label="运动员名称">
          <el-input v-model="currentEditData.athlete" placeholder="请输入运动员名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAthlete">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加列配置抽屉，把columnDefs属性改为传入currentColumnConfig -->
    <ColumnConfig
      v-model="columnConfigDrawerVisible"
      :columnDefs="currentColumnConfig"
      @applyChanges="handleApplyColumnChanges"
      @resetAll="resetAllColumnConfig"
    />
  </div>
</template>

<style lang="less" scoped>
.grid-page {
  padding: 10px;
  width: 100vw;
  height: 100vh;
  background-color: #eee;
  .grid-container {
    height: 100%;

    display: flex;
    flex-direction: column;

    .grid-header {
      height: auto; // 修改为自动高度以适应复选框
      min-height: 40px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      padding: 10px;

      .age-filter {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
    .grid-content {
      flex: 1;
    }
  }

  .card {
    background-color: #fff;
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  }

  .btn-delete {
    background-color: #ff0000;
    color: #fff;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
    margin-left: 5px;
  }
}

:deep(.editable-cell) {
  background-color: #f0f9eb !important;
}

.age-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

<style>
.ag-header-cell-label {
  white-space: normal !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.ag-header-cell-label .ag-header-cell-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 最多显示两行 */
  -webkit-box-orient: vertical;
  line-height: 1.2em;
  max-height: 2.4em; /* 两行高度 = 行高 * 2 */
}

/* 确保表头有足够高度容纳两行文本 */
.ag-header-row {
  height: auto !important;
  min-height: 40px; /* 可根据需要调整 */
}

/* 优化表头单元格的内边距 */
.ag-header-cell {
  padding: 4px 8px;
} 
</style>