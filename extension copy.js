const vscode = require('vscode');
const { getProjectPath } = require('./src/utils')
const provideHover = require('./src/provideHover')
const disposable = require('./src/translate')
const hf = require('./src/handleFiles')
const fs = require('fs')

let filelanguageDatas, cacheDoc


function explainPaths(projectPath) {
	// 判断有没有import 如果没有 则认为是单文件直接导出语言包配置反之是多文件
	let fileData = fs.readFileSync(`${projectPath}/${pt}`, 'utf-8')

	if (/^\s*import\s+/.test(fileData)) {
		// 多文件
		// 1、多文件路径只能用相对路径
		const css = fileData.match(/\s*import\s+from\s+(['"])(.{1,2}\/)?(\w+\/)+\1/g).map(cs => {
			// 取出变量
			return cs.match(/export\sconst\s+(\w+)\s*/)[1]
		})
	}

}

function clonePage({input}, projectPath) {
	let pages = []

	pages = explainPaths(projectPath)

	const wholeData = []
	
	pages.forEach(pt => {
		// 获取文件名
		let fileInfo = pt.match(/\/(\w+)\.(\w+)$/)
		const fileName = fileInfo[1]
		const fileType = fileInfo[2]
		let fileData = fs.readFileSync(`${projectPath}/${pt}`, 'utf-8')
		if (fileType === "json") {
			// json 文件直接读取数据
			wholeData.push(fileData)
		} else {
			if (/^\s*import\s+/.test(fileData)) {
				console.log('抛出错误！解析不了了')
				return
			}
			// es6 读取数据 export default 或者 export const
			let hasExportDefault = false
			if (fileData.indexOf('export default') !== -1) {
				hasExportDefault = true
				fileData = fileData.replace(/export\sdefault/g, 'module.exports =')
			}

			if (fileData.indexOf('export const') !== -1) {
				// 取出const 变量的值
				const css = fileData.match(/export\sconst\s+(\w+)\s*/g).map(cs => {
					// 取出变量
					return cs.match(/export\sconst\s+(\w+)\s*/)[1]
				})
				
				if (hasExportDefault) {
					// 插入进去
					fileData = fileData.replace(/module\.exports\s*\=\s*\{/, `module.exports = {${css.toString()},`)
				} else {
					fileData = `
						${fileData}
						module.exports = {
							${css.toString()}
						}
					`
				}
				
				// 删除 export 
				fileData = fileData.replace(/export\sconst/g, 'const')
			}
			fs.writeFileSync(`${projectPath}/src/language/__tem__${fileName}.js`, fileData);
			fileData = require(`${projectPath}/src/language/c.json`);
			wholeData.push(fileData)
		}
	})

	return wholeData
}

function reReadFiles() {
	console.log('重新扫描')
	const projectPath = getProjectPath(cacheDoc);
	const jsonConfig = require(`${projectPath}/package.json`);
	let filelanguageDatas

	if (jsonConfig["language-config"]) {
		// 存在配置
		filelanguageDatas = clonePage({
			// 对应的中文输入集 传入参数为数组 多个模块导出的数据，非必填
			pages: jsonConfig["language-config"]["zh-path"],
			// 输入入口， 这个地方是一个汇总的入口文件
			input: jsonConfig["language-config"]["zh-input"]
		}, projectPath)
	} else {
		// 抛出错误
	}
	
	// var fileData = fs.readFileSync(`${projectPath}/${filePath.zh}`, 'utf-8');
	// if (fileData.indexOf('export default') !== -1) {
	// 	let fd = fileData.replace(/export\sdefault/g, 'module.exports =')
	// 	fs.writeFileSync(`${projectPath}/src/language/__tem__.js`, fd);
	// 	filelanguageDatas = require(`${projectPath}/src/language/c.json`);
	// 	// console.log(languageJson, "jsonConfig")
	// 	// console.log('---', languageJson.c1)
	// }
	return filelanguageDatas
}

/**
 * @param {vscode.ExtensionContext} context
 */

 function provideCompletionItems(document, position) {
	const line = document.lineAt(position);
	cacheDoc = document

	// 只截取到光标位置为止，防止一些特殊情况
	const lineText = line.text

	
	let languageJson = filelanguageDatas || reReadFiles()

	console.log(languageJson)

	if (/\$t/g.test(lineText)) { 
		return [
			new vscode.CompletionItem(`t('1111')`, vscode.CompletionItemKind.Field),
			new vscode.CompletionItem(`t('222')`, vscode.CompletionItemKind.Field),
			new vscode.CompletionItem(`t('333')`, vscode.CompletionItemKind.Field),
		];
	}
	

	

	// 简单匹配，只要当前光标前的字符串为`this.dependencies.`都自动带出所有的依赖

	// const moduleskey = Object.keys(languageJson[baseKey] || {})

	// let matchKey = moduleskey.filter(k => {
	// 	if (lineText.indexOf(k) !== -1) {
	// 		return true
	// 	}
	// 	return false
	// })

	// if (/\w*\.?\$t/g.test(lineText) && matchKey && matchKey.length > 0) {
	// 	const matchInnerKey = languageJson[baseKey][matchKey[0]]
	// 	return Object.keys(matchInnerKey).map(ik => {
	// 		return new vscode.CompletionItem(`${ik}-${matchInnerKey[ik]}`, vscode.CompletionItemKind.Field);
	// 	})
	// }else if(/\w*\.?\$t/g.test(lineText)) {
	// 	return moduleskey.map(k => {
	// 		return new vscode.CompletionItem(`${k}`, vscode.CompletionItemKind.Field);
	// 	})
	// } 
}

function resolveCompletionItem(item) {
	if (item.label.indexOf('-') !== -1) [
		item.label = item.label.split('-')[0] 
	] 
	return item
}

function activate(context) {

	const reRead = vscode.commands.registerCommand('read.file', async function () {
		reReadFiles()
	})

	// 注册重新扫描页面
	context.subscriptions.push(reRead)

	// 注册翻译 
	context.subscriptions.push(disposable)

	const TYPES = [
		'javascript',
        'html',
		'typescript',
        'vue'
    ];

	// 遍历注册插件需要执行的文本类型
    TYPES.forEach(item => {
        let providerDisposable = vscode.languages.registerCompletionItemProvider(
            {
                scheme: 'file',
                language: item
            },
            {
				provideCompletionItems,
				resolveCompletionItem
			}, 
			't'
        );
        context.subscriptions.push(providerDisposable); // 完成订阅
    });

	// context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['javascript', 'json', 'jsx', 'typescript'], {
	// 	provideCompletionItems,
	// 	resolveCompletionItem
	// }, '.'));

	// 注册鼠标悬停提示
	provideHover(context) 
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
