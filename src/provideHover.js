const vscode = require('vscode');
const { getProjectPath } = require('./utils')
const hf = require('./handleFiles')

let filelanguageDatas


const reReadFiles = function (doc) {
	const projectPath = getProjectPath(doc);
	console.log(projectPath)
	// 获取项目配置文件
	const jsonConfig = require(`${projectPath}/package.json`);
	if (jsonConfig["language-config"]) {
		// 存在配置
		const {
			ppaths,
			exportObj
		} = hf.handlePaths({
			// 输入入口， 这个地方是一个汇总的入口文件
			input: jsonConfig["language-config"]["zh-input"],
		}, projectPath)
		let reBuildExportObj = []
		let checks = exportObj.every(item => item.key)
		let datas = hf.getFileData(ppaths)
		if (!checks) {
			// 说明有...
			exportObj.forEach(item => {
				if (item.key) {
					reBuildExportObj.push(item)
				} else {
					datas.filter(dot => {
						for (const key in dot) {
							if (key === item.value) {
								reBuildExportObj.push(dot[key])
							}
						}
					})
				}
			})
		}
		// 读取数据
		filelanguageDatas = {
			data: datas,
			exportObj: reBuildExportObj.length === 0 ? exportObj : reBuildExportObj
		}
		return filelanguageDatas
	} else {
		// 抛出错误
	}
}

/**
 * 鼠标悬停提示，当鼠标停在package.json的dependencies或者devDependencies时，
 * 自动显示对应包的名称、版本号和许可协议
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideHover(document, position, token) {
	const line		= document.lineAt(position);
	// const projectPath = getProjectPath(document);
	const lineText = line.text
	// console.log(lineText)

	const { data, exportObj } = reReadFiles(document)
    const reg = /\$t\(([\'\"])(.+)\1\)/
    if (reg.test(lineText)) {
        let m = lineText.match(reg) && lineText.match(reg)[2]
		if (m) {
			if (/\./.test(m)) {
				let hArr = m.split('.')
				let finalDes = ""
				exportObj.forEach(item => {
					if (item.key) {
						// 有映射
						if (item.key === hArr[0]) {
							data.filter(df => {
								for (const kdf in df) {
									if (kdf === item.value) {
										finalDes = getDes(hArr.slice(1), df[kdf])
										console.log(finalDes, '===')
									}
								}
							})
						}
					} else {
						for (const kk in item) {
							if (kk === hArr[0]) {
								// json
								finalDes = getDes(hArr.slice(1), item)
							}
						}
					}
				})
				
				function getDes(hArr, obj) {
					let cArr = JSON.parse(JSON.stringify(hArr))
					let s = ""
					while (cArr.length > 0) {
						s = obj[cArr.shift()]
					}
					return s
				}

				return new vscode.Hover(`* **中文名为**：${finalDes || '未找到'}`);
			}
		}
    }
}

module.exports = function(context) {


	// 注册鼠标悬停提示

	const TYPES = [
		'javascript',
		'typescript',
        'html',
        'vue'
    ];

	// 遍历注册插件需要执行的文本类型
    TYPES.forEach(item => {
        let providerDisposable = vscode.languages.registerHoverProvider(
            {
                scheme: 'file',
                language: item
            },
            {
				provideHover
			}
        );
        context.subscriptions.push(providerDisposable); // 完成订阅
    });
	// context.subscriptions.push(vscode.languages.registerHoverProvider('javascript', {
	// 	provideHover
	// }));
};
