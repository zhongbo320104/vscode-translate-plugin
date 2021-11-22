const fileData = `
import file1change from '../file1/inner/zh'
import file2change from './file2/zh'
import language from './file3/file3.json'
import { 
    file41,
    file42
} from "./file4/index"

import { 
    file51,
    file52
} from "./file5/index"

export default {
    fileMap: file1change,
    file1change,
    file2change,
    ...language
}
`



const projectPath = "/Users/boozoo/Documents/vscode/vscode-translate-plugin/test/language"

// 获取所有path 可能含有后缀 可能没有
// let paths = fileData.match(/\s*import\s+(.+)\s+from\s+(['"])(\.{1,2}\/)?(\w+\/)+\w+(\.\w+)?\1/g) || []

let paths = fileData.match(/\s*import\s+\{?\s*(\w+\s*\,\s*)*\w+\s*\}?\s+from\s+(['"])(\.{1,2}\/)?(\w+\/)+\w+(\.\w+)?/g)  

function conbinePath(path) {
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

function handlePaths(ppaths) {
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
        ppath = conbinePath(ppath)

        // 引入的名称
        return {
            // 文件路径
            pPath: ppath,
            // 导入的名称
            importName,
            // 匹配实际的名称
        }
    })

    // 构造引入的字符串
    let requirePath = ""
    ppaths.map(p => {
        requirePath += `
            const ${/\,/g.test(p.importName) ? '{ ' + p.importName + ' }' : p.importName } = require(${p.pPath})`
    })
    // console.log(requirePath)

    // 构造导出的字符串 export default 不能直接替换 因为可能有印射关系
    let exportStr = fileData.match(/\s*export\s+default\s+\{(\s+(.+\s+)+)\}/)[1]
    exportStr = exportStr.replace(/^\s/, '')
    console.log(exportStr)
}

// handlePaths(paths)



let s1 = `
fileMap: file1change,
  file1change,
  file2change,
  file41Change: file41,
  file42Change: file42,
  ...language
`

s1 = s1.replace(/\s/g, "")

if (/\,/g.test(s1)) {
    // 多条
    const getObj = s1.split(',').map(el => {
        if (/\:/g.test(el)) {
            // a : b
            return {
                key: el.split(':')[0],
                value: el.split(':')[1],
            }
        } else if (/^\.\.\./g.test(el)) {
            // ...language
            return {
                key: null,
                value: el.slice(3)
            }
        } else {
            return {
                key: el,
                value: el
            }
        }
    })

    // console.log(getObj)
}

// console.log(s1)
