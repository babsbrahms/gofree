import firebase from  './firebaseConfig';

// export const analytics = firebase.analytics();
// firebase.firestore().clearPersistence()
// AUTH
// [x]
export const forgotPassword = (emailAddress) => firebase.auth().sendPasswordResetEmail(emailAddress);

// []
export const changePassword = (email, oldPassword, newPassword, success, failure) => {
    return firebase.auth()
    .signInWithEmailAndPassword(email, oldPassword)
    .then((user) => {

        firebase.auth().currentUser.updatePassword(newPassword).then(() =>{
            success(user)
        }).catch((err) => {
            failure(err)
        });
    }).catch((err) => {
        failure(err)
    });
}

// [x]
export const signOut = () => firebase.auth().signOut()

// [x]
export const currentUser = () => firebase.auth().currentUser

// [x]
export const fetchFirebasUser = (id, success, error) => firebase.firestore().collection('users').doc(id).onSnapshot(querySnapshot => {
    success({ ...querySnapshot.data(), uid: querySnapshot.id })
}, (err) => { error (err) })

// [x]
export const emailSignUp = (email, password) => firebase.auth().createUserWithEmailAndPassword(email, password)

// [x]
export const sendVerificationEmail = () => firebase.auth().currentUser.sendEmailVerification()

// [x]
export const createProfileName = (userId, surname, given, email) => {
    return Promise.all([
        firebase.auth().currentUser.updateProfile({
            displayName: `${surname} ${given}`
        }),
        firebase.firestore().collection('users').doc(userId).set({
            email, surname, given, uid: userId, createdAt: serverTimestamp(), name: `${surname} ${given}`, photoUrl: ""
        }),
    ])
}
// [x]
export const updateName= (userId, surname, given) => {
    return Promise.all([
        firebase.auth().currentUser.updateProfile({
            displayName: `${surname} ${given}`
        }),
        firebase.firestore().collection('users').doc(userId).update({
            surname, given, name: `${surname} ${given}`
        })    
    ])
}

// [x] 
export const updatePhotoUrl =(file, userId) => {
    return  uploadFile('users', userId, file, { 
        customMetadata: {
            userId: userId,
            name: file.name,
            size: file.size,
            type: file.type
        }               
    }).then(res => { 
        firebase.auth().currentUser.updateProfile({
            photoURL: res.url
        })
    })

}

// [x]
export const emailSignIn = (email, password) => firebase.auth().signInWithEmailAndPassword(email, password)

// []
export const googleAuth = () => {
    var provider = new firebase.auth.GoogleAuthProvider();

    if (typeof window.orientation !== 'undefined') { 
        // mobile

        firebase.auth().signInWithRedirect(provider)
        return firebase.auth().getRedirectResult()
    } else {
        // web
        return firebase.auth().signInWithPopup(provider)

    }
}

// []
export const facebookAuth = () =>{
   var provider = new firebase.auth.FacebookAuthProvider();

   if (typeof window.orientation !== 'undefined') { 
        // mobile

        firebase.auth().signInWithRedirect(provider);
        return firebase.auth().getRedirectResult()
    } else {
        // web
        return firebase.auth().signInWithPopup(provider)
    }
}

// []
export const twitterAuth = () => {
    var provider = new firebase.auth.TwitterAuthProvider();

    if (typeof window.orientation !== 'undefined') { 
        // mobile

        firebase.auth().signInWithRedirect(provider);
        return firebase.auth().getRedirectResult()
    } else {
        // web
        return firebase.auth().signInWithPopup(provider)
    }
}


//GENERAL
// firebase.firestore().enablePersistence({ synchronizeTabs: true })

// []
// export const setData = (collection, id, data, success, error) => firebase.firestore().collection(collection).doc(id).set(data).then(res => success(res)).catch(err => error(err));

// [x]
export const addData = (collection, data, success, error) => firebase.firestore().collection(collection).add(data).then(res => success(res)).catch(err => error(err));

// [x]
export const updateData = (collection, id, data, success, error) => firebase.firestore().collection(collection).doc(id).update(data).then(res => success(res)).catch(err => error(err));

// [x]
export const deleteData = (collection, id, success, error) => firebase.firestore().collection(collection).doc(id).delete().then(res => success(res)).catch(err => error(err));

// []
export const getADoc = (collection, id, success, error) => firebase.firestore().collection(collection).doc(id).get()
.then(querySnapshot => {
    if (querySnapshot.exists) {
        success({ id: querySnapshot.id, ...querySnapshot.data()})
    } else {
        success(null)
    }
})
.catch(err => {
     error(err)
})

// [x]
export const uploadFile = (ref, name, file, metadata) => firebase.storage().ref().child(`${ref}/${name}`).put(file, metadata).then((res) => res.ref.getDownloadURL().then(url => ({ url, gsUrl: res.ref.toString() }) ))

// [x]
export const deleteFile = (url) => firebase.storage().refFromURL(url).delete()

// [x]
export const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

// [x]
export const generatefirestoreId = (collection) => firebase.firestore().collection(collection).doc()

export const functionCaller = (func, data) =>  firebase.functions().httpsCallable(func)(data)

/////ADMIN
export const fetchUsers = (res, error) => firebase.firestore().collection("users").limit(25).onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    err(error)
})


export const fetchOrders = (res, error) => firebase.firestore().collection("orders").where("paid", "==", true).limit(25).onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    err(error)
})


export const fetchAdminUsers = (res, error) => firebase.firestore().collection("admins").onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    err(error)
})

export const createAdmin = (email) => firebase.firestore().collection("admins").add({
    "name": "",
    "email": email,
    "superUser": false,
    "createdAt": serverTimestamp()
})

export const deleteAdmin = (id, res, error) => firebase.firestore().collection("admins").doc(id)
.then(r => {
    res(r)
})
.catch(err => {
    error(err)
})

export const createAdminSuperUser = (email, res, error) => firebase.firestore().collection("admins").add({
    "name": "",
    "email": email,
    "superUser": true,
    "createdAt": serverTimestamp()
})
.then(r => {
    res(r)
})
.catch(err => {
    error(err)
})


export const fetchMyAdmin = (userId, res, error) => firebase.firestore().collection("admins").doc(userId).onSnapshot((snapshot) => {
    let data = {};
    if (snapshot.exists) {
        data = { id: snapshot.id, ...snapshot.data()}
    } 

    res(data)
}, (err) => {
    err(error)
})

/////ACCOUNT
export const fetchMySavedQuote = (userId, res, error) => firebase.firestore().collection("orders").where("userId", "==", userId).where("paid", "==", false).limit(25).onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    err(error)
})


export const fetchMyOrders = (userId, res, error) => firebase.firestore().collection("orders").where("userId", "==", userId).where("paid", "==", true).limit(25).onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    err(error)
})

export const fetchMyUser = (userId, res, error) => firebase.firestore().collection("users").doc(userId).onSnapshot((snapshot) => {
    let data = {};
    if (snapshot.exists) {
        data = { id: snapshot.id, ...snapshot.data()}
    } 

    res(data)
}, (err) => {
    err(error)
})


export const saveOrder = () => firebase.firestore().collection("orders").add({
    
})

export const deleteOrder = (id, res, error) => firebase.firestore().collection("orders").doc(id).delete()
    .then(r => {
        res(r)
    })
    .catch(err => {
        error(err)
    })

export const updateOrderStatus = (id, status, res, error) => {
    let key = `date.${status}`
    return firebase.firestore().collection("orders").doc(id).update({
        status,
        [key]: serverTimestamp()
    })
    .then(r => {
        res(r)
    })
    .catch(err => {
        error(err)
    })
} 