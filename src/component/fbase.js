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
 firebase.firestore().enablePersistence()

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
    error(err)
})


export const fetchPaidOrders = (period, res, error) => firebase.firestore().collection("orders").where("paid", "==", true).where("updatedAt.year", "==", period.year).where("updatedAt.month", "==", period.month).onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    error(err)
})


export const fetchSentInvoiceOrders = (period, res, error) => firebase.firestore().collection("orders").where("status", "==", "invoice-sent").where("updatedAt.year", "==", period.year).where("updatedAt.month", "==", period.month).onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    error(err)
})


export const fetchNewOrders = (period, res, error) => firebase.firestore().collection("orders").where("status", "==", "invoice-prep").onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    error(err)
})


export const fetchAdminUsers = (res, error) => firebase.firestore().collection("admins").onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    error(err)
})

export const createAdmin = (name, email) => {
    return firebase.firestore().collection("admins").where("email", '==', email).get()
    .then((snapshot) => {
        let data = {};

        snapshot.forEach(doc => {
            data = { id: doc.id, ...doc.data() }
        })

        if (data.email && (data.email.toLowerCase() === email.toLowerCase())) {
           return Promise.reject({ message: `${email} already exist in the admin account` })
        } else {
           return firebase.firestore().collection("admins").add({
                "name": name,
                "email": email,
                "superUser": false,
                "createdAt": serverTimestamp()
            })
        }
    })
}

export const deleteAdmin = (id, res, error) => firebase.firestore().collection("admins").doc(id).delete()
.then(r => {
    res(r)
})
.catch(err => {
    error(err)
})

export const createAdminSuperUser = (email, name, res, error) => {
    return firebase.firestore().collection("admins").where("superUser", "==", true).get()
    .then((snapshot) => {
        let data = 0;

        snapshot.forEach(() => {
            data = data + 1
        })

        if (data !== 0) {
            return { message: "Sorry, an admin owner alread exist. Please contact the app developer."}
        } else {
            return firebase.firestore().collection("admins").add({
                "name": name,
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
        }
        
    })
    .catch(err => {
        error(err)
    })
}


export const fetchMyAdmin = (email, res, error) => firebase.firestore().collection("admins").where("email", "==", email).onSnapshot((snapshot) => {
    let data = {};
    
    snapshot.forEach(doc => {
        data = { id: doc.id, ...doc.data()}
    })
    

    res(data)
}, (err) => {
    error(err)
})

/////ACCOUNT
export const fetchMySavedQuote = (email, res, error) => firebase.firestore().collection("orders").where("email", "==", email).where("status", "==", "order").limit(25).onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    error(err)
})

export const fetchOrderById = (id, res, error) => firebase.firestore().collection("orders").doc(id).get()
.then((snapshot) => {
    let list = {};
   
    if (snapshot.exists) {
        list = { id: snapshot.id, ...snapshot.data() };
    }
    
    res(list)
})
.catch((err) => {
    error(err)
})

export const fetchMyOrders = (email, res, error) => firebase.firestore().collection("orders").where("email", "==", email).where("ready", "==", true).limit(25).onSnapshot((snapshot) => {
    let list =[];
    snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() })
    })
    res(list)
}, (err) => {
    error(err)
})

export const fetchMyUser = (userId, res, error) => firebase.firestore().collection("users").doc(userId).onSnapshot((snapshot) => {
    let data = {};
    if (snapshot.exists) {
        data = { id: snapshot.id, ...snapshot.data()}
    } 

    res(data)
}, (err) => {
    error(err)
})

export const fetchUserByEmail = (email, res, error) => firebase.firestore().collection("users").where("email", "==", email).onSnapshot((snapshot) => {
    let data = {};

    snapshot.forEach(doc => {
        data = { id: doc.id,  ...doc.data() }
    })

    res(data)
}, (err) => {
    error(err)
})


export const deleteOrder = (id, res, error) => firebase.firestore().collection("orders").doc(id).delete()
    .then(r => {
        res(r)
    })
    .catch(err => {
        error(err)
    })

export const updateorderIcon = (id, status, res, error) => {
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