const fileData = `
import file1change from '../file1/inner/zh'
import file2change from './file2/zh'
import file3change from './file3/file3.json'
import { 
    file41,
    file42
} from "./file4/index"

import { 
    file51,
    file52
} from "./file5/index"

export default {
    ...file4change,
    file1change,
    file2change,
    file3change
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
        let ppath = f.match(/\s*import\s+\{?\s*(\w+\s*\,\s*)*\w+\s*\}?\s+from\s+(['"])(.+)\1/)[2]

        // (/\s*import\s+\{?\s*(\w+\s*\,\s*)*\w+\s*\}?\s+from\s+(['"])(\.{1,2}\/)?(\w+\/)+\w+(\.\w+)?/g)
    
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
            path: ppath,
        }
    })
    // console.log(ppaths)
}

handlePaths(paths)
