function limitNameLength(name){
    if (name.length>15){
        return name.substring(0,12)+'...'
    }
    else {
        return name
    }
}

export default limitNameLength