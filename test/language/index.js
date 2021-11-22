import file1change from './file1/inner/zh'
import file2change from './file2/zh'
import file3change from './file3/file3.json'
import file4change from './file4/index'

export default {
    ...file4change,
    file1change,
    file2change,
    file3change
}