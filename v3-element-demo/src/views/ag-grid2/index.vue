<script setup lang="tsx">

import { ref, shallowRef, onMounted, h, render } from 'vue';
import { AgGridVue } from 'ag-grid-vue3'
import { ElButton, ElCheckbox, ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import CustomHeader from './CustomHeader.vue'
import AthleteEditor from './AthleteEditor.vue'
import CustomLargeTextEditor from './CustomLargeTextEditor.vue'
import CustomHobbyTagEditor from './CustomHobbyTagEditor.vue'
import ColumnConfig from './ColumnConfig.vue'
import CountrySelectEditor from './CountrySelectEditor.vue'
import CountryAutocompleteEditor from './CountryAutocompleteEditor.vue'

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
  PinnedRowModule,
  RowSelectionModule,
  GridApi,
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
  EventApiModule,
  PinnedRowModule,
  RowSelectionModule,
]);

import { AG_GRID_LOCALE_CN } from '@ag-grid-community/locale';


const gridApi = shallowRef<GridApi | null>(null);

const localeText = ref(AG_GRID_LOCALE_CN);

const rowData = ref<any[]>([]);

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
  // ... existing code ...
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
const handlePinnedCellDoubleClick = (params) => {
  // 判断是否为置顶行
  if (params.node.rowPinned === 'top') {
    // 获取id（假设有id字段，没有就用athlete或其他唯一字段）
    const id = params.node.id || params.data.athlete;
    const field = params.colDef.field;
    const value = params.value;
    // 这里可以弹窗，或者先console
    console.log('置顶行双击', { id, field, value, data: params.data });
    console.log(params.node, 'params.node')
    // TODO: 打开el-dialog并传递这些信息
  }
};

const columnDefs = ref([
  {
    headerName: '',
    checkboxSelection: true,
    width: 40,
    pinned: 'left',
  },
  { 
    field: "athlete", 
    type: 'editableColumn', 
    filterParams: athleteFilterParams,
    headerComponent: CustomHeader,
    editable: false,
    pinned: 'left',
    onCellDoubleClicked: (params) => {
      handlePinnedCellDoubleClick(params)
      // if (isEditable.value && params.data.year > 2010) {
      //   currentEditData.value = {
      //     rowIndex: params.rowIndex,
      //     athlete: params.value
      //   };
      //   dialogVisible.value = true;
      // }
    }
  },
  { field: "age", type: 'editableColumn' },
  { 
    field: "country",
    type: 'editableColumn',
    cellEditor: CountryAutocompleteEditor,
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
  // 新增 hobby 列
  {
    field: "hobby",
    headerName: "爱好",
    type: 'editableColumn',
    width: 120,
    valueGetter: (params) => {
      // hobby为数组，显示时用逗号拼接
      return Array.isArray(params.data.hobby) ? params.data.hobby.join(', ') : params.data.hobby || '';
    },
    cellEditor: CustomHobbyTagEditor,
    cellEditorPopup: true,
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
  console.log(params.value, params.oldValue, 'params')
}

// 添加选中的年龄值数组
const selectedAges = ref([20, 24, 25, 30, 40]);

// 添加表格加载状态控制
const tableLoading = ref(true);

// 添加一个辅助函数用于应用列状态并恢复列宽
const applyColumnStateHelper = (columnState, delayMs = 100, retryTimes = 1) => {
  if (!columnState || !gridApi.value) return;
  
  let retryCount = 0;
  
  const applyState = () => {
    try {
      console.log(`应用列状态，尝试 ${retryCount + 1}/${retryTimes}`);
      
      gridApi.value.applyColumnState({
        state: columnState,
        applyOrder: true,
        defaultState: { hide: false },
        // @ts-ignore
        includeProperties: ['width', 'hide', 'pinned', 'sort', 'sortIndex']
      });
      
      gridApi.value.refreshHeader();
    } catch (e) {
    }
    
    retryCount++;
    if (retryCount < retryTimes) {
      setTimeout(applyState, delayMs);
    }
  };
  
  // 首次延迟调用
  setTimeout(applyState, delayMs);
};

// 修改onGridReady函数，使用新的辅助函数
const onGridReady = (params) => {
  // 保存gridApi
  gridApi.value = params.api;
  
  // 记录API状态
  console.log('gridApi状态:', !!gridApi.value);

  // 从localStorage加载配置
  const configLoaded = loadColumnConfigFromStorage();
  
  // 保存当前列状态以便在数据加载后恢复
  let savedColumnState = null;
  if (configLoaded) {
    try {
      // 使用try-catch避免类型错误导致脚本中断
      savedColumnState = gridApi.value.getColumnState();
    } catch (err) {
    }
  }
  
  // 获取数据
  fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    .then((resp) => resp.json())
    .then((data) => {
      // mock hobby 字段
      const hobbyList = [
        ['游泳', '阅读'],
        ['足球', '音乐'],
        ['篮球', '旅行'],
        ['羽毛球', '美食'],
        ['跑步', '摄影'],
        ['乒乓球', '电影'],
        ['爬山', '绘画'],
        ['健身', '写作'],
        ['象棋', '编程'],
        ['跳舞', '钓鱼'],
      ];
      data.forEach((item, idx) => {
        // 随机分配一个hobby数组
        item.hobby = hobbyList[idx % hobbyList.length];
      });
      // 先保存原始数据，但还不设置到表格
      pinnedTopRows.value = data.slice(40, 43);
      // 获取所有唯一的 country 值
      const uniqueCountries = [...new Set(data.map(item => item.country))].sort();
      
      // 更新 country 列的 cellEditorParams
      const countryCol = columnDefs.value.find(col => (col as any).field === 'country');
      if (countryCol) {
        countryCol.cellEditorParams = {
          values: uniqueCountries
        };
      }
      
      // 在配置应用后再设置数据
      rowData.value = data.slice(0, 20);
      
      // 使用辅助函数应用列状态 - 尝试3次，每次100ms
      if (savedColumnState) {
        applyColumnStateHelper(savedColumnState, 100, 3);
      }
      
      // 移除加载状态
      tableLoading.value = false;
    })
    .catch(error => {
      tableLoading.value = false;
    });

  // 注册事件监听器
  registerGridEventListeners();
};

// 单独抽取事件注册函数，使代码更清晰
const registerGridEventListeners = () => {
  if (!gridApi.value) return;
  
  // 监听列大小改变事件，保存配置
  gridApi.value.addEventListener('columnResized', (event) => {
    if (event.finished) {
      saveColumnConfigToStorage();
    }
  });
  
  // 监听列移动事件，保存配置
  gridApi.value.addEventListener('columnMoved', (event) => {
    saveColumnConfigToStorage();
  });
  
  // 监听列可见性改变事件，保存配置
  gridApi.value.addEventListener('columnVisible', (event) => {
    saveColumnConfigToStorage();
  });
  
  // 监听列固定状态改变事件，保存配置
  gridApi.value.addEventListener('columnPinned', (event) => {
    saveColumnConfigToStorage();
  });
};

// 修改updateData函数，不要在这里直接设置rowData
const updateData = (data) => {
  // 获取所有唯一的 country 值
  const uniqueCountries = [...new Set(data.map(item => item.country))].sort();
  
  // 更新 country 列的 cellEditorParams
  const countryCol = columnDefs.value.find(col => (col as any).field === 'country');
  if (countryCol) {
    countryCol.cellEditorParams = {
      values: uniqueCountries
    };
  }
};

// 修改filterBySelectedAges函数，使用辅助函数
const filterBySelectedAges = () => {
  if (!rowData.value.length) return;
  
  // 保存当前列状态
  let currentColumnState = null;
  try {
    currentColumnState = gridApi.value.getColumnState();
  } catch (e) {
  }
  
  // 根据选中的年龄值筛选数据
  const filteredData = rowData.value.filter((item: any) => 
    selectedAges.value.includes(item.age)
  );
  
  // 更新表格数据
  rowData.value = filteredData;
  
  // 使用辅助函数恢复列宽
  if (currentColumnState) {
    applyColumnStateHelper(currentColumnState, 100, 2);
  }
};

// 修改 restoreFromHardCoded 函数
function restoreFromHardCoded() {
  filterBySelectedAges();
}

// 添加常量用于存储列配置的key
const COLUMN_CONFIG_STORAGE_KEY = 'ag-grid-column-config';

// 保存列配置到localStorage
const saveColumnConfigToStorage = () => {
  if (!gridApi.value) return;
  
  // 获取当前列状态
  const columnState = gridApi.value.getColumnState();
  
  try {
    // 保存到localStorage - 取消注释以启用持久化存储
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
    
    // 补充默认列配置中有但保存的配置中没有的列
    const savedColIds = validColumnState.map(col => col.colId);
    const defaultNewColumns = columnDefs.value
      .filter(col => {
        const c = col as any;
        const colId = c.field || c.colId;
        return colId && !savedColIds.includes(colId) && c.hide !== true;
      })
      .map(col => {
        const c = col as any;
        return {
          colId: c.field || c.colId,
          hide: false,
          pinned: c.pinned || null,
          width: c.width
        };
      });
    
    // 合并有效的保存配置和新增列的默认配置
    const mergedColumnState = [...validColumnState, ...defaultNewColumns];
    
    console.log('合并后的列状态:', mergedColumnState);
    
    // 应用列状态，特别确保width属性被正确包含
    gridApi.value.applyColumnState({
      state: mergedColumnState,
      applyOrder: true,
      defaultState: { hide: false },
      // 确保包含width属性
      includeProperties: [ 'hide', 'pinned', 'sort', 'sortIndex']
    });

    
    // 确保UI完全刷新
    gridApi.value.refreshHeader();
    
    console.log('列配置已从localStorage恢复');
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
    console.log('列配置已从localStorage中清除');
  } catch (error) {
    console.error('清除localStorage中的列配置失败:', error);
  }
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
const visibleColumns = ref(columnDefs.value.map(col => {
  const c = col as any;
  return {
    field: c.field || c.colId,
    headerName: c.headerName || c.field || c.colId,
    visible: c.hide !== true
  };
}));

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
    
    // 获取当前列状态以保存宽度信息
    const currentState = gridApi.value.getColumnState();
    const columnWidthMap = {};
    
    // 创建列宽度映射 - 这些是当前表格中真实的宽度
    currentState.forEach(col => {
      if (col.width) {
        columnWidthMap[col.colId] = col.width;
      }
    });
    
    console.log('当前列宽度映射:', columnWidthMap);
    
    // 获取原始定义中明确设置为隐藏的列
    const permanentlyHiddenColumns = columnDefs.value
      .filter(col => col.hide === true)
      .map(col => {
        const colId = col.field || col.colId;
        return {
          colId: colId,
          hide: true,
          pinned: col.pinned || null,
          // 保留宽度信息 - 优先使用当前表格的宽度
          width: columnWidthMap[colId]
        };
      })
      .filter(col => col.colId); // 确保colId存在
    
    console.log('永久隐藏的列:', permanentlyHiddenColumns);
    
    // 创建完整的列状态，应用用户在抽屉中设置的顺序、可见性和固定位置
    // 但宽度应该使用当前表格的实际宽度
    const configuredColumnState = updatedColumnDefs.map(col => {
      const colId = col.field || col.colId;
      return {
        colId: colId,
        hide: !col.visible, // AG-Grid使用hide属性
        pinned: col.pinned || null,
        // 宽度优先使用当前表格的宽度，而非抽屉中的值
        width: columnWidthMap[colId]
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
      defaultState: { hide: false }, // 默认显示列
      // 确保应用宽度
      includeProperties: ['width', 'hide', 'pinned', 'sort', 'sortIndex']
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
      .filter(col => (col as any).hide !== true)
      .map(col => {
        const c = col as any;
        return {
          field: c.field || c.colId,
          headerName: c.headerName || c.field || c.colId,
          visible: true, // 默认显示
          pinned: c.pinned || null
        };
      });
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
      defaultState: { hide: false },
      // 确保应用宽度 - 这是关键
      includeProperties: ['width', 'hide', 'pinned', 'sort', 'sortIndex']
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

const pinnedTopRows = ref<any[]>([]);

const pinTopRow = () => {
  if (!gridApi.value) return;
  const selectedNodes = gridApi.value.getSelectedNodes();
  if (selectedNodes.length === 0) {
    ElMessage.warning('请先选择要置顶的行');
    return;
  }
  const selectedData = selectedNodes.map(node => node.data);
  // 过滤掉已置顶的数据
  const newPinned = selectedData.filter(
    d => !pinnedTopRows.value.includes(d)
  );
  // 添加到 pinnedTopRows
  pinnedTopRows.value = [...pinnedTopRows.value, ...newPinned];
  // 从 rowData 里移除这些数据
  rowData.value = rowData.value.filter(
    d => !pinnedTopRows.value.includes(d)
  );
  ElMessage.success('置顶成功');
};

const unpinAllTopRows = () => {
  // 把置顶的数据加回 rowData
  rowData.value = [...pinnedTopRows.value, ...rowData.value];
  // 清空 pinnedTopRows
  pinnedTopRows.value = [];
  ElMessage.success('已取消全部置顶');
};

// 新增：修改指定置顶行 year 字段的函数
defineExpose();
const updatePinnedRowYear = () => {
  // 获取pinnedTopRows中的数据
  // 由于pinnedTopRows.value只是数据数组，没有node信息，需要通过gridApi获取rowNode
  if (!gridApi.value) return;
  // 获取所有pinnedTop rowNode
  const pinnedNodes = gridApi.value.getPinnedTopRowCount && gridApi.value.getPinnedTopRowCount() > 0
    ? Array.from({ length: gridApi.value.getPinnedTopRowCount() }, (_, i) => gridApi.value.getPinnedTopRow(i))
    : [];
  // 查找id为't-1'的node
  const targetNode = pinnedNodes.find(node => node && node.id === 't-1');
  if (targetNode) {
    // 修改year字段
    targetNode.setDataValue('year', 2025);
    ElMessage.success('已将id为t-1的置顶行year改为2025');
  } else {
    ElMessage.warning('未找到id为t-1的置顶行');
  }
};

</script>

<template>
  <div class="grid-page">
    <!-- 新增：顶部按钮 -->
    <el-button type="primary" @click="updatePinnedRowYear" style="margin-bottom: 10px;">修改id为t-1的置顶行year为2025</el-button>
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

        <el-button type="success" @click="pinTopRow">置顶选中行</el-button>
        <el-button type="info" @click="unpinAllTopRows">取消全部置顶</el-button>
      </div>

      <div class="grid-content">
        <!-- 添加表格加载状态遮罩层 -->
        <div v-if="tableLoading" class="table-loading-mask">
          <div class="loading-spinner">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
        </div>
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
          :maintainColumnOrder="true"
          :pinnedTopRowData="pinnedTopRows"
          rowSelection="multiple"
          :suppressRowClickSelection="true">
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
      position: relative; // 为遮罩层定位做准备
    }
  }

  // 添加表格加载遮罩层样式
  .table-loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      
      .el-icon {
        font-size: 24px;
        color: #409eff;
      }
      
      span {
        color: #606266;
      }
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