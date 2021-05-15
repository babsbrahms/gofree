import React, { useState, useEffect } from 'react'
import { Segment, Icon, Header, Button, Dimmer, Loader, Image, List , Popup, Label, Divider} from "semantic-ui-react";
import { Link } from "react-router-dom";
import "../css/style.css"
import { fetchOrderById } from "../fbase";
import { getUrlParams, orderTite, orderIcon } from "../../utils/resources"
import Quote from "../container/Quote";
import style from "../../styles"

const Cart = (props) => {
    let [showQuote, setShowQuote] = useState(false)
    let [order, setOrder] = useState({})
    let [loading, setLoading] = useState(true);
    let [trackId, setTrackId] = useState("");


    useEffect(() => {
        let params = getUrlParams(props.location.search)
        console.log(params);
        if (params.oid) {
            setTrackId(params.oid)
            getOrder(params.oid)
        } else {
            setLoading(false)
        }
    }, [])

    const getOrder = (Id) => {
        if (Id) {
            setLoading(true)
            fetchOrderById(Id, (res) => {
                setLoading(false)
                if (res.id) {
                    setOrder(res)
                } else {
                    alert('Cannot find your order!') 
                }
            }, (err) => {
                setLoading(false)
                alert(err.message)
            })
        } else {
            setLoading(false)
            alert('Add order id for tracking')
        }
    }

    return (
        <div id="gofree-bg">
            <Segment id="gofree-topbar">
                <h1>Cart</h1>
            </Segment>

            <div style={{ padding: 30 }}>
                {(loading) && (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader inverted />
                        </Dimmer>
                        <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                    </Segment>
                )}

                {(!order.id) && (!loading) && (<div style={style.center}>
                    <Header textAlign icon>
                        <Icon circular name="shopping cart" />
                        Your cart is empty!
                    </Header>
                </div>)}

                {(order.id) && (!loading) && (
                <Segment>
                    <List divided relaxed>
                        <List.Item>

                            <List.Icon name={orderIcon[order.status]} />
                            <List.Content>
                                <List.Header>{order.packages.length} {order.type} from {order.from} to {order.to}</List.Header>
                                <List.Description>
                                    Ordered on {order.date && order.date.order? order.date['order'].toDate().toDateString() : "" }
                                </List.Description>
                                <List.Description>
                                    <Label basic color="pink" size="small" >
                                        STATUS: {orderTite[order.status]}
                                    </Label>
                                </List.Description>
                                <List.List>
                                    {order.packages.map((pack) => 
                                        <List.Item>
                                            <List.Content floated='right'>
                                                {Number(pack.price).toFixed(2)} {order.currency}
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
                                </List.List>
                                <List.Item>
                                    <List.Content floated='right'>
                                        {Number(order.handling).toFixed(2)} {order.currency}
                                    </List.Content>
                                    <List.Content>
                                        <List.Description>
                                            HANDLING FEE:
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Content floated='right'>
                                        {Number(order.delivery).toFixed(2)} {order.currency}
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
                                            {Number(order.price).toFixed(2)} {order.currency}
                                        </Label>
                                        
                                    </List.Content>
                                    <List.Content>
                                        <List.Header>
                                            TOTAL PRICE: 
                                        </List.Header>
                                    </List.Content>
                                </List.Item>
                                <Divider />
                                <List.Description>
                                    {(!order.paid) && (
                                        <Button circular color="black" as={Link} to={`/checkout?oid=${trackId}`}>
                                            Proceed To Checkout
                                        </Button>
                                    )}

                                    {(order.paid) && (
                                        <h3>This order has been paid for</h3>
                                    )}
                                </List.Description>
                            </List.Content>
                        </List.Item>
                    </List>
                </Segment>
                )}

                {(!order.id) && (!loading) && (<Segment color={showQuote? "blue" : "pink"} raised stacked style={{ paddingBottom: 30, backgroundColor: showQuote? "steelblue" : "#fff",borderRadius: 5, marginBottom: 50, padding: 10 }}>
                    <h2>GET QUOTE</h2>
                    {(!showQuote) && (<Button color="black" circular onClick={() => setShowQuote(true)}>Click Here To Get Quote</Button>)}
                    {(showQuote) && (<div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                        <Icon circular inverted color="red" name="close" link onClick={() => setShowQuote(false)} />
                    </div>)}
                    {(showQuote) && (<Quote />)}
                </Segment>)}
            </div>
        </div>
    )
}

export default Cart
