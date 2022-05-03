function userSort(user, userAdmin) {
    let user_1 = user.sort()
    let res = {admin: 0, user: []}
    for (let i = 0; i < user_1.length; i++) {
        user_1[i].admin = 0
        res.user[i] = user_1[i]
    }
    // if (userAdmin !== undefined) {
    //     let user_2 = userAdmin.sort()
    //     for (let i = user_1.length; i < user_1.length + user_2.length; i++) {
    //         user_2[i].admin = 1
    //         res.user[i] = user_2[i]
    //     }
    //     res.admin = 1
    //     return res
    // } else {
    //     res.admin = 0
    //     return res
    // }


    if (userAdmin !== undefined) {
        let user_2 = userAdmin.sort()
        res.admin = 1
        res.user = user_2.concat(user_1)
        return res
    } else {
        res.admin = 0
        res.user = user_1
        return res
    }

}

export default userSort