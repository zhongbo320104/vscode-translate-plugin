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


const hp = require('./handleFiles')

hp.handlePaths(fileData, projectPath)


