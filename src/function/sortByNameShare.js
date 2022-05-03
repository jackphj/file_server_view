function sortByNameShare(files) {
    let dir = files.filter(file => file.dir === 1).sort()
    let file = files.filter(file => file.dir === 0).sort()
    return dir.concat(file)
}

export default sortByNameShare