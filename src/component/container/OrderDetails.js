import React, { useState, useRef, useEffect } from 'react'
import { Icon, Label, Card, List, Popup, Divider, Segment, Select, Input, Form, Button } from 'semantic-ui-react';
import "../css/style.css"
import { orderIcon, orderTite, orderStatus } from "../../utils/resources"
import { fetchUserByEmail, fetchOneOrder, updateData, serverTimestamp, addData, fetchOrderLogs } from "../fbase"
import styles from "../../styles"


export const OrderDetails = ({ id, adminName }) => {
    const unUser = useRef(null);
    const unOrder = useRef(null);
    const unLog = useRef(null)
    const mail_link_ref = useRef(null);
    const mail_price_ref = useRef(null)

    const [active, setActive] = useState("")
    const [user, setUser] = useState({})
    const [selectedOrder, setSelectedOrder] = useState({})
    const [loading, setLoading] = useState(true)
    const [editAccount, setEditAccount] = useState(false)
    const [errors, setErrors] = useState({})
    const [logs, setLogs] = useState([])

    useEffect(() => {
        unOrder.current = fetchOneOrder(id, (res) => {
            setLoading(false);
            setSelectedOrder(res)
            // console.log(res);
            getUser(res.email)
        })

        return() => {
            if (unUser.current) {
                unUser.current()
            }

            if (unOrder.current) {
                unOrder.current()
            }

            if (unLog.current) {
                unLog.current()
            }
        }
    }, [])

    const getUser = (email) => {
        unUser.current = fetchUserByEmail(email, (user) => {
            setUser(user)
        }, (err) => {
            alert(err.message);
        })
    }


    const getLogs = () => {
        if (!unLog.current) {
            setLoading(true)
            unLog.current = fetchOrderLogs(selectedOrder.id, (res) => {
                setLoading(false)
                setLogs(res)
            }, (err) => {
                console.log(err);
                setLoading(false)
                alert(err.message);
            })
        }

    }


    const sendInvoice = () => {
        setLoading(true);

        let date = serverTimestamp();

        updateData("orders", selectedOrder.id, {
            ...selectedOrder,
            status: "invoice-sent", 
            "paid": false, 
            "ready": true,
            date: {
                ...selectedOrder,
                "invoice-sent" : date
            },
            updatedAt : {
                timestamp: new Date().getTime(),
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                day: new Date().getDate()
            },
        }, () => {
            setLoading(false)

            // log
            addData("logs", {
                "text": `${adminName} added payment link`,
                "orderId": selectedOrder.id,
                "createdAt": date,
                "data": selectedOrder
            }, () =>  {
                mail_link_ref.current.click()
            }, (err) => {
                setLoading(false);
                alert(err.message)
            })

        }, (err) => {
            setLoading(false);
            alert(err.message)
        })
    }


    const changePrice = () => {
        setLoading(true);
        let date = serverTimestamp();

        updateData("orders", selectedOrder.id, selectedOrder, () => {
            setLoading(false)

            // log
            addData("logs", {
                "text": `${adminName} changed price to ${selectedOrder.price}`,
                "createdAt": date,
                "data": selectedOrder
            }, () =>  {
                mail_price_ref.current.click()
            }, (err) => {
                setLoading(false);
                alert(err.message)
            })
        }, (err) => {
            setLoading(false);
            alert(err.message)
        })
    }


    const revertLog = (log) => {
        setLoading(true);
        let date = serverTimestamp();

        updateData("orders", selectedOrder.id, log.data, () => {
            setLoading(false)

            // log
            addData("logs", {
                "text": `${adminName} reverted logs`,
                "orderId": selectedOrder.id,
                "createdAt": date,
                "data": selectedOrder
            }, () =>  {

            }, (err) => {
                setLoading(false);
                alert(err.message)
            })
        }, (err) => {
            setLoading(false);
            alert(err.message)
        })
    }

    const changeStatus = (status) => {
        setLoading(true);

        let date = serverTimestamp();

        let selected = orderStatus.find(x => x.status === status);

        updateData("orders", selectedOrder.id, {
            ...selectedOrder,
            status: status, 
            "paid": selected.paid || false, 
            "ready": selected.ready || false,
            date: {
                ...selectedOrder,
                [status] : date
            },
            updatedAt : {
                timestamp: new Date().getTime(),
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                day: new Date().getDate()
            },
        }, () => {
            setLoading(false)

            // log
            addData("logs", {
                "text": `${adminName} changed status to ${selected.text}`,
                "orderId": selectedOrder.id,
                "createdAt": date,
                "data": selectedOrder
            }, () =>  {

            }, (err) => {
                setLoading(false);
                alert(err.message)
            })
            
        }, (err) => {
            setLoading(false);
            alert(err.message)
        })
    }
   
    const addAddress = (data) => 
        setSelectedOrder({
            ...selectedOrder,
            address: {
                ...selectedOrder.address,
                [data.name]: data.value
            }
        })

    const validate = (data) => {
        let err = {}

            if (data.address) {
                if (!data.address.address) err.address = "Address is required";
                if (!data.address.city) err.city = "City is required";
                if (!data.address.state) err.state = "State is required";
                if (!data.address.country) err.country = "Country is required";
            } else {
                err.address = "Address is required";
                err.city = "City is required";
                err.state = "State is required";
                err.country = "Country is required";
            }

        return err
    }

    const saveAddress = () => {

        setErrors({});
        setLoading(true)

        let errors = validate(selectedOrder)

        if (Object.keys(errors).length === 0) {
            let date = serverTimestamp();

            updateData("orders", selectedOrder.id, selectedOrder, () => {
                setLoading(false)
                setEditAccount(false)
                // log
                addData("logs", {
                    "text": `${adminName} changed order address`,
                    "orderId": selectedOrder.id,
                    "createdAt": date,
                    "data": selectedOrder
                }, () =>  {
    
                }, (err) => {
                    setLoading(false);
                    alert(err.message)
                })
                
            }, (err) => {
                setLoading(false);
                alert(err.message)
            })
        } else {
            setErrors(errors);
            setLoading(false)
        }
        
    }

    return (

    <Segment loading={loading}>
        {(!!selectedOrder.id) && (<div>
            <p>
                <a style={{ cursor: "pointer", color: (active === "Change Status")? "#e04797" : "#548fca" }} onClick={() => setActive("Change Status")} >Change Status</a> | <a style={{ cursor: "pointer", color: (active === "Send Invoice")? "#e04797" : "#548fca" }} onClick={() => setActive("Send Invoice")}>Send Invoice</a> | <a style={{ cursor: "pointer", color: (active === "Change Price")? "#e04797" : "#548fca" }} onClick={() => setActive("Change Price")}>Change Price</a> {(active !== "") && (<span>| <Icon link onClick={() => setActive("")} name="cancel" color="red" /></span>)}
            </p>
            <div>
                {(active === "Change Status") && (
                    <Select value={selectedOrder.status} onChange={(e, data) => changeStatus(data.value)} placeholder='Change Order Status' options={orderStatus.map(x => ({ key: x.status, value: x.status, text: x.text }))} />
                )}

                {(active === "Send Invoice") && (
                    <Input 
                        action={{
                            color: 'teal',
                            labelPosition: "right",
                            icon: "search" ,
                            content: "Send Invoice" ,
                            onClick: () => sendInvoice()
                        }}
                        actionPosition="right"
                        placeholder='Enter Payment Link' 
                        defaultValue={selectedOrder.link}
                        onChange={(e,data) => setSelectedOrder({ ...selectedOrder, link: e.target.value })}
                        
                    />
                )}

                {(active === "Change Price") && (
                    <div>
                        <Input 
                            action={{
                                color: 'teal',
                                labelPosition: "right",
                                icon: "search" ,
                                content: "Change Price",
                                onClick: () => changePrice()
                            }}
                            actionPosition="right"
                            placeholder='Input New Pice' 
                            defaultValue={selectedOrder.price}
                            onChange={(e,data) => setSelectedOrder({ ...selectedOrder, price: e.target.value })}
                            
                        />

                    </div>
                )}

                {/* {(active === "Delete") && (
                    <Button>
                       Yes, Delete Order.
                    </Button>
                )} */}
            </div>
        
            <Divider />
            <Label basic>Order Id: {selectedOrder.id}</Label>
            <Label basic>Ordered Date: {selectedOrder.date && selectedOrder.date.order? selectedOrder.date['order'].toDate().toDateString() : "" } </Label>
            <h3>Customer Name: {user.name} </h3>
            <h3>Type: {selectedOrder.type} </h3>
            <h3>From: {selectedOrder.from}</h3>
            <h3>To: {selectedOrder.to}</h3>
            <h3>Pickup Location ({selectedOrder.pickup && selectedOrder.pickup.type}): {selectedOrder.pickup && selectedOrder.pickup.address}</h3>

            <Label basic color="pink" size="small">
                TOTAL PRICE: {Number(selectedOrder.price).toFixed(2)} {selectedOrder.currency}
            </Label>
            <Label basic color="pink" size="small">STATUS: {orderTite[selectedOrder.status]}</Label>
            <Popup trigger={<Icon name="info circle" color="black" />}>
                <Popup.Header>
                    7  transaction stages
                </Popup.Header>
                <Popup.Content>
                <Icon name={orderIcon.order} /> {orderTite.order}
                </Popup.Content>
                <Popup.Content>
                    <Icon name={orderIcon["invoice-prep"]} /> {orderTite["invoice-prep"]}
                </Popup.Content>
                <Popup.Content>
                    <Icon name={orderIcon["invoice-sent"]} /> {orderTite["invoice-sent"]}
                </Popup.Content>
                <Popup.Content>
                    <Icon name={orderIcon.payment} /> {orderTite.payment}
                </Popup.Content>
                <Popup.Content>
                    <Icon name={orderIcon.collection} /> {orderTite.collection}
                </Popup.Content>
                <Popup.Content>
                    <Icon name={orderIcon.shipping} />{orderTite.shipping}
                </Popup.Content>
                <Popup.Content>
                    <Icon name={orderIcon.delivery} />{orderTite.delivery}
                </Popup.Content>
            </Popup>
            {(selectedOrder.status === "delivery") && (<Label basic color="pink" size="small">DELIVERED ON: {orderIcon.date && orderIcon.date.delivery? orderIcon.date.delivery.toDate().toDateString() : "" }</Label>)}
            <Divider />
            <p style={{ textAlign: "center"}}>
                <b>PACKAGES</b>
            </p>
            
            <List divided relaxed >
                {selectedOrder.packages && selectedOrder.packages.map((pack) => 
                    <List.Item>
                        <List.Content floated='right'>
                            {Number(pack.price).toFixed(2)} {selectedOrder.currency}
                        </List.Content>
                        <List.Content>
                            <List.Header>{pack.length}CM * {pack.width}CM * {pack.height}CM * {pack.weight}KG <Popup trigger={<Icon name="info circle" />}>
                                    <Popup.Content> Length: {pack.length} CM </Popup.Content>
                                    <Popup.Content> Width: {pack.width} CM </Popup.Content>
                                    <Popup.Content> Height: {pack.height} CM </Popup.Content>
                                    <Popup.Content> Weight: {pack.weight} KG </Popup.Content>
                                </Popup>
                            </List.Header>
                        </List.Content>
                    </List.Item>
                )}
                <List.Item>
                    <List.Content floated='right'>
                        {Number(selectedOrder.handling).toFixed(2)} {selectedOrder.currency}
                    </List.Content>
                    <List.Content>
                        <List.Description>
                            HANDLING FEE:
                        </List.Description>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Content floated='right'>
                        {Number(selectedOrder.delivery).toFixed(2)} {selectedOrder.currency}
                    </List.Content>
                    <List.Content>
                        <List.Description>
                            DELIVERY FEE: 
                        </List.Description>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Content floated='right'>
                        <Label basic color="pink" >
                            {Number(selectedOrder.price).toFixed(2)} {selectedOrder.currency}
                        </Label>
                        
                    </List.Content>
                    <List.Content>
                        <List.Header>
                            TOTAL PRICE: 
                        </List.Header>
                    </List.Content>
                </List.Item>
            </List>

            <Divider />

            <Card.Group itemsPerRow="2" stackable>
                <Card link color="pink">
                    <Card.Content>
                        <div style={styles.betweenStart}>
                            <Card.Header>Logs</Card.Header>
                            
                            {(logs.length === 0) && (<Button loading={loading} disabled={loading} onClick={() => getLogs()}>
                                Get Logs
                            </Button>)}
                        </div>
                    </Card.Content>
                    <Card.Content>
                        
                        <div style={{ maxHeight: 250, overflowY: "auto"}}>
                            <List divided relaxed >
                                {logs.map((log) => 
                                    <List.Item key={log.id}>
                                        <List.Content floated='right'>
                                            <Button onClick={() => revertLog(log)}>Revert</Button>
                                        </List.Content>
                                        <List.Content>
                                            <List.Header>{log.text}</List.Header>
                                            <List.Description>
                                                {log.createdAt? `${log.createdAt.toDate().toDateString()} ${log.createdAt.toDate().toLocaleTimeString()}` : "" }
                                            </List.Description>
                                        </List.Content>
                                    </List.Item>
                                )}
                            </List>
                        </div>

                    </Card.Content>
                </Card>

                <Card link color="pink">
                    <Card.Content>
                        <div style={styles.betweenStart}>
                            <Card.Header>
                                Adresss
                            </Card.Header>

                            <Icon name="edit" color="blue" link onClick={() => setEditAccount(!editAccount)} />
                        </div>
                    </Card.Content>
                    {(!editAccount) && (<Card.Content>
                        {(selectedOrder.address) && (<Card.Description>
                            {selectedOrder.address.address}
                        </Card.Description>)}
                        {(selectedOrder.address) && (<Card.Description>
                            {selectedOrder.address.city} {selectedOrder.address.state}, {selectedOrder.address.country}
                        </Card.Description>)}
                    </Card.Content>)}

                    {(editAccount) && (
                    <Card.Content>
                        <Form> 

                            <Form.Input 
                                required
                                label="Address"
                                name="address" 
                                defaultValue={(selectedOrder.address && selectedOrder.address.address)? selectedOrder.address.address : ""}
                                onChange={(e, data) => addAddress(data)} 
                                placeholder={"add your address"}
                                error={errors.address}
                            />

                            <Form.Input 
                                required
                                label="City"
                                name="city" 
                                defaultValue={(selectedOrder.address && selectedOrder.address.address)? selectedOrder.address.city : ""}
                                onChange={(e, data) => addAddress(data)} 
                                placeholder={"add your city"}
                                error={errors.city}
                            />


                            <Form.Input 
                                required
                                label="State"
                                name="state" 
                                defaultValue={(selectedOrder.address && selectedOrder.address.address)? selectedOrder.address.state : ""}
                                onChange={(e, data) => addAddress(data)} 
                                placeholder={"add your state"}
                                error={errors.state}
                            />


                            <Form.Input 
                                required
                                label="Country"
                                name="country" 
                                defaultValue={(selectedOrder.address && selectedOrder.address.address)? selectedOrder.address.country : ""}
                                onChange={(e, data) => addAddress(data)} 
                                placeholder={"add your country"}
                                error={errors.country}
                            />

                            <Form.Button floated="right" onClick={() => saveAddress()} color='linkedin'>
                                Submit
                            </Form.Button>
                        </Form>
                    </Card.Content>)}
                </Card>
            </Card.Group>
                        
            <div style={{ width: 0, height: 0}}>
                <a ref={mail_link_ref} href={`mailto:${selectedOrder.email}?subject=Payment Link For Your GoFree Order&body=Use this link "${selectedOrder.link}" to pay for your order. \n You can track your order from the home page with this tracking Id: ${selectedOrder.id}.\n Thank you for using GoFree.`}></a>

                <a ref={mail_price_ref} href={`mailto:${selectedOrder.email}?subject=Your GoFree ${selectedOrder.type} price updated.`}></a>
            </div>
        </div>)}
    </Segment>
    )
}
