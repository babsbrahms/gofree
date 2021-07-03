import React, { useEffect } from 'react';
import postscribe from 'postscribe';
import firebase from "../firebaseConfig"

const Payment = ({ amount, orderId, userId, success  }) => {
    firebase.functions().httpsCallable("create_checkout_id")
    useEffect(() => {
        
        // SumUpCard.mount({
        //     checkoutId: '2ceffb63-cbbe-4227-87cf-0409dd191a98',
        //     amount: amount,
        //     currency: "GBP",
        //     locale: "en-GB",
        //     onResponse: function(type, body) {
        //         console.log('Type', type);
        //         console.log('Body', body);
        //         if (type === "success") {
        //             success()
        //         }
        //     }
        // });
    }, [])
    return (
        <div>
            {postscribe("#sumup-card", "https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js")}
            <div id="sumup-card"></div>
        </div>
    )
}


export default Payment