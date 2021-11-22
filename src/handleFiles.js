



// 获取所有path 可能含有后缀 可能没有
// let paths = fileData.match(/\s*import\s+(.+)\s+from\s+(['"])(\.{1,2}\/)?(\w+\/)+\w+(\.\w+)?\1/g) || []
const fs = require('fs')
const { removeExplain } = require('./utils')

function conbinePath(path, projectPath) {
    let clonePath = projectPath
    if (!/\//g.test(path)) {
        return
    }
    let splitDivide = path.split('/')   // ['.', 'file1', 'inner', 'zh']
    for (var i = 0; i < splitDivide.length; i++) {
        if (splitDivide[i] === "..") {
            let i = clonePath.match(/\/\w+$/)['index']
            clonePath = clonePath.slice(0, i)
        } else if (splitDivide[i] === ".") {
            clonePath = clonePath
        } else {
            clonePath += `/${splitDivide[i]}`
        }
    }
    return clonePath
}

function translateObj(s1) {
    s1 = s1.replace(/\s/g, "")
    function handleTr(da) {
        if (/\:/g.test(da)) {
            // a : b
            return {
                key: da.split(':')[0],
                value: da.split(':')[1],
            }
        } else if (/^\.\.\./g.test(da)) {
            // ...language
            return {
                key: null,
                value: da.slice(3)
            }
        } else {
            return {
                key: da,
                value: da
            }
        }
    }
    if (/\,/g.test(s1)) {
        // 多条
        const getObj = s1.split(',').map(el => {
            return handleTr(el)
        })
        return getObj
    } else {
        return [handleTr(s1)]
    }
}

function getExportObj(fileData) {
    let exportStr = fileData.match(/\s*export\s+default\s+\{(\s+(.+\s+)+)\}/)[1]
        exportStr = exportStr.replace(/^\s/, '')
        return translateObj(exportStr)
}

function handlePaths(inputPath, projectPath) {
    let inputIndex = inputPath.match(/\/\w+\.\w+$/).index
    const inputPathCombine = `${projectPath}/${inputPath.slice(0, inputIndex)}`
	// 获取入口文件数据
	let fileData = fs.readFileSync(`${projectPath}/${inputPath}`, 'utf-8')

    fileData = removeExplain(fileData)

    let ppaths = fileData.match(/\s*import\s+\{?\s*(\w+\s*\,\s*)*\w+\s*\}?\s+from\s+(['"])(\.{1,2}\/)?(\w+\/)+\w+(\.\w+)?/g)  
    if (!ppaths) {
        // 没有import 进来的
        // 找到导出的对象
        // 构造导出的字符串 export default 不能直接替换 因为可能有印射关系
        const exportObj = getExportObj(fileData)
        console.log(`${projectPath}/${inputPath}`)
        return {
            ppaths: [
                {
                    pPath: [`${projectPath}/${inputPath}`],
                }
            ],
            // 映射对象
            exportObj
        }
    }
    // 构造导出的字符串 export default 不能直接替换 因为可能有印射关系
    const exportObj = getExportObj(fileData)

    ppaths = ppaths.map(f => {
        // 移除掉回车
        f = f.replace(/^\s/, '')
        // 截取路径 建立对象 与 路径的衍射关系
        // 引入的路径
        let ppath = f.match(/\s*import\s+\{?\s*(\w+\s*\,\s*)*\w+\s*\}?\s+from\s+(['"])(.+)/)[3]
        let importName = f.match(/\s*import\s+\{?\s*((\w+\s*\,\s*)*\w+)\s*\}?\s+from/)[1]
        importName = importName.replace(/\s+/, '')

        // 判断是否有后缀
        let projectType = "js"

        // 添加后缀
        if (/\/\w+$/g.test(ppath)) {
            ppath = projectType === 'js' ? `${ppath}.js` : `${ppath}.ts`
        }
        // 合并路径
        ppath = conbinePath(ppath, inputPathCombine)

        let mapName = importName
        exportObj.map(m => {
            if (m.value === importName) {
                // 有衍射关系  开发者调用时会通过 m.key 去取 原mapName 对象的值
                mapName = m.key
            }
        })

        // console.log(exportObj)

        // 引入的名称
        return {
            // 文件路径
            pPath: ppath,
            // 导入的名称
            importName,
            // 匹配实际的名称
            mapName
        }
    })

    // 构造引入的字符串
    let requirePath = ""
    ppaths.map(p => {
        requirePath += `
            const ${/\,/g.test(p.importName) ? '{ ' + p.importName + ' }' : p.importName } = require(${p.pPath})`
    })


    return {
        ppaths,
        requirePath,
        // 印社对象
        exportObj
    }
}

function clonePage({ pPath,importName = "" }) {
    // console.log(pPath)
    let fileData = fs.readFileSync(`${pPath}`, 'utf-8')
    fileData = removeExplain(fileData)
    if (/export\sdefault/g.test(fileData) && /export\sconst/.test(fileData)) {
        // fileData = fileData.replace(/export\sconst/g, 'const')
        // fileData = fileData.replace(/export\sdefault\s*\{/g, `return {
        //     `)
    } else if (/export\sdefault/g.test(fileData)) {
        fileData = fileData.replace(/export\sdefault/g, 'return')
    } else if (/export\sconst/.test(fileData)) {
        const css = fileData.match(/export\sconst\s+(\w+)\s*/g).map(cs => {
            // 取出变量
            return cs.match(/export\sconst\s+(\w+)\s*/)[1]
        })
        fileData = fileData.replace(/export\sconst/g, 'const')
        fileData = fileData + `
            return {
                ${css.toString()}
            }
        `
    } else {
        fileData = 'return ' + fileData
        // 认为是json文件
    }
    const evalData = new Function(`${fileData}`)()
    if ( evalData && !/\,/g.test(importName) && importName) {
        return {
            [importName]: evalData
        }
    } else {
        // 多个 export const 出来的
        return evalData
    }
}

/**
 * 拿到所有页面数据
 * @param {*} pp 来源路径
 */
function getFileData(pp) {
    // 所有依赖的页面path
    let ar = []
    for (let i = 0; i < pp.length; i++) {
        ar.push(clonePage(pp[i]))
    }
    return ar
}

module.exports = {
    getFileData,
    handlePaths: ({input}, projectPath) => handlePaths(input, projectPath)
}
