<script setup>


import {
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  NumberEditorModule,
  TextEditorModule,
  ValidationModule,
  SelectEditorModule,
  TextFilterModule,
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
  ValidationModule /* Development Only */,
  TextFilterModule,
]);

import { ref, shallowRef } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'



const defaultColDef = ref({
  editable: true,
  filter: true,
})

const gridApi = shallowRef(null)
const columnApi = shallowRef(null)

const columnVisibility = ref({
  athlete: true,
  age: true,
  country: true,
  year: true,
  total: true
})

const athleteFilterParams = {
  filterOptions: ["contains", "notContains"],
  textFormatter: (r) => {
    if (r == null) return null;
    return r
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/æ/g, "ae")
      .replace(/ç/g, "c")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/ñ/g, "n")
      .replace(/[òóôõö]/g, "o")
      .replace(/œ/g, "oe")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ýÿ]/g, "y");
  },
  debounceMs: 200,
  maxNumConditions: 1,
}

const columnDefs = ref([
  { 
    field: "athlete",
    filterParams: athleteFilterParams,
   },
  { 
    field: "age",
    hide: !columnVisibility.value.age
  },
  { 
    field: "country",
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
        values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
    }
  },
  { field: "year" },
  { field: "total" },
]);

const rowData = ref([])

const onGridReady = (params) => {
  gridApi.value = params.api;
  columnApi.value = params.columnApi;

  const updateData = (data) => {
    console.log(data)
    rowData.value = data
  };

  fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    .then((resp) => resp.json())
    .then((data) => updateData(data));
}

const onCellValueChanged = (params) => {
  console.log('单元格数据已更改:', {
    行索引: params.rowIndex,
    列名: params.colDef.field,
    旧值: params.oldValue,
    新值: params.value,
    行数据: params.data
  })
}

const toggleColumn = (field) => {
  // columnVisibility.value[field] = !columnVisibility.value[field]
  columnApi.value.setColumnVisible(field, false)
  console.log(field)
}

</script>

<template>
  <div style="height: 100vh; width: 100%;">
    <div class="column-controls" style="padding: 10px;">
      <label v-for="(col, index) in columnDefs" :key="index" style="margin-right: 15px;">
        <input
          type="checkbox"
          :checked="columnVisibility[col.field]"
          @change="toggleColumn(col.field)"
        >
        {{ col.field }}
      </label>
    </div>

    <ag-grid-vue
      style="width: 100%; height: calc(100% - 50px);"
      @grid-ready="onGridReady"
      @cell-value-changed="onCellValueChanged"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      v-model="rowData">
    </ag-grid-vue>
  </div>
</template>

<style scoped>
.column-controls {
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.column-controls label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.column-controls input[type="checkbox"] {
  margin-right: 5px;
}
</style>