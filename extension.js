const vscode = require('vscode');
const { getProjectPath } = require('./src/utils')
const provideHover = require('./src/provideHover')
const fuzzyMatch = require('./src/fuzzyMatch')
const disposable = require('./src/translate')
const { reReadFiles } = require('./src/reReadFile')

let  cacheDoc, currentHandleData


// function explainPaths(projectPath) {
// 	// 判断有没有import 如果没有 则认为是单文件直接导出语言包配置反之是多文件
// 	let fileData = fs.readFileSync(`${projectPath}/${pt}`, 'utf-8')

// 	if (/^\s*import\s+/.test(fileData)) {
// 		// 多文件
// 		// 1、多文件路径只能用相对路径
// 		const css = fileData.match(/\s*import\s+from\s+(['"])(.{1,2}\/)?(\w+\/)+\1/g).map(cs => {
// 			// 取出变量
// 			return cs.match(/export\sconst\s+(\w+)\s*/)[1]
// 		})
// 	}

// }
 
// const reReadFiles = function (doc) {
// 	// hf()
// 	console.log('重新扫描')
// 	const projectPath = getProjectPath(doc);
// 	// 获取项目配置文件
// 	const jsonConfig = require(`${projectPath}/package.json`);
// 	if (jsonConfig["language-config"]) {
// 		// 存在配置
// 		const {
// 			ppaths,
// 			requirePath,
// 			exportStr,
// 			exportObj
// 		} = hf.handlePaths({
// 			// 输入入口， 这个地方是一个汇总的入口文件
// 			input: jsonConfig["language-config"]["zh-input"],
// 		}, projectPath)

// 		console.log('===')

// 		let reBuildExportObj = []

// 		let checks = exportObj.every(item => item.key)

// 		let datas = hf.getFileData(ppaths)


// 		if (!checks) {
// 			// 说明有...
// 			exportObj.forEach(item => {
// 				if (item.key) {
// 					reBuildExportObj.push(item)
// 				} else {
// 					datas.filter(dot => {
// 						for (const key in dot) {
// 							if (key === item.value) {
// 								reBuildExportObj.push(dot[key])
// 							}
// 						}
// 					})
// 				}
// 			})
// 		}

// 		// 读取数据
// 		filelanguageDatas = {
// 			data: datas,
// 			exportObj: reBuildExportObj.length === 0 ? exportObj : reBuildExportObj
// 		}

// 		return filelanguageDatas
		
// 	} else {
// 		// 抛出错误
// 	}
// }

/**
 * @param {vscode.ExtensionContext} context
 */

 function provideCompletionItemsDot(document, position) {
	const line = document.lineAt(position);
	cacheDoc = document

	// 只截取到光标位置为止，防止一些特殊情况
	const lineText = line.text

	let {
		data,
		exportObj
	} = global.filelanguageDatas || reReadFiles(document)

	// 整理对象树
	let o = {}
	exportObj.map(io => {
		if (io.key) {
			o[io.key] = io.value
		} else {
			o = {...o, ...io}
		}
	})

	if (/\$t\(\'\w+\./g.test(lineText)) {
		// 匹配二级对象
		let mtData = lineText.match(/\$t\(\'(\w+)\./)
		if (!mtData) return
		mtData = mtData[1]

		// mtData 可能是一个衍射的字段
		let hasMapFlag = false		
		data.forEach(mp => {
			for (const kmp in mp) {
				if (o[mtData] === kmp) {
					// 找到衍射的值
					hasMapFlag = true
					// 缓存对象树，从第一级开始匹配，有利于性能优化
					currentHandleData = {
						[mtData]: mp[kmp]
					}
				}
			}
		})

		if (!hasMapFlag) {
			currentHandleData = {
				[mtData]: o[mtData]
			}
		}

		if (typeof currentHandleData[mtData] === "string") {
			// 最后一级，截止处理
			return [new vscode.CompletionItem(`${mtData}(${o[mtData]})`, vscode.CompletionItemKind.Field)]
		} else {
			// 还有数据  国际化不会再出现嵌套层  从编写规范来说  就不再往后进行递归支持了
			return Object.keys(currentHandleData[mtData]).map(element => {
				return {
					label: element,
					kind: vscode.CompletionItemKind.Text,
					detail: currentHandleData[mtData][element],
					// additionalTextEdits: [new vscode.TextEdit(new vscode.Range(2, 4), '插入数据')]
				}
			})
		
		}
	} 
}

function provideCompletionItemsT(document, position) {
	const line = document.lineAt(position);
	cacheDoc = document

	// 只截取到光标位置为止，防止一些特殊情况
	const lineText = line.text


	let {
		data,
		exportObj
	} = global.filelanguageDatas || reReadFiles(document)

	console.log('--00--')
	
	// 整理对象树
	let o = {}
	exportObj.map(io => {
		if (io.key) {
			o[io.key] = io.value
		} else {
			o = {...o, ...io}
		}
	})

	if (/\$t/g.test(lineText)) { 
		let commadStr = []
		exportObj.forEach(item => {
			if (item.key) {
			  commadStr.push(item.key)
			} else {
			  for (const k in item) {
				commadStr.push(k)
			  }
			}
		})

		return commadStr.map(ei => {
			return new vscode.CompletionItem(`t('${ei}')`, vscode.CompletionItemKind.Field)
		})
	}
}

// 拦截数据
function resolveCompletionItem() {
	return null
}

function activate(context) {

	const reRead = vscode.commands.registerCommand('read.file', async function () {
		reReadFiles(cacheDoc)
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
				provideCompletionItems: provideCompletionItemsT,
				resolveCompletionItem
			}, 
			't'
        );
        context.subscriptions.push(providerDisposable); // 完成订阅

		let providerDisposable2 = vscode.languages.registerCompletionItemProvider(
            {
                scheme: 'file',
                language: item
            },
            {
				provideCompletionItems: provideCompletionItemsDot,
				resolveCompletionItem
			}, 
			'.'
        );
        context.subscriptions.push(providerDisposable2); // 完成订阅
    });

	// 注册鼠标悬停提示
	provideHover(context) 

	// 注册匹配国际字符串
	fuzzyMatch(context)
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
