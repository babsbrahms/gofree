const functions = require("firebase-functions");
const axios = require("axios").default;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


export const create_checkout_id = functions.https.onCall((data, context) => {
    axios.post("https://api.sumup.com/v0.1/checkouts", {
        "checkout_reference": data.orderId,
        "amount": data.amount,
        "currency": "GBP",
        "merchant_code": "string",
        "description": `GoFree courier service`,
        "return_url": "",
        "customer_id": data.userId
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization":  `Bearer <<valid_access_token>>`
        }
    }).then((res) => {
        return res.data
    }).catch(err => {
        return functions.https.HttpsError("not-found", error.response.data.message)
    })
})