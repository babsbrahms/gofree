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
export const fetchFirebasUser = (id, success, error) => firebase.firestore().collection('user').doc(id).onSnapshot(querySnapshot => {
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
        firebase.firestore().collection('user').doc(userId).set({
            email, surname, given, uid: userId, createdAt: serverTimestamp(), name: `${surname} ${given}`, photoUrl: ""
        }),
    ])
}
// [x]
export const updateName= (userId, surname, given) => {
    const updateUserTeamName = (userId) => firebase.firestore().collection('team').where("userId", "==", userId).get()
    .then(querySnapshot => {
        let batch = firebase.firestore().batch();
        querySnapshot.forEach(doc => {
            // update team
            batch.update(firebase.firestore().collection('team').doc(doc.id), { name: `${surname} ${given}` })
        })

        return batch.commit()
    });

    return Promise.all([
        firebase.auth().currentUser.updateProfile({
            displayName: `${surname} ${given}`
        }),
        firebase.firestore().collection('user').doc(userId).update({
            surname, given, name: `${surname} ${given}`
        }),
        updateUserTeamName(userId)
    ])
}

// [x] 
export const updatePhotoUrl =(file, userId) => {
    return  uploadFile('user', userId, file, { 
        customMetadata: {
            userId: userId,
            name: file.name,
            size: file.size,
            type: file.type
        }               
    }).then(res => { 
        const updateUserTeamPhoto = (userId) => firebase.firestore().collection('team').where("userId", "==", userId).get()
        .then(querySnapshot => {
            let batch = firebase.firestore().batch();
            querySnapshot.forEach(doc => {
                // update team
                batch.update(firebase.firestore().collection('team').doc(doc.id), { photoUrl: res.url })
            })
    
            return batch.commit()
        });
        return Promise.all([
            firebase.auth().currentUser.updateProfile({
                photoURL: res.url
            }),
            firebase.firestore().collection('user').doc(userId).update({
                photoUrl: res.url, 
                gsUrl: res.gsUrl,
            }),
            updateUserTeamPhoto(userId)
        ]) 
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


// workspaceS
// [x]
export const createworkspace = (workspaceName, roleTitle, departmentName, userId, userName, userEmail, permission, workspaceId, photoUrl) => {
    let batch = firebase.firestore().batch();
   // let workspaceId = generatefirestoreId('workspace');
    let time = serverTimestamp();

    // workspace
    batch.set(workspaceId, { 
        "name": workspaceName,
        "createdBy": userId,
        "owner": userId,
        "createdAt": time,
        "userCount": 1,
        "subscription": {
            quantity: 1,
            payment_count: 0,
            subaccount_code: sessionStorage.getItem("subaccount_code") || ""
        },
        "trialEndDate": (new Date().getTime() + (10 * 86400000)),
        "affiliateId" : sessionStorage.getItem("affiliateId") || ""
    })

    // department
    let departmentId = generatefirestoreId('department')
    batch.set(departmentId, {
        "name": departmentName,
        "workspaceId": workspaceId.id,
        "createdBy": userId,
        "createdAt": time
    })


    // role
    let roleId = generatefirestoreId('role')
    batch.set(roleId, {
        title: roleTitle,
        permission: permission,
        "workspaceId": workspaceId.id,
        "createdBy": userId,
        "createdAt": time
        
    })

    //team
    batch.set(generatefirestoreId('team'), {
        "photoUrl": photoUrl || "",
        "userId": userId,
        "name": userName,
        "email": userEmail,
        "roleId": roleId.id,
        "roleTitle": roleTitle,
        "departmentId": departmentId.id,
        "departmentName": departmentName,
        "workspaceId": workspaceId.id,
        "workspaceName": workspaceName,
        "createdAt": time,
        "owner": true,
        "accepted": true
    })


    //teamlog
    batch.set(firebase.firestore().collection('teamcount').doc(workspaceId.id), {
        "action": "add",
        "count": 1,
        "userId": userId,
        "userName": userName,
        "userEmail": userEmail,
        "workspaceId": workspaceId.id,
        "createdAt": time,
    })

    //commit
   return batch.commit()
} 

// [x]
export const deleteMyworkspace = (workspaceId) => firebase.firestore().collection('team').where('workspaceId', "==", workspaceId).get().then(querySnapshot => {
    const batch = firebase.firestore().batch();

    querySnapshot.forEach(doc => {
        batch.delete(firebase.firestore().collection('team').doc(doc.id))
    })

    batch.delete(firebase.firestore().collection('workspace').doc(workspaceId))

    return  batch.commit()
})


// [x]
export const transferworkspaceOwnership = (email, teamId, workspaceId, workspaceName) => firebase.firestore().collection('team').where("workspaceId", '==', workspaceId).where('email', '==', email).get().then(querySnapshot => {
    let newOwner = {};
    querySnapshot.forEach(doc => {
        newOwner = { ...doc.data(), id: doc.id }
    })

    if (newOwner.id && newOwner.accepted && !newOwner.owner) {
        const batch = firebase.firestore().batch();
        // oldOwner
        batch.update(firebase.firestore().collection('team').doc(teamId), { owner: false })
        // newOnwer
        batch.update(firebase.firestore().collection('team').doc(newOwner.id), { owner: true })

        batch.update(firebase.firestore().collection('workspace').doc(workspaceId), { owner: newOwner.userId })
    
        batch.commit().then(() => {
            return firebase.functions().httpsCallable('tranfer_owership_email')({ email, name: workspaceName })
        })
    } else if (newOwner.owner) {
        return Promise.reject({ message: 'You cannot transfer workspace ownership to yourself.' })
    } else {
        return Promise.reject({ message: 'User not found in workspace team members or user has not accepted the workspace invitation' })
    }

})
 

// [x] update workspace and team
export const changeworkspaceName = (id, name) => firebase.firestore().collection('team').where('workspaceId', "==", id).get()
   .then(querySnapshot => {
        const batch = firebase.firestore().batch();

        querySnapshot.forEach(doc => {
            // update team
            batch.update(firebase.firestore().collection('team').doc(doc.id), { workspaceName: name })
        })

        // update workspace
        batch.update(firebase.firestore().collection('workspace').doc(id), { name: name })

        return batch.commit()
   })


// [x]
export const fetchMyInvitation = (email, success, error) => firebase.firestore().collection('team').where("email", "==", email).where("accepted", "==", false).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})


// [x]
export const acceptInvitation = (workspaceId, teamId, userId, userName, photoUrl, email) => {
    return firebase.firestore().collection('team').where("accepted", "==", true).where('workspaceId', "==", workspaceId).where('email', "==", email).get()
    .then(querySnapshot => {
        let hasEmail = false;  
        querySnapshot.forEach((doc) => {
            if (doc.data().email === email) {
                hasEmail = true
            }
        });

        if (!hasEmail) {
            let batch = firebase.firestore().batch();

            batch.update(firebase.firestore().collection('team').doc(teamId), { accepted: true, userId, name: userName, photoUrl })
            batch.update(firebase.firestore().collection('workspace').doc(workspaceId), { userCount: firebase.firestore.FieldValue.increment(1), "subscription.quantity": firebase.firestore.FieldValue.increment(1) })
        
            //teamlog
            batch.update(firebase.firestore().collection('teamcount').doc(workspaceId), {
                "action": "add",
                "count": firebase.firestore.FieldValue.increment(1),
                "userId": userId,
                "userName": userName,
                "userEmail": email,
                "workspaceId": workspaceId,
                "createdAt": serverTimestamp(),
            })

            return batch.commit()
        } else {
            return Promise.reject({ message: `User with ${email} already exist in this workspace`})
        } 
    })
}


// [x]
export const fetchAcceptedworkspaces = (userId, success, error) => firebase.firestore().collection('team').where("userId", "==", userId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// [x]
export const fetchAworkspace = (id, success, error) => firebase.firestore().collection('workspace').doc(id).onSnapshot(querySnapshot => {
    if (querySnapshot.exists) {
        success({ id: querySnapshot.id, ...querySnapshot.data()})
    } else {
        success(null)
    }
}, (err) => {
    error(err)
})

// [x]
export const fetchARole = (id, success, error) => firebase.firestore().collection('role').doc(id).onSnapshot(querySnapshot => {
    if (querySnapshot.exists) {
        success({ id: querySnapshot.id, ...querySnapshot.data()})
    } else {
        success(null)
    }
}, (err) => {
    error(err)
})

// [x]
export const fetchAteam = (id, success, error) => firebase.firestore().collection('team').doc(id).onSnapshot(querySnapshot => {
    if (querySnapshot.exists) {
        success({ id: querySnapshot.id, ...querySnapshot.data()})
    } else {
        success(null)
    }
}, (err) => {
    error(err)
})

// [x]
export const enableSubscription = (workspace) => {
    if (workspace.subscription.status === 'inactive') {
        return firebase.firestore().collection('workspace').doc(workspace.id).update({
            "subscription.status": "active",
        })
    } else {
        return Promise.reject({
            message: "You have not started your subscription"
        })
    }
}

// [x]
export const disableSubscription = (workspace) => {
    if (workspace.subscription.status === 'active') {
        return firebase.firestore().collection('workspace').doc(workspace.id).update({
            "subscription.status": "inactive",
        })
    } else {
        return Promise.reject({
            message: "You have not started your subscription"
        })
    }
}

// [x]
export const fetchInvoices = (workspaceId, success, error) => firebase.firestore().collection('invoice').where("workspaceId", "==", workspaceId).orderBy('createdAt', 'desc').limit(12).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// NOTIFICATION
export const fetchNotification = (userId, success, error) => firebase.firestore().collection('notification').where("userId", "==", userId).orderBy('createdAt', 'desc').limit(20).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// ANOUNCEMENT
// [x]
export const fetchAnnoucement = (workspaceId, department, success, error) => firebase.firestore().collection('announcement').where("workspaceId", "==", workspaceId).where("departmentIds", "array-contains", department).orderBy('postedOn', 'desc').limit(20).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})


// NOTE
// []
export const fetchNote = (workspaceId, userId, success, error) => firebase.firestore().collection('note').where("workspaceId", "==", workspaceId).where("userId", "==", userId).orderBy('createdAt', 'desc').onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})


//ADMINISTRATION
// [x]
export const fetchRoles = (workspaceId, success, error) => firebase.firestore().collection("role").where("workspaceId", "==", workspaceId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})


// [x]
export const fetchDepartments = (workspaceId, success, error) => firebase.firestore().collection("department").where("workspaceId", "==", workspaceId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// [x] accecpt and not accepeted team
export const getAllTeamsByDepartment = (departmentId, success, error) => firebase.firestore().collection("team").where("departmentId", "==", departmentId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

//[x] unique department name in workspace
export const addDepartment = (department) => {
    return firebase.firestore().collection('department').where("workspaceId", "==", department.workspaceId).get()
    .then((querySnapshot) => {
        let hasDepartment = false;  
        querySnapshot.forEach((doc) => {
            if (doc.data().name === department.name) {
                hasDepartment = true
            }
        });

        if (!hasDepartment) {
           return firebase.firestore().collection('department').add(department)
        } else {
            return Promise.reject({ message: `${department.name} department already exist in this workspace`})
        }
    })
};

//[X] update all users to new workspace name
export const editDepartment = (department) => {
   return firebase.firestore().collection('department').where("workspaceId", "==", department.workspaceId).get()
    .then((querySnapshot) => {
        let hasDepartment = false;  
        querySnapshot.forEach((doc) => {
            if ((doc.data().name === department.name) && (doc.id !== department.id)) {
                hasDepartment = true
            }
        });

        if (!hasDepartment) {
           // update team dept an department
           firebase.firestore().collection('team').where("departmentId", "==", department.id).get()
           .then(querySnapshot => {
               let batch = firebase.firestore().batch();
               querySnapshot.forEach(doc => {
                   // update team
                   batch.update(firebase.firestore().collection('team').doc(doc.id), { departmentName: department.name })
               })
                   // udate department
                   batch.update(firebase.firestore().collection("department").doc(department.id), department)
               return batch.commit()
           })
        } else {
            return Promise.reject({ message:  `A department named ${department.name} already exist in this workspace`})
        }
    })
};

//[X] empty department
export const deleteDepartment = (id) => {
   return firebase.firestore().collection('team').where("departmentId", "==", id).get()
    .then((querySnapshot) => {
        if (querySnapshot.empty) {
           return firebase.firestore().collection('department').doc(id).delete()
        } else {
            return Promise.reject({ message: `Users are assigned to the department. Move the user(s) to other department(s) to delete it.`})
        }
    })
};

//[X] unique role title in workspace
export const addRole = (role) => {
    return firebase.firestore().collection('role').where("workspaceId", "==", role.workspaceId).get()
    .then((querySnapshot) => {
        let hasRole = false;  
        querySnapshot.forEach((doc) => {
            if (doc.data().title === role.title) {
                hasRole = true
            }
        });

        if (!hasRole) {
           return firebase.firestore().collection('role').add(role)
        } else {
            return Promise.reject({ message: `${role.title} role already exist in this workspace`})
        }
    })
};

//[X] // update all users to new role name
export const editRole = (role) => {
    return firebase.firestore().collection('role').where("workspaceId", "==", role.workspaceId).get()
    .then((querySnapshot) => {
        let hasRole = false;  
        querySnapshot.forEach((doc) => {
            if ((doc.data().title === role.title) && (role.id !== doc.id)) {
                hasRole = true
            }
        });

        if (!hasRole) {
            // update team with same roleid and update role
            firebase.firestore().collection('team').where("roleId", "==", role.id).get()
            .then(querySnapshot => {
                let batch = firebase.firestore().batch();
                querySnapshot.forEach(doc => {
                    // update team
                    batch.update(firebase.firestore().collection('team').doc(doc.id), { roleTitle: role.title })
                })
                    // udate role
                    batch.update(firebase.firestore().collection('role').doc(role.id), role)
                return batch.commit()
            })
        } else {
            return Promise.reject({ message: `A role titled ${role.title} already exist in this workspace`})
        }
    })
};

//[X] empty role
export const deleteRole = (id) => {
    return firebase.firestore().collection('team').where("roleId", "==", id).get()
    .then((querySnapshot) => {
        if (querySnapshot.empty) {
           return firebase.firestore().collection('role').doc(id).delete()
        } else {
            return Promise.reject({ message: `Users are assigned to the role. Move the user(s) to other role(s) to delete it.`})
        }
    })
};


//[x] unique email in workspace
export const addTeam = (team) => {
    return firebase.firestore().collection('team').where("workspaceId", "==", team.workspaceId).where("email", "==", team.email).get()
    .then((querySnapshot) => {
        let hasEmail = false;  
        querySnapshot.forEach((doc) => {
            if (doc.data().email === team.email) {
                hasEmail = true
            }
        });

        if (!hasEmail) {
           return firebase.firestore().collection('team').add(team)
        } else {
            return Promise.reject({ 
                message: `A team member with ${team.email} already exist in this workspace`,
                email: team.email
            })
        }
    }).catch(err => {
        return err
    })
};

//[x]
export const editTeam = (team) => firebase.firestore().collection('team').doc(team.id).update(team);

//[x] if not owner
export const deleteTeam = (team) => {
    if (team.owner) {
        return Promise.reject({ message: 'You cannot delete the owner of a workspace unless ownership is transfered to a team member'})
    } else {
        const batch = firebase.firestore().batch()

        batch.delete(firebase.firestore().collection('team').doc(team.id))

        if (team.accepted) {
            batch.update(firebase.firestore().collection('workspace').doc(team.workspaceId), { userCount: firebase.firestore.FieldValue.increment(-1) })

            //teamlog
            batch.update(firebase.firestore().collection('teamcount').doc(team.workspaceId), {
                "action": "remove",
                "count": firebase.firestore.FieldValue.increment(-1),
                "userId": team.userId,
                "userName": team.name,
                "userEmail": team.email,
                "workspaceId": team.workspaceId,
                "createdAt": serverTimestamp(),
            })
        }

        return batch.commit()
    }
}

//POLL
// []
export const fetchPolls = (workspaceId, success, error) => firebase.firestore().collection("poll").where("workspaceId", "==", workspaceId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// []
export const fetchMyVote = (pollId, userId, success, error) => firebase.firestore().collection('vote').where("pollId", "==", pollId).where("userId", "==", userId).orderBy('createdAt', 'desc').onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

//SUGGESTION
// [x]
export const fetchAllSuggestions = (action, workspaceId, success, error) => firebase.firestore().collection('suggestion').where("action", "==", action).where("workspaceId", "==", workspaceId).orderBy('createdAt', 'desc').get()
.then((querySnapshot) => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}).catch(err => {
    error(err)
})

// [x]
export const fetchSuggestionsByDepartment = (action, departmentId, workspaceId, success, error) => firebase.firestore().collection('suggestion').where("action", "==", action).where('recipient', "==", 'department').where('departmentId', "==", departmentId).where("workspaceId", "==", workspaceId).orderBy('createdAt', 'desc').get()
.then((querySnapshot) => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}).catch(err => {
    error(err)
})


// [x]
export const fetchManagementSuggestions = (action, workspaceId, success, error) => firebase.firestore().collection('suggestion').where("action", "==", action).where('recipient', "==", 'management').where("workspaceId", "==", workspaceId).orderBy('createdAt', 'desc').get()
.then((querySnapshot) => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}).catch(err => {
    error(err)
})


//Task project
// [x]
export const fetchAllproject = (workspaceId, success, error) => firebase.firestore().collection("project").where("workspaceId", "==", workspaceId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });
    success(data)
}, (err) => {
    error(err)
})

// [x]
export const fetchDeptproject = (workspaceId, departmentId, success, error) => firebase.firestore().collection("project").where("workspaceId", "==", workspaceId).where('departmentIds', "array-contains", departmentId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });
    success(data)
}, (err) => {
    error(err)
})


// [x]
export const fetchAllTasks = (projectId, success, error) => firebase.firestore().collection("task").where("projectId", "==", projectId).orderBy('createdAt', 'desc').onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() })
    });

    success(data)
}, (err) => {
    error(err)
})

// [x]
export const fetchSatusTasks = (projectId, status, success, error) => firebase.firestore().collection("task").where("projectId", "==", projectId).where("status", "==", status).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})


//////////Task lOG paginate start /////////
// [x]
export const fetchNewTaskLogs = (taskId, success, error) => firebase.firestore().collection("log").where("taskId", "==", taskId).orderBy('createdAt', 'desc').limit(2).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
            data.push({ id: change.doc.id, ...change.doc.data() })
        }
    });
    success(data)
}, (err) => {
    error(err)
})

// [x]
export const fetchTaskLogs = (taskId, success, error) => firebase.firestore().collection("log").where("taskId", "==", taskId).orderBy('createdAt', 'desc').limit(5).get()
.then(querySnapshot => {
    var data = [];
    var lastVal = null
    if (querySnapshot.docs.length !== 0) {
        lastVal = querySnapshot.docs[querySnapshot.docs.length-1];
    }
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success({ lastVal, logs: data })
})
.catch(err => {
    error(err)
})


// [x]
export const fetchNextTaskLogs = (taskId, lastVisible, success, error) => firebase.firestore().collection("log").where("taskId", "==", taskId).orderBy('createdAt', 'desc').startAfter(lastVisible).limit(10).get()
.then(querySnapshot => {
    var data = [];
    var lastVal = null
    if (querySnapshot.docs.length !== 0) {
        lastVal = querySnapshot.docs[querySnapshot.docs.length-1];
    }
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success({ lastVal, logs: data })
})
.catch((err) => {
    error(err)
})
////////// TASK LOG paginate end /////////

// [x]
export const fetchSomeprojectLogs = (projectIds, success, error) => firebase.firestore().collection("log").where("projectId", "in", projectIds).where("statusChange", "==", true).orderBy('createdAt', 'desc').limit(25).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})


//////////comment paginate start /////////
// [x]
export const fetchNewTaskComment = (taskId, success, error) => firebase.firestore().collection("comment").where("taskId", "==", taskId).orderBy('createdAt', 'desc').limit(2).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
            data.push({ id: change.doc.id, ...change.doc.data() })
        }
    });
    success(data)
}, (err) => {
    error(err)
})

// [x]
export const fetchTaskComment = (taskId, success, error) => firebase.firestore().collection("comment").where("taskId", "==", taskId).orderBy('createdAt', 'desc').limit(2).get()
.then(querySnapshot => {
    var data = [];
    var lastVal = null
    if (querySnapshot.docs.length !== 0) {
        lastVal = querySnapshot.docs[querySnapshot.docs.length-1];
    }
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success({ lastVal, comments: data })
})
.catch(err => {
    error(err)
})


// [x]
export const fetchNextTaskComment = (taskId, lastVisible, success, error) => firebase.firestore().collection("comment").where("taskId", "==", taskId).orderBy('createdAt', 'desc').startAfter(lastVisible).limit(10).get()
.then(querySnapshot => {
    var data = [];
    var lastVal = null
    if (querySnapshot.docs.length !== 0) {
        lastVal = querySnapshot.docs[querySnapshot.docs.length-1];
    }
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success({ lastVal, comments: data })
})
.catch((err) => {
    error(err)
})
//////////comment paginate end /////////
//TASK
// [x]
export const fetchMyAssignedTasks = (workspaceId, userId, success, error) => firebase.firestore().collection("task").where("workspaceId", "==", workspaceId).where("teamIds", "array-contains", userId).where("status", "==", 'todo').orderBy('priority', 'desc').onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// [x]
export const fetchMyStartedTasks = (workspaceId, userId, success, error) => firebase.firestore().collection("task").where("workspaceId", "==", workspaceId).where("teamIds", "array-contains", userId).where("status", "==", 'inProgress').onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// [x]
export const fetchMyCompletedTasks = (workspaceId, userId, success, error) => firebase.firestore().collection("task").where("workspaceId", "==", workspaceId).where("teamIds", "array-contains", userId).where("status", "==", 'done').onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// [x]
export const fetchMyLog = (workspaceId, userId, success, error) => firebase.firestore().collection("log").where("workspaceId", "==", workspaceId).where("teamIds", "array-contains", userId).orderBy('createdAt', 'desc').limit(25).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// [x]
export const addTaskSchedule = (taskId, scheduleUser, date) => firebase.firestore().collection('task').doc(taskId).update({ [scheduleUser] : date})

// [x]
export const fetchAllAcceptedTeams = (workspaceId, success, error) => firebase.firestore().collection("team").where("workspaceId", "==", workspaceId).where("accepted", "==", true).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
}) 

// [x]
export const fetchAllprojectTeams = (departmentIds, success, error) => firebase.firestore().collection("team").where("departmentId", "in", departmentIds).where("accepted", "==", true).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
}) 


// [x]
export const updateprojectandTask = (project) => {
    return firebase.firestore().collection('task').where('projectId', "==", project.id).get()
    .then(querySnapshot => {
        const batch = firebase.firestore().batch();

        // udate task
        querySnapshot.forEach(doc => {
            batch.update(firebase.firestore().collection('task').doc(doc.id), { 
                "projectId": project.id,
                "projectName": project.name,
                "projectDeptIds": project.departmentIds
            })
        })

        //update project
        batch.update(firebase.firestore().collection('project').doc(project.id), project)

        return batch.commit()
    })
}

//LOG
// [x]
export const commitNewTask = (task, team, project) => {
    var batch = firebase.firestore().batch();
    let genId = generatefirestoreId('task');
    // log 
    batch.set(generatefirestoreId('log'), {
        "action": `${team.name} created a new task`,
        "taskId": task.id || genId.id,
        "taskTitle": task.title || '',
        "userId": team.userId,
        "statusChange": true,
        "teamIds": task.teamIds || [],
        "projectId": project.id,
        "projectName": project.name,
        "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
        "workspaceId": team.workspaceId
    })

    // task
    if (task.id) {
        batch.set(firebase.firestore().collection('task').doc(task.id), task) 
    } else {
        batch.set(genId, task) 
    }

    return batch.commit()
}

// [x]
export const commitTaskStatus = (task, team, project, status) => {
    var batch = firebase.firestore().batch();

    // log 
    batch.set(generatefirestoreId('log'), {
        "action": `${team.name} moved task to ${status}`,
        "taskId": task.id,
        "taskTitle": task.title,
        "userId": team.userId,
        "statusChange": true,
        "teamIds": task.teamIds || [],
        "projectId": project.id,
        "projectName": project.name,
        "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
        "workspaceId": team.workspaceId,
        "key": "status",
        "value": task.status
    })

    // task
    batch.update(firebase.firestore().collection('task').doc(task.id), { status: status })

    return batch.commit()
}

// [x]
export const commitTaskChanges = (changes, task, oldTask, team, project) => {
    var batch = firebase.firestore().batch();

    const commitLog = (task, team, project, statusChange, key, value, ogKey) => batch.set(generatefirestoreId('log'), {
        "action": `${team.name} updated task ${key || ''}`,
        "taskId": task.id,
        "taskTitle": task.title,
        "userId": team.userId,
        "statusChange": statusChange,
        "teamIds": task.teamIds || [],
        "projectId": project.id,
        "projectName": project.name,
        "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
        "workspaceId": task.workspaceId,
        "key": ogKey || key || "",
        "value": value || ''
    })
    

    if (changes.title) {
        commitLog(task, team, project, false, 'title', oldTask['title'])
    }

    if (changes.description) {
        commitLog(task, team, project, false, 'description', oldTask['description'])
    }

    if (changes.deadline) {
        commitLog(task, team, project, false, 'deadline', oldTask['deadline'])
    }

    if (changes.priority) {
        commitLog(task, team, project, false, 'priority', oldTask['priority'])
    }

    if (changes.status) {
        commitLog(task, team, project, true, 'status', oldTask['status'])
    }

    if (changes.teamIds) {
        commitLog(task, team, project, false, 'team', oldTask['teamIds'], 'teamIds')
    }

    if (changes.tags) {
        commitLog(task, team, project, false, 'tags', oldTask['tags'])
    }

    batch.set(firebase.firestore().collection('task').doc(task.id), task)

    return  batch.commit()
}

// [x]
export const commitTaskDelete = (task, team, project) => {
    var batch = firebase.firestore().batch();

    // log 
    batch.set(generatefirestoreId('log'), {
        "action": `${team.name} deleted a task`,
        "taskId": task.id,
        "taskTitle": task.title,
        "userId": team.userId,
        "statusChange": true,
        "teamIds": task.teamIds || [],
        "projectId": project.id,
        "projectName": project.name,
        "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
        "workspaceId": team.workspaceId,
    })

    // task
    batch.delete(firebase.firestore().collection('task').doc(task.id))

    return batch.commit()
}

// []
export const fetchTaskAttachment = (taskId, success, error) => firebase.firestore().collection("attachment").where("taskId", "==", taskId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// []
export const addAttachment = (files, create, createId, task, team, project ) => {
    var uploads = Array.from(files).map((file, i) => uploadFile('task', `${create? createId.id: task.id}a${i}t${Date.now()}.${file.type.split('/')[1]}`, file, { 
        customMetadata: {
            projectId: project.id,
            workspaceId: team.workspaceId,
            taskId: create? createId.id: task.id,
            userId: team.userId,
            name: file.name,
            size: file.size,
            type: file.type
        }               
    }))

   return Promise.all(uploads).then(urls => Array.from(urls).map((file, i) => ({  
        name: files[i].name,
        size: files[i].size,
        type: files[i].type,
        url: file.url, 
        gsUrl: file.gsUrl, 
        userId: team.userId, 
        taskId: create? createId.id: task.id,
        projectId: project.id, 
        workspaceId: team.workspaceId, 
        createdAt: serverTimestamp() 
    })))
    .then((res) => {
        let batch = firebase.firestore().batch();

        if (create) {
            res.forEach(r => {
                batch.set(generatefirestoreId('attachment'), r)
            })

            return batch.commit()
        } else {

            const commitLog = (task, team, project) => batch.set(generatefirestoreId('log'), {
                "action": `${team.name} added new attachment`,
                "taskId": create? createId.id: task.id,
                "taskTitle": task.title,
                "userId": team.userId,
                "statusChange": false,
                "teamIds": task.teamIds,
                "projectId": project.id,
                "projectName": project.name,
                "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
                "workspaceId": team.workspaceId
            })
            res.forEach(r => {
                batch.set(generatefirestoreId('attachment'), r)
            })

            commitLog(task, team, project)
            
            return batch.commit()
        }
    })
}

// [x]
export const removeAttachment = (file, create, createId, task, team, project ) => {
   return deleteFile(file.url).then(() => {
        let batch = firebase.firestore().batch();

        if (create) {

            batch.delete(firebase.firestore().collection('attachment').doc(file.id))

            return batch.commit()
        } else {

            const commitLog = (task, team, project) => batch.set(generatefirestoreId('log'), {
                "action": `${team.name} deleted an attachment`,
                "taskId": create? createId.id: task.id,
                "taskTitle": task.title || "",
                "userId": team.userId,
                "statusChange": false,
                "teamIds": task.teamIds,
                "projectId": project.id,
                "projectName": project.name,
                "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
                "workspaceId": team.workspaceId,
            })

            batch.delete(firebase.firestore().collection('attachment').doc(file.id))

            commitLog(task, team, project)
            
            return batch.commit()
        }
    })
}

// [x]
export const fetchTaskChecklist = (taskId, success, error) => firebase.firestore().collection("checklist").where("taskId", "==", taskId).onSnapshot(querySnapshot => {
    var data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data()})
    });

    success(data)
}, (err) => {
    error(err)
})

// [x]
export const addChecklist = (data, create, createId, task, team, project ) => {

    let batch = firebase.firestore().batch();

    if (create) {

        batch.set(generatefirestoreId('checklist'), data)

        return batch.commit()
    } else {

        const commitLog = (task, team, project, key, value) => batch.set(generatefirestoreId('log'), {
            "action": `${team.name} added new checklist`,
            "taskId": create? createId.id : task.id,
            "taskTitle": task.title || "",
            "userId": team.userId,
            "statusChange": false,
            "teamIds": task.teamIds,
            "projectId": project.id,
            "projectName": project.name,
            "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
            "workspaceId": team.workspaceId,
            "key": 'checklist',
            "value": data
        })

        batch.set(generatefirestoreId('checklist'), data)

        commitLog(task, team, project)
        
        return batch.commit()
    }

}

// [x]
export const removeChecklist = (data, create, createId, task, team, project ) => {
    let batch = firebase.firestore().batch();

    if (create) {

        batch.delete(firebase.firestore().collection('checklist').doc(data.id))

        return batch.commit()
    } else {

        const commitLog = (task, team, project) => batch.set(generatefirestoreId('log'), {
            "action": `${team.name} deleted a checklist`,
            "taskId": create? createId.id : task.id,
            "taskTitle": task.title || "",
            "userId": team.userId,
            "statusChange": false,
            "teamIds": task.teamIds,
            "projectId": project.id,
            "projectName": project.name,
            "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
            "workspaceId": team.workspaceId,
        })

        batch.delete(firebase.firestore().collection('checklist').doc(data.id))

        commitLog(task, team, project)
        
        return batch.commit()
    }
}

// [x]
export const clearUnwantedTask = (checklist, attachment) => {
    let batch = firebase.firestore().batch();
    attachment.forEach(attach => {
        deleteFile(attach.url)
        batch.delete(firebase.firestore().collection('attachment').doc(attach.id))
    })

    checklist.forEach(list => {
        batch.delete(firebase.firestore().collection('checklist').doc(list.id))
    })

    batch.commit()
}

// [x]
export const addTaskComment = (data, task, team) => {
    let batch = firebase.firestore().batch();

    batch.set(generatefirestoreId('comment'), data)

    batch.set(generatefirestoreId('log'), {
        "action": `${team.name} add a new comment`,
        "taskId": task.id,
        "taskTitle": task.title || "",
        "userId": team.userId,
        "statusChange": false,
        "teamIds": task.teamIds,
        "projectId": task.projectId,
        "projectName": task.projectName,
        "createdAt": firebase.firestore.FieldValue.serverTimestamp(),
        "workspaceId": team.workspaceId,
    })

   return batch.commit()
}


// [x]
export const deleteproject = (id) => {
    return firebase.firestore().collection('task').where("projectId", "==", id).get()
    .then((querySnapshot) => {
        let batch = firebase.firestore().batch();

        // delete tasks
        querySnapshot.forEach(doc => {
            batch.delete(firebase.firestore().collection('task').doc(doc.id))
        })

        // delete project
        batch.delete(firebase.firestore().collection('project').doc(id))

        return batch.commit()

    })
}


// AFFILIATE
// [x]
export const fetchMyAffiliateAccount = (userId, success, error) => firebase.firestore().collection("affiliate").where("userId", "==", userId).onSnapshot((querySnapshot) => {
    let data = {};

    querySnapshot.forEach(doc => {
        data = { ...doc.data(), id: doc.id }
    })

    success(data)
},(err) => {
    error(err)
})


// [x]
export const fetchMyAffiliateWorkspaces = (affiliateId, success, error) => firebase.firestore().collection('workspace').where("affiliateId", "==", affiliateId).where("subscription.payment_count", "<=", 5).onSnapshot((querySnapshot) => {
    let data = [];

    querySnapshot.forEach(doc => {
        data.push({ ...doc.data(), id: doc.id })
    })

    success(data)
}, 
(err) => {
    error(err)
})


//[x]
export const fetchMyAffiliatePayouts = (affiliateId, success, error) => firebase.firestore().collection("invoice").where("affiliateId", "==", affiliateId).where("reason", "==", "subscription").limit(5).get()
.then((querySnapshot) => {
    let data = [];

    querySnapshot.forEach(doc => {
        data.push({ ...doc.data(), id: doc.id })
    })

    success(data)
})
.catch(err => {
    error(err)
})

//[]
export const fetchTeamLogForSubscribers = (workspaceId, lastSubDate, success, error) => firebase.firestore().collection("teamlog").where("workspaceId", "==", workspaceId).where("createdAt", ">=", lastSubDate).get()
.then((querySnapshot) => {
    let data = [];

    querySnapshot.forEach(doc => {
        data.push({ ...doc.data(), id: doc.id })
    })

    success(data)
})
.catch(err => {
    error(err)
})

//[]
export const fetchTeamLogForNewWorkspace = (workspaceId, success, error) => firebase.firestore().collection("teamlog").where("workspaceId", '==', workspaceId).get()
.then((querySnapshot) => {
    let data = [];

    querySnapshot.forEach(doc => {
        data.push({ ...doc.data(), id: doc.id })
    })

    success(data)
})
.catch(err => {
    error(err)
})