# vscode-translate-plugin
vscode 插件

# traslate README

1、用于国际化翻译、支持国际化已有翻译自动补全
2、支持翻译中英文hover提示
3、支持通过菜单栏、快捷键快速翻译（中 -> 英）快捷键 command/ctrl + shift + p
4、支持模版语法，在输入$t时 会自动提示代码 '(modules)'
4、主要应用于前端项目

## Requirements

1、目录结构要求  根目录/src/language/zh.js  根目录/src/language/en.js (后续迭代版本将会支持自定义路径、自动识别多语言对象)
2、多语言结构要求结构为 
```js
    const modules = {
        xxx1: {
            yyy1: ""
        },
        xxx2: {
            yyy2: ""
        },
    }
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

## Release Notes

1.0.1

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
