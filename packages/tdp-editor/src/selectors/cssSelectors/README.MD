## 如何开发css选择器

### cssSelector [css选择器]

#### 1. 创建vue组件
在当前目录下创建一个以 "Selector" 结尾的 vue 组件，例如: flexSelector, lineHeightSelector 等

#### 2. 开发selector组件逻辑
所有选择器的共有props有3个：state、cssStyleName、label

state: 为组件的所有原始状态
cssStyleName: 为当前用户选中的css属性
label: 属性设计面板中对应的属性名

#### 2. 在当前目录下 index.ts 中配置 selector
在当前index.ts中的<font color=green>cssSelectorMap</font>对象里，配置css属性对应的selector，例如：
```
// 对象的key为标准的css属性名，多个属性可公用一个selector
{
    flex: { selector: 'vue组件的name', label: '右侧配置面板显示的标题' },
    // 下面的三个属性公用一个颜色
    color: { selector: 'css-color-selector', label: '颜色' },
    backgroundColor: { selector: 'css-color-selector', label: '背景色' },
    borderColor: { selector: 'css-color-selector', label: '边框颜色' },
}
```

#### 3.完成上述开发后，css选择器即可生效