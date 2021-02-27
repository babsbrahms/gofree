import React, { useState, useRef, useEffect } from 'react'
import { Icon, Label, Card, List, Popup, Divider } from 'semantic-ui-react';
import "../css/style.css"
import { orderIcon, orderTite } from "../../utils/resources"
import { fetchUserByEmail } from "../fbase"


export const OrderDetails = ({ selectedOrder }) => {

    const [user, setUser] = useState({})
    const unUser = useRef(null)

    useEffect(() => {
        unUser.current = fetchUserByEmail(selectedOrder.email, (user) => {
        setUser(user)
    }, (err) => {
        console.log(err.message);
    })

        return() => {
            if (unUser.current) {
                unUser.current()
            }
            
        }
    })

    return (
        <div>
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
        </div>
    )
}
