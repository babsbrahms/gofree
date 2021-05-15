import React, { Component } from 'react'
import { Table, Icon, Menu, Segment, Label, Card, Form, List, Button, Modal, Popup, Divider, Dropdown } from 'semantic-ui-react';
import validator from "validator"
import { Link } from "react-router-dom";
import { currentUser, signOut, fetchMySavedQuote, fetchMyOrders, fetchMyUser, updateData, deleteData, createProfileName } from "../fbase"
import "../css/style.css"
import styles from "../../styles"
import Quote from "../container/Quote"
import { orderIcon, orderTite } from "../../utils/resources"

export default class Account extends Component {
    state = { 
        activeItem: 'account',
        loadingAccount: true,
        loadingOrders: true,
        loadingQuote: true,
        editAccount: false,
        user: {

        },
        data: {},
        errors: {},
        openOrderDetail: false,
        selectedOrder: {},
        orders: [],
        quotes: []

    }

    componentDidMount() {
        let user = currentUser()
        if (user && user.uid) {
            this.getUser(user.uid)
            this.getOrder(user.email)
            this.getSaveQuote(user.email)
        }

    }


    componentWillUnmount() {
        if (this.unOrder) {
            this.unOrder()
        }

        if (this.unUser) {
            this.unUser()
        }

        if (this.unQuote) {
            this.unQuote()
        }
    }
    
    getUser = (id) => {
        this.unUser = fetchMyUser(id, (res) => {
            if (!res.uid) {
                const us = currentUser();

                createProfileName(us.uid, us.displayName, "", us.email)
                .then(() => {
                    this.setState({ loadingAccount: false, user: { email: us.email, name: us.displayName } })
                })
                .catch((err) => {
                    this.setState({ loadingAccount: false })
                    alert(err.message)
                })
            } else {
                this.setState({ loadingAccount: false, user:  res })
            }
            
        }, (err) => {
            this.setState({ loadingAccount: false })
            alert(err.message)
        })
    }
    
    getOrder = (email) => {
        this.unOrder = fetchMyOrders(email, (res) => {
            this.setState({ loadingOrders: false, orders:  res })
        }, (err) => {
            this.setState({ loadingOrders: false })
            alert(err.message)
        })
    }

    getSaveQuote = (email) => {
        this.unQuote = fetchMySavedQuote(email, (res) => {
            this.setState({ loadingQuote: false, quotes: res })
        },(err) => {
            this.setState({ loadingOrders: false })
            alert(err.message)
        })
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    addAddress = (data) => this.setState({ 
        data: {
            ...this.state.data,
            address: {
                ...this.state.data.address,
                [data.name]: data.value
            }
        }
    })

    addUserData = (data) => this.setState({ 
        data: {
            ...this.state.data,
            [data.name]: data.value
        }
    })

    validate = (data) => {
        let err = {}
            if (!data.name) err.name = "Name is required";
            if (!validator.isEmail(data.email || "")) err.email = "Enter a valid email"

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

    save = () => {
        const { data } = this.state;
        this.setState({ errors: {}, loadingAccount: true }, () => {
            let errors = this.validate(data)

            if (Object.keys(errors).length === 0) {
                let user = currentUser();

                if (user && user.uid) {
                    updateData("users", user.uid, {
                        ...data
                    }, () => {
                        this.setState({ loadingAccount: false })
                    }, () => {
                        this.setState({ loadingAccount: false })
                    })
                }
                
            } else {
                this.setState({ errors, loadingAccount: false })
            }
        })
    }

    deleteQuote = (id) => {
        this.setState({ loadingQuote: true }, () => {
            deleteData("orders", id, (res) => {
                this.setState({ loadingQuote: false })
            }, (err) => {
                alert(err.message)
                this.setState({ loadingQuote: false })
            })
        })

    }

    render() {
        const { activeItem, loadingAccount, user, errors, editAccount, openOrderDetail, selectedOrder, orders, loadingOrders, quotes, loadingQuote, data } = this.state;

        return (
            <div id="gofree-bg">
            <Segment id="gofree-topbar">
                <h1>My Account</h1>
            </Segment>
            <div style={{ padding: 30 }}>
                <Menu pointing stackable>
                    <Menu.Item
                        name='account'
                        icon="user"
                        active={activeItem === 'account'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name='orders'
                        icon='shopping cart'
                        active={activeItem === 'orders'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name='get quote'
                        icon='question circle outline' 
                        active={activeItem === 'get quote'}
                        onClick={this.handleItemClick}
                    />

                    <Menu.Item
                        name='saved quote'
                        icon='hdd' 
                        active={activeItem === 'saved quote'}
                        onClick={this.handleItemClick}
                    />

                </Menu>

                <Segment id="gofree-content" >
                    {(activeItem === 'account') && (
                    <Segment style={{ backgroundColor: loadingAccount? "#ffffff" : "transparent" }} loading={loadingAccount}>
                        <br />
                        <Card.Group itemsPerRow="2" centered stackable>
                            <Card color="pink">
                                <Card.Content>
                                    <div style={styles.betweenStart}>
                                        <Card.Header>
                                            ACCOUNT DETAILS
                                        </Card.Header>

                                        <Icon name="edit" color="blue" link onClick={() => this.setState({ editAccount: !editAccount, data: user })} />
                                    </div>
                                </Card.Content>
                                {(!editAccount) && (<Card.Content >
                                    <Card.Description>
                                        Name: {user.name}
                                    </Card.Description>
                                    <Card.Description>
                                        Email: {user.email}
                                    </Card.Description>
                                    {(user.address) && (<Card.Description>
                                        {user.address.address}
                                    </Card.Description>)}
                                    {(user.address) && (<Card.Description>
                                        {user.address.city} {user.address.state}, {user.address.country}
                                    </Card.Description>)}
                                </Card.Content>)}
                                {(!editAccount) && (<Card.Content extra>
                                    <Popup 
                                        on="click"
                                        trigger={
                                            <Button color="red" basic fluid>
                                                LOG OUT
                                            </Button>
                                        }
                                    >   
                                        <Popup.Header>
                                            Are you sure?
                                        </Popup.Header>
                                        <Popup.Content>
                                            <Button color="green" fluid onClick={() => signOut()}>Yes, log out</Button>
                                        </Popup.Content>
                                    </Popup>
        
                                </Card.Content>)}
                                {(editAccount) && (<Card.Content>
                                    <Form> 
                                        <Form.Input 
                                            required
                                            label="Name"
                                            name="name" 
                                            defaultValue={(data.name)? data.name : ""}
                                            onChange={(e, data) => this.addUserData(data)} 
                                            placeholder={"add your name"}
                                            error={errors.name}
                                        />

                                        <Form.Input 
                                            required
                                            label="Email"
                                            name="email" 
                                            type="email"
                                            defaultValue={(data.email)? data.email : ""}
                                            onChange={(e, data) => this.addUserData(data)} 
                                            placeholder={"add your email"}
                                            error={errors.email}
                                        />

                                        <Form.Input 
                                            required
                                            label="Address"
                                            name="address" 
                                            defaultValue={(data.address && data.address.address)? data.address.address : ""}
                                            onChange={(e, data) => this.addAddress(data)} 
                                            placeholder={"add your address"}
                                            error={errors.address}
                                        />

                                        <Form.Input 
                                            required
                                            label="City"
                                            name="city" 
                                            defaultValue={(data.address && data.address.address)? data.address.city : ""}
                                            onChange={(e, data) => this.addAddress(data)} 
                                            placeholder={"add your city"}
                                            error={errors.city}
                                        />


                                        <Form.Input 
                                            required
                                            label="State"
                                            name="state" 
                                            defaultValue={(data.address && data.address.address)? data.address.state : ""}
                                            onChange={(e, data) => this.addAddress(data)} 
                                            placeholder={"add your state"}
                                            error={errors.state}
                                        />


                                        <Form.Input 
                                            required
                                            label="Country"
                                            name="country" 
                                            defaultValue={(data.address && data.address.address)? data.address.country : ""}
                                            onChange={(e, data) => this.addAddress(data)} 
                                            placeholder={"add your country"}
                                            error={errors.country}
                                        />

                                        <Form.Button floated="right" onClick={() => this.save()} color='linkedin'>
                                            Submit
                                        </Form.Button>
                                    </Form>
                                </Card.Content>)}
                            </Card>
                        </Card.Group>
                    </Segment>
                    )}
                    {(activeItem === 'orders') &&  (
                    <Segment loading={loadingOrders}>
                        <List divided relaxed>
                            {orders.map(order => (
                            <List.Item key={order.id}>
                                <List.Content floated='right'>
                                    <Button size="mini" color="black" onClick={() => this.setState({ openOrderDetail: true, selectedOrder: order })}>VIEW DETAILS</Button>
                                </List.Content>
                                <List.Icon name={orderIcon[order.status]} size='large' verticalAlign='middle' />
                                <List.Content>
                                    <List.Header>{order.packages.length} {order.type}(s) from {order.from} to {order.to}</List.Header>
                                    <List.Description>
                                        Ordered on {order.date && order.date.order? order.date['order'].toDate().toDateString() : "" }
                                    </List.Description>
                                    <List.Description as='a'>Order Id: {order.id}</List.Description>
                                    <List.Description>
                                        <Label size="small" color="pink" basic>
                                            {orderTite[order.status]}
                                        </Label>
                                        <Popup trigger={<Icon name="info circle" color="black" />}>
                                            <Popup.Header>
                                                7 transaction stages
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
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                            ))}
                        </List>
                        {((orders.length === 0) && (!loadingOrders)) &&(
                            <p style={{ textAlign: "center" }}>
                                You don't have orders!
                            </p>
                        )}
                    </Segment>
                    )}


                    {(activeItem === 'get quote') && (
                        <Quote />
                    )}

                    {(activeItem === 'saved quote') &&  (
                    <Segment loading={loadingQuote}>
                        <List divided relaxed>
                            {quotes.map(quote => (
                            <List.Item key={quote.id}>
                                <List.Content floated='right'>
                                    <Dropdown icon="ellipsis vertical" pointing="right">
                                        <Dropdown.Menu>
                                            <Dropdown.Item as={Link} to={`/cart?oid=${quote.id}`} text='Add To Cart' />
                                            {/* <Dropdown.Item  text='Edit' /> */}
                                            <Popup on="click" trigger={<Dropdown.Item  text='Delete'  />}>
                                                <Popup.Header>Are you sure?</Popup.Header>
                                                <Popup.Content>
                                                    <Button loading={loadingQuote} disabled={loadingQuote} onClick={() => this.deleteQuote(quote.id)} color="red" fluid>Yes, delete it</Button>
                                                </Popup.Content>
                                            </Popup>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </List.Content>
                                <List.Icon name={orderIcon.order} />
                                <List.Content>
                                    <List.Header>{quote.packages.length} {quote.type} from {quote.from} to {quote.to}</List.Header>
                                    <List.Description>Saved on {quote.date && quote.date.order? quote.date['order'].toDate().toDateString() : "" }</List.Description>

                                    <List.List>
                                        {quote.packages.map((pack) => 
                                            <List.Item>
                                                <List.Content floated='right'>
                                                    {Number(pack.price).toFixed(2)} {quote.currency}
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
                                            {Number(quote.handling).toFixed(2)} {quote.currency}
                                        </List.Content>
                                        <List.Content>
                                            <List.Description>
                                                HANDLING FEE:
                                            </List.Description>
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Content floated='right'>
                                            {Number(quote.delivery).toFixed(2)} {quote.currency}
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
                                                {Number(quote.price).toFixed(2)} {quote.currency}
                                            </Label>
                                            
                                        </List.Content>
                                        <List.Content>
                                            <List.Header>
                                                TOTAL PRICE: 
                                            </List.Header>
                                        </List.Content>
                                    </List.Item>
                                </List.Content>
                            </List.Item>
                            ))}
                        </List>
                        {((quotes.length === 0) && (!loadingQuote)) &&(
                            <p style={{ textAlign: "center" }}>
                                You don't have saved quotes!
                            </p>
                        )}
                    </Segment>
                    )}

                    <Modal 
                        open={openOrderDetail}
                        onOpen={() => this.setState({ openOrderDetail: true })}
                        onClose={() => this.setState({ openOrderDetail: false })}
                        closeIcon
                        // dimmer="blurring"
                    >
                        <Modal.Header>
                            Order Details
                        </Modal.Header>
                        <Modal.Content>
                            <Label basic>Order Id: {selectedOrder.id}</Label>
                            <Label basic>Ordered Date: {selectedOrder.date && selectedOrder.date.order? selectedOrder.date['order'].toDate().toDateString() : "" } </Label>
                            {/* <h3>Title: </h3> */}
                            <h3>Type: {selectedOrder.type} </h3>
                            <h3>From: {selectedOrder.from}</h3>
                            <h3>To: {selectedOrder.to}</h3>

                            <Label basic color="pink" size="small">
                                TOTAL PRICE: {Number(selectedOrder.price).toFixed(2)} {selectedOrder.currency}
                            </Label>
                            <Label basic color="pink" size="small">STATUS: {orderTite[selectedOrder.status]}</Label>
                            <Popup trigger={<Icon name="info circle" color="black" />}>
                                <Popup.Header>
                                    5 transaction stages
                                </Popup.Header>
                                <Popup.Content>
                                <Icon name={orderIcon.order} /> {orderTite.order}
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
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color="black" onClick={() => this.setState({ openOrderDetail: false })}>
                                Close
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Segment>
            </div>
        </div>
        )
    }
}
