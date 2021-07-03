import React, { useState     } from 'react'
import { Segment, Input, List, Form } from "semantic-ui-react";
import axios from "axios"

export const AddressFromZipcode = () => {
    const [postcode, setpostcode] = useState("");
    const [list, setList] = useState([]);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAddress = () => {
        setLoading(true);
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${postcode}&key=${"AIzaSyDtdfd32Vdb5tiGsopkyHcU-2XilGiuVv0"}`)
        .then(res => {
            setLoading(false)
            console.log(res.data);
        })
        .catch(err => {
            console.log(err.response.data);
            setLoading(false)
            setError(err.response.data.error_message)
        })
    }
    return (
        <Segment loading={loading}>
            <Form>
                <Input
                    action={{
                        color: 'teal',
                        labelPosition: 'right',
                        icon: 'search',
                        content: 'Search',
                        onClick: () => getAddress()
                    }}
                    defaultValue={postcode}
                    onChange={(e, data) => setpostcode(data.value)}
                    placeholder={"Enter postcode"}
                />
                <button onClick={() => getAddress()}>Get address</button>
                <p style={{ backgroundColor: "red"}}>{error}</p>
            </Form>
        </Segment>
    )
}
