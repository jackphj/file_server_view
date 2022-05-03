function sortByName(files) {
    let dir = files.filter(file => file.dir === 1).sort()
    let file = files.filter(file => file.dir === 0).sort()
    let create = {name: '', dir: 2, size: 0}
    return dir.concat(file).concat(create)
}

export default sortByName