import React, { useState, useRef, useEffect } from 'react'
import { Icon, Label, Card, List, Popup, Divider, Segment, Select, Input } from 'semantic-ui-react';
import "../css/style.css"
import { orderIcon, orderTite, orderStatus } from "../../utils/resources"
import { fetchUserByEmail, fetchOneOrder, updateData, serverTimestamp } from "../fbase"


export const OrderDetails = ({ id }) => {
    const unUser = useRef(null);
    const unOrder = useRef(null)

    const [active, setActive] = useState("")
    const [user, setUser] = useState({})
    const [selectedOrder, setSelectedOrder] = useState({})
    const [loading, setLoading] = useState(true)

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
        }
    }, [])

    const getUser = (email) => {
        unUser.current = fetchUserByEmail(email, (user) => {
            setUser(user)
        }, (err) => {
            console.log(err.message);
        })
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


        }, (err) => {
            setLoading(false);
            alert(err.message)
        })
    }


    const changePrice = () => {
        setLoading(true);

        updateData("orders", selectedOrder.id, selectedOrder, () => {
            setLoading(false)

            
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

            
        }, (err) => {
            setLoading(false);
            alert(err.message)
        })
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
            </List>

            <Divider />

            <Card.Group itemsPerRow="2" stackable>
                <Card link color="pink">
                    <Card.Content>
                        <Card.Header>Payment</Card.Header>
                    </Card.Content>
                    <Card.Content>

                    </Card.Content>
                </Card>

                <Card link color="pink">
                    <Card.Content>
                        <Card.Header>Adresss</Card.Header>
                    </Card.Content>
                    <Card.Content>
                        {(selectedOrder.address) && (<Card.Description>
                            {selectedOrder.address.address}
                        </Card.Description>)}
                        {(selectedOrder.address) && (<Card.Description>
                            {selectedOrder.address.city} {selectedOrder.address.state}, {selectedOrder.address.country}
                        </Card.Description>)}
                    </Card.Content>
                </Card>
            </Card.Group>
        </div>)}
    </Segment>
    )
}
