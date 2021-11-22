const o = {
    a: {
        b: {
            c: "abc",
            d: {
                t: '33',
                g: '44'
            }
        },
        e: {
            f: 'aef',
            g: {
                s: "aegs"
            }
        }
    },
    m: 123,
    // n: "456"
}


// 一条路走完的前提是 返回的不是对象

let arr = [], needCheck = false
function deepData(val, lastObj = null) {
    if (typeof val !== "object" && val) {
        console.log(arr)
        // 查询到一个数据后需要回退， 深度优先遍历的特性
        arr.pop()
        needCheck = true
    } else {
        // console.log(val)
        for (const key in val) {
            const element = val[key];
            // 结果push key 的时候需要判断一下 这是否是一个合法的对象
            if (needCheck) checkIfValid(arr, key) 
            arr.push(key)
            deepData(element, val) 
        }
    }
}
function checkIfValid(arr, key) {
    needCheck = false
    let oData = JSON.parse(JSON.stringify(o))
    arr.forEach(d => {
        oData = oData[d]
    })
    if (!oData.hasOwnProperty(key) && arr.length > 0) {
        arr.pop()
        checkIfValid(arr, key)
    }
}
// deepData(o, null)

let str = `
// sfds
// fdsf fsd
/***
 
fsdf
fsdfa
fsdf
*/

let a  = 2
// fdsf fsd
/***
 
fsdf
fsdfa
fsdf
*/


`

let reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
let b = str.replace(reg, function(word) { 
      // 去除注释后的文本 
    return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
});
console.log(b)




