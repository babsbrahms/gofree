import React, { useEffect, useState } from 'react';
import { Segment, Form } from "semantic-ui-react";
import useScript from "../hooks/useScript"
import axios from 'axios';
import firebase from "../firebaseConfig"

let months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

const Payment = ({ amount, orderId, userId, success, failure  }) => {
    const [checkoutId, setCheckoutId] = useState("");
    const [card, setCard] = useState({
        "name": "Dominik Biermann",
        "number": "4485618386833995",
        "expiry_month": "05",
        "expiry_year": "20",
        "cvv": "257"
    });
    const [error, setError] = useState({});
    const [loading, setloading] = useState(false)
    // const SumUpCard = useScript("https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js")

    useEffect(() => {
        setloading(true)
        firebase.functions().httpsCallable("create_checkout_id")({
            amount, 
            orderId,
            userId
        }).then(res => {
            setloading(false);
            setCheckoutId(res.data.id)
        })
        .catch(err => {
            setloading(false);
            failure(err.message)
        })
    }, [])

    const validate = () => {
        let err = {}
        if (!card.name) err.name = "Name is required!"
        if (!card.number) err.number = "Number is required!"
        if (!card.expiry_month) err.expiry_month = "Month is required!"
        if (!card.expiry_year) err.expiry_year = "Year is required!"
        if (!card.cvv) err.cvv = "Cvv is required!"

        return err
    } 

    const chargeCard = () => {
        setError({})
        const err = validate();

        if (Object.keys(err).length === 0) {
            setloading(true);

            axios.put(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
                "payment_type": "card",
                "card": card
                }, 
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }).then((res) => {
                    setloading(false);
                    if (res.data.status === "PAID") {
                        success(res.data.id)
                    }
                    
                }).catch(err => {
                    setloading(false);
                    setError(err.message)
                })
        } else {
           
            setError(err);
        }


    }

    // const payWithsumUpWIdget = () => {
    //     SumUpCard.mount({
    //         checkoutId: checkoutId,
    //         onResponse: function(type, body) {
    //             console.log('Type', type);
    //             console.log('Body', body);
    //             if (type === "success") {
    //                 success(checkoutId)
    //             }
    //         }
    //     });
    // }

    return (
        <Form loading={loading}>
            <Form.Input required value={card.name} name="name" onChange={(e, data) => setCard({ ...card, [data.name]: data.value })} label="card name" placeholder={"add card name"} error={error.name}/>
            <Form.Input required value={card.number} name="number" onChange={(e, data) => setCard({ ...card, [data.name]: data.value })} label="card number" placeholder={"add card number"} error={error.number}/>

            <Form.Group inline>
                <Form.Select options={months.map(month => ({ key: month, value: month, text: month }))} required value={card.expiry_month} name="expiry_month" onChange={(e, data) => setCard({ ...card, [data.name]: data.value })} label="expiry month" placeholder={"add card expiry month"} error={error.expiry_month}/>

                <Form.Input required value={card.expiry_year} name="expiry_year" onChange={(e, data) => setCard({ ...card, [data.name]: data.value })} label="expiry year" placeholder={"add card expiry_year"} error={error.expiry_year}/>

            </Form.Group>

            <Form.Input  required value={card.cvv} name="cvv" onChange={(e, data) => setCard({ ...card, [data.name]: data.value })} label="card cvv" placeholder={"add card cvv"} error={error.cvv}/>

            <Form.Button color="teal" onClick={() => chargeCard()}>
                pay {amount} pounds
            </Form.Button>
        </Form>
    )
}


export default Payment