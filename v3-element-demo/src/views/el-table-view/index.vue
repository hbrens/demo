<template>
  <div style="margin-bottom: 16px;">
    <el-button type="primary" @click="exportExcel">导出Excel</el-button>
  </div>
  <el-table :data="tableData" border style="width: 100%" show-summary :summary-method="getSummaries">
    <el-table-column prop="id" label="ID" min-width="60" />
    <el-table-column prop="name" label="姓名" min-width="100" />
    <el-table-column prop="age" label="年龄" min-width="80" />
    <el-table-column prop="gender" label="性别" min-width="80" />
    <el-table-column prop="city" label="城市" min-width="100" />
    <el-table-column prop="job" label="职业" min-width="120" />
    <el-table-column prop="salary" label="月薪(元)" min-width="100" />
    <el-table-column prop="department" label="部门" min-width="100" />
    <el-table-column prop="entryDate" label="入职日期" min-width="120" />
    <el-table-column prop="email" label="邮箱" min-width="180" />
  </el-table>
</template>

<script setup>
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

// 可配置导出字段
const columnsConfig = [
  { label: 'ID', prop: 'id', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF000000', colorFontWeight: false, summaryCellColor: 'FF000000', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  { label: '姓名', prop: 'name', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF000000', colorFontWeight: false, summaryCellColor: 'FF000000', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  // { label: '年龄', prop: 'age', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF000000', colorFontWeight: false, summaryCellColor: 'FF000000', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  { label: '性别', prop: 'gender', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF000000', colorFontWeight: false, summaryCellColor: 'FF000000', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  { label: '城市', prop: 'city', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF000000', colorFontWeight: false, summaryCellColor: 'FF000000', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  { label: '职业', prop: 'job', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF000000', colorFontWeight: false, summaryCellColor: 'FF000000', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  { label: '月薪(元)', prop: 'salary', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF1C4587', colorFontWeight: true, summaryCellColor: 'FFFFFFFF', summaryCellBg: 'FFFF0000', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  { label: '部门', prop: 'department', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF00FF00', colorFontWeight: false, summaryCellColor: 'FF00FF00', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  { label: '入职日期', prop: 'entryDate', headerColor: 'FF000000', headerFontWeight: true, headerBgColor: 'FFEBF1DE', columnColor: 'FF000000', colorFontWeight: false, summaryCellColor: 'FF000000', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'center', colVerticalAlign: 'middle' },
  { label: '邮箱', prop: 'email', headerColor: 'FFFF0000', headerFontWeight: true, headerBgColor: 'FFFFFFFF', columnColor: 'FF38761D', colorFontWeight: false, summaryCellColor: 'FF38761D', summaryCellBg: 'FFFFFFFF', colHorizontalAlign: 'left', colVerticalAlign: 'top' },
]

const tableData = ref([
  { id: 1, name: '张三', age: 28, gender: '男', city: '北京', job: '前端工程师', salary: 18000, department: '技术部', entryDate: '2021-03-15', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 32, gender: '女', city: '上海', job: '产品经理', salary: 22000, department: '产品部', entryDate: '2020-07-01', email: 'lisi@example.com' },
  { id: 3, name: '王五', age: 25, gender: '男', city: '广州', job: 'UI设计师', salary: 15000, department: '设计部', entryDate: '2022-01-10', email: 'wangwu@example.com' },
  { id: 4, name: '赵六', age: 29, gender: '女', city: '深圳', job: '测试工程师', salary: 16000, department: '测试部', entryDate: '2019-11-20', email: 'zhaoliu@example.com' },
  { id: 5, name: '钱七', age: 35, gender: '男', city: '杭州', job: '后端工程师', salary: 20000, department: '技术部', entryDate: '2018-05-30', email: 'qianqi@example.com' },
  { id: 6, name: '孙八', age: 27, gender: '女', city: '成都', job: '运维工程师', salary: 15500, department: '运维部', entryDate: '2021-09-12', email: 'sunba@example.com' },
  { id: 7, name: '周九', age: 31, gender: '男', city: '重庆', job: '数据分析师', salary: 21000, department: '数据部', entryDate: '2020-02-18', email: 'zhoujiu@example.com' },
  { id: 8, name: '吴十', age: 26, gender: '女', city: '南京', job: '市场专员', salary: 14000, department: '市场部', entryDate: '2022-06-25', email: 'wushi@example.com' },
  { id: 9, name: '郑十一', age: 30, gender: '男', city: '苏州', job: '销售经理', salary: 23000, department: '销售部', entryDate: '2017-10-08', email: 'zheng11@example.com' },
  { id: 10, name: '王十二', age: 24, gender: '女', city: '天津', job: '行政助理', salary: 12000, department: '行政部', entryDate: '2023-01-05', email: 'wang12@example.com' },
  { id: 11, name: '冯十三', age: 33, gender: '男', city: '武汉', job: '项目经理', salary: 25000, department: '项目部', entryDate: '2016-08-16', email: 'feng13@example.com' },
  { id: 12, name: '陈十四', age: 29, gender: '女', city: '西安', job: '人事专员', salary: 13500, department: '人事部', entryDate: '2021-12-01', email: 'chen14@example.com' },
  { id: 13, name: '褚十五', age: 27, gender: '男', city: '长沙', job: '法务专员', salary: 14500, department: '法务部', entryDate: '2020-04-22', email: 'chu15@example.com' },
  { id: 14, name: '卫十六', age: 28, gender: '女', city: '青岛', job: '采购专员', salary: 13800, department: '采购部', entryDate: '2019-09-14', email: 'wei16@example.com' },
  { id: 15, name: '蒋十七', age: 34, gender: '男', city: '合肥', job: '财务经理', salary: 24000, department: '财务部', entryDate: '2018-03-27', email: 'jiang17@example.com' },
  { id: 16, name: '沈十八', age: 26, gender: '女', city: '济南', job: '公关专员', salary: 14200, department: '公关部', entryDate: '2022-10-19', email: 'shen18@example.com' },
  { id: 17, name: '韩十九', age: 30, gender: '男', city: '大连', job: '物流专员', salary: 15000, department: '物流部', entryDate: '2020-06-11', email: 'han19@example.com' },
  { id: 18, name: '杨二十', age: 25, gender: '女', city: '厦门', job: '客服专员', salary: 13000, department: '客服部', entryDate: '2023-02-28', email: 'yang20@example.com' },
  { id: 19, name: '朱二一', age: 29, gender: '男', city: '福州', job: '研发工程师', salary: 19500, department: '技术部', entryDate: '2021-05-06', email: 'zhu21@example.com' },
  { id: 20, name: '秦二二', age: 28, gender: '女', city: '珠海', job: '内容编辑', salary: 13600, department: '内容部', entryDate: '2022-08-13', email: 'qin22@example.com' },
])

// el-table合计函数
function getSummaries(param) {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (["age", "salary"].includes(column.property)) {
      const values = data.map(item => Number(item[column.property]))
      if (!values.every(val => isNaN(val))) {
        sums[index] = values.reduce((prev, curr) => {
          const value = Number(curr)
          if (!isNaN(value)) {
            return prev + curr
          } else {
            return prev
          }
        }, 0)
      } else {
        sums[index] = ''
      }
    } else {
      sums[index] = ''
    }
  })
  return sums
}

// 导出专用合计函数
function getExportSummary(data, columnsCfg) {
  const summary = []
  columnsCfg.forEach((col, idx) => {
    if (idx === 0) {
      summary[idx] = '合计'
      return
    }
    if (["age", "salary"].includes(col.prop)) {
      const values = data.map(item => Number(item[col.prop]))
      if (!values.every(val => isNaN(val))) {
        summary[idx] = values.reduce((prev, curr) => {
          const value = Number(curr)
          if (!isNaN(value)) {
            return prev + curr
          } else {
            return prev
          }
        }, 0)
      } else {
        summary[idx] = ''
      }
    } else {
      summary[idx] = ''
    }
  })
  return summary
}

async function exportExcel() {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  // 表头
  const headerRow = worksheet.addRow(columnsConfig.map(col => col.label))
  headerRow.eachCell((cell, colNumber) => {
    const colCfg = columnsConfig[colNumber - 1]
    cell.font = {
      bold: !!colCfg.headerFontWeight,
      size: 12,
      color: { argb: colCfg.headerColor || 'FF000000' }
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.fill = colCfg.headerBgColor ? {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colCfg.headerBgColor }
    } : undefined
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
  })

  // 数据
  tableData.value.forEach(row => {
    const dataRow = worksheet.addRow(columnsConfig.map(col => row[col.prop]))
    dataRow.eachCell((cell, colNumber) => {
      const colCfg = columnsConfig[colNumber - 1]
      cell.font = {
        bold: !!colCfg.colorFontWeight,
        color: { argb: colCfg.columnColor || 'FF000000' }
      }
      cell.alignment = {
        horizontal: colCfg.colHorizontalAlign || 'center',
        vertical: colCfg.colVerticalAlign || 'middle'
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    })
  })

  // 合计行
  const summary = getExportSummary(tableData.value, columnsConfig)
  const summaryRow = worksheet.addRow(['总数', '', ...summary.slice(2)])
  worksheet.mergeCells(`A${summaryRow.number}:B${summaryRow.number}`)
  const cell = worksheet.getCell(`A${summaryRow.number}`)
  cell.font = { bold: true, color: { argb: 'FFFF0000' }, size: 12 }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
  // 合计行样式
  summaryRow.eachCell((cell, colNumber) => {
    const colCfg = columnsConfig[colNumber - 1]
    if (colNumber === 1) {
      cell.font = { bold: true, color: { argb: 'FFFF0000' }, size: 12 }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.fill = undefined
    } else if (colCfg) {
      cell.font = {
        bold: !!colCfg.colorFontWeight,
        color: { argb: colCfg.summaryCellColor || colCfg.columnColor || 'FF000000' }
      }
      cell.alignment = {
        horizontal: colCfg.colHorizontalAlign || 'center',
        vertical: colCfg.colVerticalAlign || 'middle'
      }
      cell.fill = colCfg.summaryCellBg ? {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colCfg.summaryCellBg }
      } : undefined
    }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
  })

  // 自动列宽
  worksheet.columns.forEach(column => {
    let maxLength = 10
    column.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? String(cell.value).length : 0
      if (len > maxLength) maxLength = len
    })
    column.width = maxLength + 2
  })

  // 生成并下载
  const buf = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buf]), '员工信息表.xlsx')
}
</script>