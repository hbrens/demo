// Monaco编辑器配置
import * as monaco from 'monaco-editor'

// 配置Monaco编辑器
export const configureMonaco = () => {
  // 设置Monaco编辑器环境
  monaco.languages.register({ id: 'yaml' })
  
  // 配置YAML语言特性
  monaco.languages.setLanguageConfiguration('yaml', {
    comments: {
      lineComment: '#'
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  })

  // 定义YAML语法高亮规则
  monaco.languages.setMonarchTokensProvider('yaml', {
    tokenizer: {
      root: [
        // 注释
        [/#.*$/, 'comment'],
        // 键值对
        [/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/, ['white', 'key']],
        // 字符串
        [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, 'string'],
        // 数字
        [/\d+\.?\d*/, 'number'],
        // 布尔值
        [/\b(true|false|null)\b/, 'keyword'],
        // 列表项
        [/^\s*-\s/, 'list'],
        // 缩进
        [/^\s+/, 'white']
      ]
    }
  })

  // 配置编辑器主题
  monaco.editor.defineTheme('yaml-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'key', foreground: '9CDCFE' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'list', foreground: 'DCDCAA' }
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#c6c6c6',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41'
    }
  })

  // 配置编辑器选项
  return {
    language: 'yaml',
    theme: 'yaml-dark',
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    bracketPairColorization: { enabled: true },
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: 'selection',
    renderControlCharacters: true,
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 14,
    lineHeight: 1.5,
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: true,
    smoothScrolling: true,
    mouseWheelZoom: true,
    contextmenu: true,
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
      useShadows: false,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12
    }
  }
}

// 创建编辑器实例的辅助函数
export const createYamlEditor = (container, options = {}) => {
  const defaultOptions = configureMonaco()
  const editorOptions = { ...defaultOptions, ...options }
  
  return monaco.editor.create(container, editorOptions)
}

// 销毁编辑器实例的辅助函数
export const disposeEditor = (editor) => {
  if (editor) {
    editor.dispose()
  }
}

// 获取编辑器内容的辅助函数
export const getEditorValue = (editor) => {
  return editor ? editor.getValue() : ''
}

// 设置编辑器内容的辅助函数
export const setEditorValue = (editor, value) => {
  if (editor) {
    editor.setValue(value)
  }
}

// 监听编辑器内容变化的辅助函数
export const onEditorContentChange = (editor, callback) => {
  if (editor) {
    return editor.onDidChangeModelContent(callback)
  }
}

// 监听光标位置变化的辅助函数
export const onCursorPositionChange = (editor, callback) => {
  if (editor) {
    return editor.onDidChangeCursorPosition(callback)
  }
}
