function limitLength(name) {
    let res = ''
    let nameTemp = name.split('.').shift()
    if (nameTemp.length >= 8) {
        let file_name = name.split('.').shift()
        let ext_name = name.split('.').pop()
        res = file_name.substring(0, 4) + '...' + file_name.substring(file_name.length - 2, file_name.length) + '.' + ext_name;
    } else {
        res=name
    }
    return res
}

export default limitLength