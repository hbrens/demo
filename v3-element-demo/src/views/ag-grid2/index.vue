<script setup lang="ts">

import { ref, shallowRef, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3'

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
]);

import { AG_GRID_LOCALE_CN } from '@ag-grid-community/locale';


const gridApi = shallowRef(null);
const columnApi = ref(null);

const localeText = ref(AG_GRID_LOCALE_CN);

const rowData = ref([]);


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

const columnDefs = ref([
  { 
    field: "athlete",
    filterParams: athleteFilterParams,
   },
  { 
    field: "age",
  },
  { 
    field: "country",
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
        values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
    }
  },
  { field: "year" },
  { field: "date" },
  { field: "gold" },
  { field: "silver" },
  { field: "sport" },
  { field: "total" },
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

const defaultColDef = ref({
  editable: true,
  filter: true,
})

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


</script>

<template>
  <div class="grid-page">
    <div class="grid-container card">
      <div class="grid-header">
        
      </div>

      <div class="grid-content">
        <ag-grid-vue
          style="width: 100%; height: 100%;"
          @grid-ready="onGridReady"
          @cell-value-changed="onCellValueChanged"
          :columnDefs="columnDefs"
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
}
</style>