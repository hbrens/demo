// MultiCustomFilter.js - 纯JavaScript实现的AG-Grid自定义筛选器
class MultiCustomFilter {
  constructor() {
    this.selectedValues = [];
    this.allOptions = [];
    this.searchText = '';
    this.filterChangedCallback = null;
    this.api = null;
    this.column = null;
    this.colDef = null;
    this.gui = null;
  }

  // AG-Grid筛选器接口必需方法
  init(params) {
    this.filterChangedCallback = params.filterChangedCallback;
    this.api = params.api;
    this.column = params.column;
    this.colDef = params.colDef;
    
    this.initOptions();
    this.createGui();
  }

  // 初始化选项
  initOptions() {
    const colId = this.column.getColId();
    const allData = [];
    
    // 获取当前表格中的所有数据
    this.api.forEachNodeAfterFilterAndSort((node) => {
      if (node.data) {
        allData.push(node.data[colId]);
      }
    });
    
    console.log(`MultiCustomFilter for column ${colId}, total data rows:`, allData.length);
    
    const valueCounts = new Map();
    
    // 统计每个值的出现次数
    allData.forEach(value => {
      const count = valueCounts.get(value) || 0;
      valueCounts.set(value, count + 1);
    });
    
    // 转换为选项格式
    this.allOptions = Array.from(valueCounts.entries())
      .map(([value, count]) => ({
        value,
        label: String(value),
        count
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    
    // 默认全选
    this.selectedValues = this.allOptions.map(option => option.value);
    
    console.log(`Generated options for ${colId}:`, this.allOptions);
  }

  // 创建GUI
  createGui() {
    this.gui = document.createElement('div');
    this.gui.className = 'multi-custom-filter';
    this.gui.innerHTML = `
      <div class="filter-header">
        <div class="filter-title">筛选条件</div>
        <div class="filter-actions">
          <button class="btn-select-all">全选</button>
          <button class="btn-clear-all">清空</button>
        </div>
      </div>
      <div class="filter-content">
        <div class="filter-search">
          <input type="text" class="search-input" placeholder="搜索..." />
        </div>
        <div class="filter-list">
          ${this.allOptions.map(option => `
            <div class="filter-option">
              <label>
                <input type="checkbox" value="${option.value}" ${this.selectedValues.includes(option.value) ? 'checked' : ''} />
                <span class="option-text">${option.label}</span>
                <span class="option-count">(${option.count})</span>
              </label>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="filter-footer">
        <button class="btn-apply">应用</button>
        <button class="btn-reset">重置</button>
      </div>
    `;

    // 添加样式
    this.addStyles();
    
    // 绑定事件
    this.bindEvents();
  }

  // 添加样式
  addStyles() {
    if (!document.getElementById('multi-custom-filter-styles')) {
      const style = document.createElement('style');
      style.id = 'multi-custom-filter-styles';
      style.textContent = `
        .multi-custom-filter {
          width: 250px;
          padding: 12px;
          background: white;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          font-family: Arial, sans-serif;
        }
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #ebeef5;
        }
        .filter-title {
          font-weight: 500;
          color: #303133;
        }
        .filter-actions {
          display: flex;
          gap: 4px;
        }
        .filter-actions button {
          padding: 2px 8px;
          font-size: 12px;
          border: 1px solid #dcdfe6;
          border-radius: 3px;
          background: #fff;
          cursor: pointer;
        }
        .filter-actions button:hover {
          background: #f5f7fa;
        }
        .filter-search {
          margin-bottom: 12px;
        }
        .search-input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          font-size: 12px;
        }
        .filter-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ebeef5;
          border-radius: 4px;
          padding: 8px;
        }
        .filter-option {
          padding: 4px 0;
          border-bottom: 1px solid #f5f7fa;
        }
        .filter-option:last-child {
          border-bottom: none;
        }
        .filter-option label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-size: 12px;
        }
        .option-text {
          margin-right: 4px;
        }
        .option-count {
          color: #909399;
          font-size: 11px;
        }
        .filter-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #ebeef5;
        }
        .filter-footer button {
          padding: 4px 12px;
          font-size: 12px;
          border: 1px solid #dcdfe6;
          border-radius: 3px;
          background: #fff;
          cursor: pointer;
        }
        .btn-apply {
          background: #409eff !important;
          color: white;
          border-color: #409eff !important;
        }
        .btn-apply:hover {
          background: #337ecc !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 绑定事件
  bindEvents() {
    // 全选按钮
    this.gui.querySelector('.btn-select-all').addEventListener('click', () => {
      this.selectedValues = this.allOptions.map(option => option.value);
      this.updateCheckboxes();
    });

    // 清空按钮
    this.gui.querySelector('.btn-clear-all').addEventListener('click', () => {
      this.selectedValues = [];
      this.updateCheckboxes();
    });

    // 搜索输入
    this.gui.querySelector('.search-input').addEventListener('input', (e) => {
      this.searchText = e.target.value;
      this.filterOptions();
    });

    // 复选框变化
    this.gui.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const value = e.target.value;
        if (e.target.checked) {
          if (!this.selectedValues.includes(value)) {
            this.selectedValues.push(value);
          }
        } else {
          this.selectedValues = this.selectedValues.filter(v => v !== value);
        }
      });
    });

    // 应用按钮
    this.gui.querySelector('.btn-apply').addEventListener('click', () => {
      this.filterChangedCallback();
    });

    // 重置按钮
    this.gui.querySelector('.btn-reset').addEventListener('click', () => {
      this.selectedValues = this.allOptions.map(option => option.value);
      this.updateCheckboxes();
      this.filterChangedCallback();
    });
  }

  // 更新复选框状态
  updateCheckboxes() {
    this.gui.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = this.selectedValues.includes(checkbox.value);
    });
  }

  // 过滤选项
  filterOptions() {
    const options = this.gui.querySelectorAll('.filter-option');
    options.forEach(option => {
      const text = option.querySelector('.option-text').textContent.toLowerCase();
      const visible = !this.searchText || text.includes(this.searchText.toLowerCase());
      option.style.display = visible ? 'block' : 'none';
    });
  }

  // AG-Grid筛选器接口方法
  isFilterActive() {
    return this.selectedValues.length !== this.allOptions.length;
  }

  getModel() {
    if (!this.isFilterActive()) {
      return null;
    }
    return {
      filterType: 'multiCustom',
      values: this.selectedValues
    };
  }

  setModel(model) {
    if (model && model.values) {
      this.selectedValues = model.values;
    } else {
      this.selectedValues = this.allOptions.map(option => option.value);
    }
    this.updateCheckboxes();
  }

  doesFilterPass(params) {
    const value = params.data[this.column.getColId()];
    return this.selectedValues.includes(value);
  }

  getGui() {
    return this.gui;
  }

  afterGuiAttached() {
    console.log('MultiCustomFilter GUI attached');
  }

  afterGuiDetached() {
    console.log('MultiCustomFilter GUI detached');
  }

  destroy() {
    console.log('MultiCustomFilter destroyed');
  }
}

export default MultiCustomFilter;
