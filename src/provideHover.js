const vscode = require('vscode');
const { getProjectPath } = require('./utils')

/**
 * 鼠标悬停提示，当鼠标停在package.json的dependencies或者devDependencies时，
 * 自动显示对应包的名称、版本号和许可协议
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideHover(document, position, token) {
	const line		= document.lineAt(position);
	const projectPath = getProjectPath(document);
	const lineText = line.text
	const languageJson = require(`${projectPath}/src/language/zh.js`);
	const languageJsonEn = require(`${projectPath}/src/language/en.js`);

    const reg = /\$t\(([\'\"])(\w+)\.(\w+)\.(\w+)(\1)\)/
    if (reg.test(lineText)) {
        let m = lineText.match(reg)
        const [...data] = [m[2], m[3], m[4]]
        // 截取中文
        let md = languageJson[data[0]]
        let mdKey = md[data[1]]
        let mdKeyValue = mdKey[data[2]]

        // 截取英文
        let mdEn = languageJsonEn[data[0]]
        let mdKeyEn = mdEn[data[1]]
        let mdKeyValueEn = mdKeyEn[data[2]]
        return new vscode.Hover(`* **中文名为**：${mdKeyValue}\n* **英文名为**：${mdKeyValueEn}`);
    }

	// if (/\/package\.json$/.test(fileName)) {
	// 	console.log('进入provideHover方法');
	// 	const json = document.getText();
	// 	if (new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
	// 		let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/package.json`;
	// 		if (fs.existsSync(destPath)) {
	// 			const content = require(destPath);
	// 			console.log('hover已生效');
	// 			// hover内容支持markdown语法
	// 			return new vscode.Hover(`* **名称**：${content.name}\n* **版本**：${content.version}\n* **许可协议**：${content.license}`);
	// 		}
	// 	}
	// }
}

module.exports = function(context) {


	// 注册鼠标悬停提示

	const TYPES = [
		'javascript',
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
