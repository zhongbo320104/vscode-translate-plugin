const vscode = require('vscode');

const { reReadFiles } = require('./reReadFile')
 
const { handleBfs } = require('./utils')

const fuzzyMatch = vscode.commands.registerCommand('fuzzy.match', async function () {
    /**
     * @type {string} 选择的单词
     */
    let selectWord
    const currentEditor = vscode.window.activeTextEditor
    if (!currentEditor) return
    const currentSelect = currentEditor.document.getText(currentEditor.selection)
    if (!currentSelect) return

    // 获取页面数据 对象树
    const { dataTree } = reReadFiles()

    const bfsTree = handleBfs(dataTree)
    
    const mapArr = bfsTree.filter(item => {
        return item.label.indexOf(currentSelect) !== -1
    }).map(item => ({
        label: `this.$t('${item.lang}')`,
        description: item.label
    }))
    
    selectWord = await vscode.window.showQuickPick(mapArr, 
        { 
            picked: true,
            canPickMany: false,
            matchOnDescription: false,
            matchOnDetail: false
        }
    )

    if (selectWord) {
        currentEditor.edit(editBuilder => {
            editBuilder.replace(currentEditor.selection, selectWord.label)
        })
    }
})

module.exports = {
    fuzzyMatch
}