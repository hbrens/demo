<script setup lang="tsx">

import { ref, shallowRef, onMounted, h, render } from 'vue';
import { AgGridVue } from 'ag-grid-vue3'
import { ElButton, ElCheckbox } from 'element-plus'
import CustomHeader from './CustomHeader.vue'
import AthleteEditor from './AthleteEditor.vue'

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
  RenderApiModule,
  ColumnApiModule
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
  // { field: "sport", type: 'editableColumn' },
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

// function restoreFromHardCoded() {
//   const hardcodedFilter = {
//     age: {
//       filterType: 'number',
//       operator: 'OR',
//       conditions: [
//         {
//           type: 'equals',
//           filter: '20',
//           filterType: 'number'
//         },
//         {
//           type: 'equals',
//           filter: '24',
//           filterType: 'number'
//         },
//         {
//           type: 'equals',
//           filter: '25',
//           filterType: 'number'
//         },
//         {
//           type: 'equals',
//           filter: '30',
//           filterType: 'number'
//         },
//         {
//           type: 'equals',
//           filter: '40',
//           filterType: 'number'
//         }
//       ]
//     }
//   };
//   gridApi.value!.setFilterModel(hardcodedFilter);
// }


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

const onGridReady = (params) => {
  gridApi.value = params.api;
  columnApi.value = params.columnApi;


  fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    .then((resp) => resp.json())
    .then((data) => {
      updateData(data)
    });
}

// 添加切换编辑状态的方法
const toggleEditable = () => {
  isEditable.value = !isEditable.value;
  // 刷新表格以更新编辑状态
  gridApi.value.refreshCells({ force: true });
};

const defaultColDef = ref({
  filter: true,
  suppressMenuHide: true, // 显示菜单按钮（三个点）
  
})

// 添加列显示控制
const visibleColumns = ref(columnDefs.value.map(col => ({
  field: col.field,
  headerName: col.headerName || col.field,
  visible: true
})));

// 添加切换列可见性的方法
const toggleColumnVisibility = (field, visible) => {
  if (gridApi.value) {
    gridApi.value.setColumnsVisible([field], visible);
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

        <!-- 添加列显示控制区域 -->
        <div class="column-visibility-controls">
          <el-checkbox
            v-for="col in visibleColumns"
            :key="col.field"
            v-model="col.visible"
            @change="(val) => toggleColumnVisibility(col.field, val)"
            :label="col.headerName"
          />
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
          :rowData="rowData">
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

      .column-visibility-controls {
        display: flex;
        flex-wrap: wrap;
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