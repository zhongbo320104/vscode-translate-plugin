
const vscode = require('vscode');
const { getProjectPath } = require('./utils')
const hf = require('./handleFiles')

const reReadFiles = function (doc) {
  if (!doc) {
    doc = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
  }
  if (!doc) {
      throw new Error('当前激活的编辑器不是文件或者没有文件被打开！');
  }

	const projectPath = getProjectPath(doc);

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

   		 // 组装结构树
		const dataTree = {}
		exportObj.forEach(eo => {
		if (eo.key) {
			// 有映射
			let doValues = null
			datas.forEach(dTree => {
			for (const dok in dTree) {
				if (dok === eo.value) {
				doValues = dTree[dok]
				}
			}
			})
			dataTree[eo.key] = doValues
		} else {
			datas.forEach(dTree => {
			for (const dask in dTree) {
				if (dask === eo.value) {
				for (const dasInDask in dTree[dask]) {
					dataTree[dasInDask] = dTree[dask][dasInDask]
				}
				}
			}
			})
		}
		})

		// 读取数据
		let filelanguageDatas = {
			data: datas,
			exportObj: reBuildExportObj.length === 0 ? exportObj : reBuildExportObj,
      		dataTree
		}
		console.log(filelanguageDatas, "filelanguageDatas")
    	global.filelanguageDatas = filelanguageDatas
		return filelanguageDatas
	} else {
		// 抛出错误
	}
}

module.exports = {
  reReadFiles
}