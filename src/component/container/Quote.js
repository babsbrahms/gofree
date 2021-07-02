import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Input, Icon, List, Label, Segment } from "semantic-ui-react";
import validator from "validator";
import { addData as AddOrder, currentUser, serverTimestamp, fetchUserByEmail } from "../fbase";
import { calcUnitPrice, deliveryOptions } from "../../utils/resources"

const fromOption = [
    { key: 'UK', text: 'UK', value: 'uk' },
]


// [
//     { key: 'Nigeria-abuja', text: 'Nigeria-abuja', value: 'nigeria-abuja', rate: 5 },
//     { key: 'Nigeria-lagos', text: 'Nigeria-lagos', value: 'nigeria-lagos', rate: 4.5 },
//     { key: 'Nigeria-others', text: 'Nigeria-others', value: 'nigeria-others', rate: 5 },
// ]

const typeOptions = [
    { key: 'parcel', text: 'Parcel', value: 'parcel' },
    { key: 'document', text: 'Document', value: 'document' },
]

const Quote = ({ backgroundColor }) => {
    const myUser = useRef(null)
    const [data, setData] = useState({
        type: "parcel",
        from: "uk",
        to: "",
        // where: "lagos",
        email: ""
    })
    const [packages, SetPackages] = useState([{ weight: "", height: "", length: "", width: "", price: 0 }]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        let user = currentUser();

        if (user && user.email) {
            setData({ ...data, email: user.email })
            setIsAuth(true)

            return () => {

            }
        }
    }, [])

    const addPackage = () => SetPackages([...packages, { weight: "", height: "", length: "", width: "" }]);

    const removePackage = (index) => {
        packages.splice(index, 1);
        SetPackages([ ...packages ])
    }

    const addItemToPackage = (data, index) => {
        let pk = {
            ...packages[index],
            [data.name] : Math.abs(parseFloat(data.value)) 
        }
        packages[index] = pk;
        SetPackages([ ...packages ])
    }

    const addData = ({ name, value}) => setData({ ...data, [name]: value })

    const validate = (data, packages) => {
        let err = {}
            if (!data.type) err.type = "This field is required";
            if (!validator.isEmail(data.email || "")) err.email = "Enter a valid email"
            if (!data.from) err.from = "This field is required";
            if (!data.to) err.to = "This field is required";
            if (packages.length === 0) {
                err.emptyPackage = "Add a minimum of one package to get a quote"
            } else  {
                let hasError = false
                let list = packages.map(pk => {
                    if (!pk.weight || !pk.height || !pk.length || !pk.width) {
                        hasError = true;
                    }
                    return {
                        weight: !Boolean(pk.weight) , height: !Boolean(pk.height), length: !Boolean(pk.length), width: !Boolean(pk.width)
                    }
                });

                if (hasError) {
                    err.packages = list;
                }
            }
        return err
    }

    const getQuote = () => {
        setErrors({})
        setLoading(true)
        let errors = validate(data, packages)
        console.log(errors);
        if (Object.keys(errors).length === 0) {
            

            let stateRate = deliveryOptions.find((x) => x.value === data.to)
            let calcPackage = packages.map((px) => ({
                ...px,
                price: calcUnitPrice(px.length, px.width, px.height, px.weight, data.type, stateRate.rate)
            }));
            let totaQty = packages.reduce((acc, curr) => acc + curr.weight, 0)
            let deliveryFee = (totaQty >= 50)? 0 : 15;
            let totalPrice = calcPackage.reduce((prev, curr) => prev + curr.price, 0) + 20 + deliveryFee;
            let date = serverTimestamp()
            AddOrder("orders", {
                "from": data.from,
                "to": data.to,
                "type": data.type,
                "packages": calcPackage,
                "email": data.email,
                "status": "order",
                "paid": false,
                "ready": false,
                "date": {
                    "order": date
                },
                "price": totalPrice,
                "delivery": deliveryFee,
                "handling": 20,
                "currency": "Pounds",
                "address": {
      
                },
                "payment": {
        
                }
            }, (res) => {
                let oid = res.id;
                setLoading(false);

                window.location.href= `/cart?oid=${oid}`;
                // if (isAuth) {
                //     // move to order page
                // //    props.history.push(`/order?oid=${res.id}`)
                //    window.location.href= `/cart?oid=${oid}`
                // } else {
                //     // find out if is user
                //     myUser.current = fetchUserByEmail(data.email, (res) => {
                //         if (res.email) {
                //             // move to order page
                //         //    props.history.push(`/order?oid=${res.id}`)
                //            window.location.href= `/cart?oid=${oid}`
                //         } else {
                //             alert("Quote has been sent to your email")
                //         }
                //     }, (err) => {
                //         console.log("USER BT EMAIL ERR:: ",err);
                //         alert(err.message)
                //     })
                // }
            }, (err) => {
                console.log("ALL ORDER ERR:: ",err);
                alert(err.message)
                setLoading(false)
            })
        } else {
            setErrors(errors)
            setLoading(false)
        }
    }

    return (
        <Segment textAlign="left" loading={loading} style={{ padding: 20, backgroundColor }}>
            <Form>
                <Form.Field>
                    <label>Type</label>
                    {/* <Form.Dropdown
                        label="Type"
                        fluid
                        search
                        selection
                        options={typeOptions}
                        placeholder="Collect From"
                        defaultValue={data.type}
                        name="type"
                        onChange={(e, data) => addData(data)}
                        placeholder={"Parcel or package"}
                        error={errors.type}
                    /> */}
                      <Button.Group fluid>
                        {typeOptions.map(type => <Button color={type.value === data.type? "black" :  ""}  name="type" onClick={(e,) => addData({ name: "type", value: type.value})} key={type.key} active={type.value === data.type}>{type.text}</Button>)}
                    </Button.Group>
                </Form.Field>
                <Form.Group widths='equal'>
                    <Form.Field>
                        <Form.Dropdown
                            label="Sending From (UK)"
                            fluid
                            search
                            selection
                            options={fromOption}
                            placeholder="Collect From"
                            defaultValue={data.from}
                            name="from"
                            onChange={(e, data) => addData(data)}
                            placeholder={"Add pakage or parcel pick up location"}
                            error={errors.from}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Form.Dropdown
                            fluid
                            search
                            label={"Deliver To (Nigeria)"}
                            selection
                            options={deliveryOptions}
                            placeholder="Deliver To"
                            defaultValue={data.to}
                            name="to"
                            onChange={(e, data) => addData(data)}
                            placeholder={"Add pakage or parcel destination"}
                            error={errors.to}
                        />
                        <small style={{ color: "black"}}>We do not deliver to Borno, Maiduguri</small>
                    </Form.Field>
                </Form.Group>

                <Form.Field>
                    <Form.Input 
                        label="Email"
                        fluid
                        defaultValue={data.email}
                        name="email"
                        onChange={(e, data) => addData(data)}
                        placeholder={"Add your email address"}
                        error={errors.email}
                    />
                </Form.Field>

                <List divided relaxed>
                    {packages.map((pack, index) => (
                    <List.Item key={`package-${index}`}>
                        <List.Icon link name="remove circle" onClick={() => removePackage(index)} color="red" size='large' verticalAlign='middle' />
                        <List.Content>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <label>Weight</label>
                                    <Input
                                        label={{ basic: true, content: 'kg' }}
                                        labelPosition='right'
                                        placeholder='Enter weight...'
                                        type="number"
                                        name="weight"
                                        onChange={(e, data) => addItemToPackage(data, index)} 
                                        defaultValue={pack.weight}   
                                        error={errors.packages && errors.packages[index] && errors.packages[index].weight && { content: "Required!!"}} 
                                    />
                                    {(errors.packages && errors.packages[index] && errors.packages[index].weight) &&(
                                        <Label size="small" basic color="red" pointing="above">
                                            Required
                                        </Label>
                                    )}
                                </Form.Field>
                                <Form.Field>
                                    <label>Length</label>
                                    <Input
                                        label={{ basic: true, content: 'cm' }}
                                        labelPosition='right'
                                        placeholder='Enter Length...'
                                        type="number"
                                        name="length"
                                        onChange={(e, data) => addItemToPackage(data, index)}
                                        defaultValue={pack.length}
                                        error={errors.packages &&  errors.packages[index] && errors.packages[index].length && { content: "Required!!"}}
                                    />
                                    {(errors.packages && errors.packages[index] && errors.packages[index].length) &&(
                                        <Label size="small" basic color="red" pointing="above">
                                            Required
                                        </Label>
                                    )}
                                </Form.Field>
                                <Form.Field>
                                    <label>Width</label>
                                    <Input
                                        label={{ basic: true, content: 'cm' }}
                                        labelPosition='right'
                                        placeholder='Enter Width...'
                                        type="number"
                                        name="width"
                                        onChange={(e, data) => addItemToPackage(data, index)}
                                        defaultValue={pack.width}
                                        error={errors.packages && errors.packages[index] && errors.packages[index].width && { content: "Required!!"}}
                                    />
                                    {(errors.packages && errors.packages[index] && errors.packages[index].width) &&(
                                        <Label size="small" basic color="red" pointing="above">
                                            Required
                                        </Label>
                                    )}
                                </Form.Field>
                                <Form.Field>
                                    <label>Height</label>
                                    <Input
                                        label={{ basic: true, content: 'cm' }}
                                        labelPosition='right'
                                        placeholder='Enter Height...'
                                        type="number"
                                        name="height"
                                        onChange={(e, data) => addItemToPackage(data, index)}
                                        defaultValue={pack.height}
                                        error={errors.packages && errors.packages[index] && errors.packages[index].height && { content: "Required!!"}}
                                    />
                                    {(errors.packages && errors.packages[index] && errors.packages[index].height) && (
                                    <Label size="small" basic pointing="above" color="red">
                                        Required
                                    </Label>)}
                                </Form.Field>
                            </Form.Group>
                        </List.Content>
                    </List.Item>))}


                    <List.Item>
                        <Label onClick={() => addPackage()} color="green" as="a" ><Icon name="add circle" /> Add {data.type}</Label>
                        {/* <List.Icon onClick={() => addPackage()} name="add circle" color="green" size='large' verticalAlign='middle' />
                        <List.Content>
                        </List.Content> */}
                    </List.Item>
                </List>
                {(!!errors.emptyPackage) && (
                    <p style={{ textAlign: "center", color: "red"}}>
                        <b>
                            {errors.emptyPackage}
                        </b>
                    </p>
                )}
            
                <Segment clearing>
                    <Button floated="right" color={"black"} type='submit' onClick={() => getQuote()} >GET QUOTE</Button>
                </Segment>
                
            </Form>
        </Segment>
    )
}

Quote.defaultProps = {
    backgroundColor:  "white"
}

export default Quote
