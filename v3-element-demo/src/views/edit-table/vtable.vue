<script setup>
import { ListTable, register } from '@visactor/vue-vtable';
import * as VTable_editors from "@visactor/vtable-editors";
import { ref, onMounted } from 'vue'




const select_editor = new VTable_editors.ListEditor({ values: ['女', '男'] });
register.editor("select-editor", select_editor);
const input_editor = new VTable_editors.InputEditor();
register.editor("input-editor", input_editor);
const tableOptions = {
  columns: [
    { 
      field: '0', 
      title: '姓名',
      editConfig: {
        editable: true
      },
      editor:'select-editor'
    },
    { 
      field: '1', 
      title: '年龄',
      editConfig: {
        editable: true
      },
      editor: {
        type: 'text',
        options: {
          init: (cell, value) => {
            return new VTable_editors.TextEditor(cell, value)
          }
        }
      }
    },
    { 
      field: '2', 
      title: '性别',
      editConfig: {
        editable: true
      },
      editor: "input-editor"
    },
    { 
      field: '3', 
      title: '爱好',
      editConfig: {
        editable: true
      },
      editor: {
        type: 'text',
        options: {
          init: (cell, value) => {
            return new VTable_editors.TextEditor(cell, value)
          }
        }
      }
    }
  ],
  widthMode: 'standard',
  defaultRowHeight: 40,
  defaultHeaderRowHeight: 40,
  hover: true,
  enableColumnResize: true,
  autoRowHeight: true,
  enableEdit: true,
  editMode: 'dbclick'
}



const tableRecords = ref([])

onMounted(() => {
  console.log(tableRecords.value)
  setTimeout(() => {
    tableRecords.value = new Array(5).fill(0).map(() => ['张三', 25, '男', '篮球'])
  }, 3000)
})

const handleDataChange = (args) => {
  const { row, col, value } = args
  tableRecords.value[row][col] = value

  console.log(args)
}
</script>

<template>
  <div class="vtable-container">
    <ListTable
      :records="tableRecords"
      :options="tableOptions"
      @cell-value-change="handleDataChange"
    />
  </div>
</template>

<style scoped>
.vtable-container {
  width: 100%;
  height: 400px;
}
</style>