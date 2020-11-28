// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import 'firebase/storage';
import "firebase/firestore";
import "firebase/analytics";
import "firebase/performance"

const firebaseConfig = {
    apiKey: "AIzaSyDtdfd32Vdb5tiGsopkyHcU-2XilGiuVv0",
    authDomain: "gofreeltd.firebaseapp.com",
    databaseURL: "https://gofreeltd.firebaseio.com",
    projectId: "gofreeltd",
    storageBucket: "gofreeltd.appspot.com",
    messagingSenderId: "961955373449",
    appId: "1:961955373449:web:3fb604569fd3966df94158"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// if (window.location.host.includes("localhost") || window.location.host.includes("127.0.0.1")) {
//     firebase.app()
//       .functions()  //add location here also if you're mentioning location while invoking function()
//       .useFunctionsEmulator("http://localhost:5001");
// }
export default firebase;