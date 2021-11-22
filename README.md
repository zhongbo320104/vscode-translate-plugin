# vscode-translate-plugin
vscode 插件

# traslate README

1、用于国际化翻译、支持国际化已有翻译自动补全
2、支持翻译中英文hover提示
3、支持通过菜单栏、快捷键快速翻译（中 -> 英）快捷键 command/ctrl + shift + p
4、支持模版语法，在输入$t时快速补全
5、支持通过中文模糊查找已有翻译

## Requirements

1、目录结构要求
- 支持多语言文件类型 js、ts、json
- 支持es6方式

### 示例
```
a.js
const a = {
    xxx: '',
}
export default {
    a
}

b.js
const b = {
    xxx: '',
}
export default {
    b
}

c.json

{
    xxx: ''
}

d.js

export const d1 = {
    xxx: ''
}

export const d2 = {
    xxx: ''
}

index.js // 入口文件

import a from './a'
import b from './b'
import c from './c'
import { d1, d2 } from './d'

export {
    a,
    b,
    c,
    d1,
    d2
}


```
2、配置 
```js
    "language-config": {
        "zh-path": "src/language/zh.js",    // 中文入口相对更目录路径
        "en-path": "src/language/en.js",    // 英文入口相对更目录路径
    },
```


## Extension Settings

- 确保在vscode设置栏里有下列设置，可在字符串中进行代码补全

```js
    "security.workspace.trust.untrustedFiles": "open",
    "emmet.triggerExpansionOnTab": true,
    "emmet.showAbbreviationSuggestions": true,
    "emmet.showExpandedAbbreviation": "always",
    "emmet.includeLanguages": {
        "javascript": "html",
    }
```
**Enjoy!**
