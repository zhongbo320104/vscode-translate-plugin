const vscode = require('vscode');
const { getProjectPath } = require('./src/utils')
const provideHover = require('./src/provideHover')
const disposable = require('./src/translate')

/**
 * @param {vscode.ExtensionContext} context
 */

 function provideCompletionItems(document, position) {
	const line		= document.lineAt(position);
	const projectPath = getProjectPath(document);

	// 只截取到光标位置为止，防止一些特殊情况
	const lineText = line.text
	// const lineText = line.text.substring(0, position.character);
	const languageJson = require(`${projectPath}/src/language/zh.js`);

	console.log(languageJson, '===')

	// 简单匹配，只要当前光标前的字符串为`this.dependencies.`都自动带出所有的依赖

	const moduleskey = Object.keys(languageJson.modules || {})

	let matchKey = moduleskey.filter(k => {
		if (lineText.indexOf(k) !== -1) {
			return true
		}
		return false
	})

	if (/\w*\.?\$t/g.test(lineText) && matchKey && matchKey.length > 0) {
		const matchInnerKey = languageJson.modules[matchKey[0]]
		return Object.keys(matchInnerKey).map(ik => {
			return new vscode.CompletionItem(`${ik}-${matchInnerKey[ik]}`, vscode.CompletionItemKind.Field);
		})
	}else if(/\w*\.?\$t/g.test(lineText)) {
		return moduleskey.map(k => {
			return new vscode.CompletionItem(`${k}`, vscode.CompletionItemKind.Field);
		})
	} 
}

function resolveCompletionItem(item) {
	if (item.label.indexOf('-') !== -1) [
		item.label = item.label.split('-')[0] 
	] 
	return item
}

function activate(context) {
	// 注册翻译 
	context.subscriptions.push(disposable)

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems,
		resolveCompletionItem
	}, '.'));

	// 注册鼠标悬停提示
	provideHover(context) 
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}