const vscode = require('vscode');
const api = require('./translate-api')


/**
 * 
 * @param {*} str 判断是否包含中文
 * @returns 
 */
function containChinese(str){
  if(/.*[\u4e00-\u9fa5]+.*$/.test(str)) {
    return true;
  } 
  return false;

}

async function commonTranslate(currentSelect) {

    let selectWord

    const data = await api.translate(currentSelect, 'zh', 'en')

    if(data.data.error_code) {
      handlingExceptions(data.data.error_code)
      return
    }
    
    const result = data.data.trans_result[0].dst
    // 基于空格分割
    const list = result.split(' ')
    if (list.length > 1) {
      const arr = []
      // 小驼峰
      arr.push(list.map((v, i) => {
        if (i !== 0) {
          return v.charAt(0).toLocaleUpperCase() + v.slice(1)
        }
        return v.toLocaleLowerCase()
      }).join(''))
      // 空格
      arr.push(list.map((v, i) => {
          if (i === 0) {
              return v.charAt(0).toLocaleUpperCase() + v.slice(1).toLocaleLowerCase()
          }
          return v.toLocaleLowerCase()
      }).join(' '))
      // - 号连接
      arr.push(list.map(v => v.toLocaleLowerCase()).join('-'))
      // 下划线连接
      arr.push(list.map(v => v.toLocaleLowerCase()).join('_'))
      // 大驼峰
      arr.push(list.map(v => v.charAt(0).toLocaleUpperCase() + v.slice(1)).join(''))
      selectWord = await vscode.window.showQuickPick(arr, { placeHolder: '请选择要替换的变量名' })
    } else {
      selectWord = list[0]
    }

    return selectWord
}

async function handleObjTranslate(currentSelect) {
    let selectWord

    if (currentSelect.indexOf(':') === -1) return;

    const data = await api.translate(currentSelect, 'zh', 'en')

    if(data.data.error_code) {
      handlingExceptions(data.data.error_code)
      return
    }
    
    const result = data.data.trans_result[0].dst
    // 基于空格分割
    const list = result.split(' ')
    if (list.length > 1) {
      const arr = []
      // 小驼峰
      arr.push(list.map((v, i) => {
        if (i !== 0) {
          return v.charAt(0).toLocaleUpperCase() + v.slice(1)
        }
        return v.toLocaleLowerCase()
      }).join(''))
      // 空格
      arr.push(list.map((v, i) => {
          if (i === 0) {
              return v.charAt(0).toLocaleUpperCase() + v.slice(1).toLocaleLowerCase()
          }
          return v.toLocaleLowerCase()
      }).join(' '))
      // - 号连接
      arr.push(list.map(v => v.toLocaleLowerCase()).join('-'))
      // 下划线连接
      arr.push(list.map(v => v.toLocaleLowerCase()).join('_'))
      // 大驼峰
      arr.push(list.map(v => v.charAt(0).toLocaleUpperCase() + v.slice(1)).join(''))
      selectWord = await vscode.window.showQuickPick(arr, { placeHolder: '请选择要替换的变量名' })
    } else {
      selectWord = list[0]
    }

    return selectWord
}

async function handleTranslate(currentSelect, isObj = false) {
    if (isObj) {
        // 对象
        return await handleObjTranslate(currentSelect)
    } else {
        // 普通
        return await commonTranslate(currentSelect)
    }
    
}

/**
 * 处理异常
 */
 function handlingExceptions(code) {
    const codes = {
      "52001": "请求超时,检查网络后重试" ,
      "52002": "系统错误, 查看百度翻译官网公告",
      "52003": "请检查appid或者服务是否开通",
      "54000": "必填参数为空",
      "54001": " 签名错误",
      "54003": "访问频率受限",
      "54004": "账户余额不足 ",
      "54005": "长query请求频繁, 请降低长query的发送频率，3s后再试 ",
      "58000": "客户端IP非法",
      "58001": "语言不支持",
      "58002": "服务当前已关闭, 请前往管理控制台开启服务",
      "90107": "认证未通过或未生效",
    }
    vscode.window.showWarningMessage("translateNamed: " + codes[code] || "未知异常, 可评论反馈")
  }

  const disposable = vscode.commands.registerCommand('translate.zntoen', async function () {
    /**
     * @type {string} 选择的单词
     */
    let selectWord
    const currentEditor = vscode.window.activeTextEditor
    if (!currentEditor) return
    const currentSelect = currentEditor.document.getText(currentEditor.selection)
    if (!currentSelect) return

    console.log(currentSelect, "currentSelect")
    
    // if (/^([\'\"]?)\w+(\1)\s*\:\s*([\'\"]?)\w+(\2)$/.test(currentSelect)) {
    //     // 匹配对象
    //     selectWord = await handleTranslate(currentSelect, true)
    // } else {
    //     // 匹配单一字符串
    //     selectWord = await handleTranslate(currentSelect)
    // }

    // 匹配单一字符串
    selectWord = await handleTranslate(currentSelect)

    if (selectWord) {
      currentEditor.edit(editBuilder => {
        editBuilder.replace(currentEditor.selection, selectWord)
      })
    }
  })

module.exports = {
  disposable
}