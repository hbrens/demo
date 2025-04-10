<script setup lang="tsx">

import { ref, shallowRef, onMounted, h, render } from 'vue';
import { AgGridVue } from 'ag-grid-vue3'
import { ElButton } from 'element-plus'
import DeleteBtn from './deleteBtn.vue'

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
  themeAlpine,
  themeBalham,
  themeMaterial,
  themeQuartz,
} from "ag-grid-community";


ModuleRegistry.registerModules([
  NumberEditorModule,
  TextEditorModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  SelectEditorModule,
  LocaleModule,
  NumberFilterModule,
  ValidationModule /* Development Only */,
  TextFilterModule,
  CellStyleModule,
]);

import { AG_GRID_LOCALE_CN } from '@ag-grid-community/locale';


const gridApi = shallowRef(null);
const columnApi = ref(null);

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

const getUpdatedValues = () => {
  
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

const columnDefs = ref([
  { field: "athlete", type: 'editableColumn', filterParams: athleteFilterParams },
  { field: "age", type: 'editableColumn' },
  { 
    field: "country",
    type: 'editableColumn',
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
        values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
    }
  },
  { field: "year", type: 'editableColumn' },
  { field: "date", type: 'editableColumn' },
  { field: "gold", type: 'editableColumn' },
  { field: "silver", type: 'editableColumn' },
  { field: "sport", type: 'editableColumn' },
  { field: "total", type: 'editableColumn' },
  {
    headerName: '操作',
    field: 'action',
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

const updateData = (data) => {
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
    rowData.value = data;
  };

const onGridReady = (params) => {
  gridApi.value = params.api;
  columnApi.value = params.columnApi;


  fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    .then((resp) => resp.json())
    .then((data) => updateData(data));
}

// 添加切换编辑状态的方法
const toggleEditable = () => {
  isEditable.value = !isEditable.value;
  // 刷新表格以更新编辑状态
  gridApi.value.refreshCells({ force: true });
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
          :rowData="rowData">
        </ag-grid-vue>
      </div>
    </div>
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
      height: 40px;
      display: flex;
      align-items: center;
      padding: 0 10px;
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
</style>