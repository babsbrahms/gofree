import React, { Component } from 'react'
import { Icon, Segment, Card, Form, Button, Popup, List, Label, Header } from 'semantic-ui-react';
import validator from "validator"
import { currentUser, updateData, fetchUserByEmail, fetchOrderById, serverTimestamp } from "../fbase";
import { getUrlParams, orderTite, orderIcon } from "../../utils/resources"
import "../css/style.css"
import styles from "../../styles"
import style from "../../styles"


export default class Checkout extends Component {
    state = { 
        activeItem: 'account',
        loadingAccount: true,
        loadingOrder: true,
        editAccount: true,
        user: {

        },
        data: {},
        errors: {},
        order: { },
        trackId: ""
    }

    componentDidMount() {
        let params = getUrlParams(this.props.location.search)
        console.log(params);
        if (params.oid) {
            this.setState({ trackId: params.oid }, () => {
                this.getOrder(params.oid)
            })
            
        } else {
            this.setState({ loadingOrder: false, loadingAccount: false })
        }

    }

    getOrder = (Id) => {
        if (Id) {
            fetchOrderById(Id, (res) => {
                if (res.id) {
                    this.setState({ order: res, loadingOrder: false }, () => {
                        this.getUser(res.email)
                    })
                    
                } else {
                    alert('Cannot find your order!') 
                }
            }, (err) => {
                this.setState({ loadingOrder: false })
                alert(err.message)
            })
        } else {
            alert('Add order id for tracking')
        }
    }
    
    getUser = (email) => {
        fetchUserByEmail(email, (res) => {
            this.setState({ loadingAccount: false, data: res, user: res })
        }, (err) => {
            this.setState({ loadingAccount: false })
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

    setUpInvoice = () => {
        const { order, user } = this.state;

        let date = serverTimestamp();

        this.setState({ loadingOrder: true }, () => {
            updateData("orders", order.id, {
                ...order,
                updatedAt : {
                    timestamp: new Date().getTime(),
                    month: new Date().getMonth(),
                    year: new Date().getFullYear(),
                    day: new Date().getDate()
                },
                address: user.address,
                paid: false,
                ready : true,
                status: "invoice-prep",
                date: {
                    ...order.date,
                    "invoice-prep": date
                }
            }, () => {
                this.setState({ loadingOrder: false })
                alert("We will send the payment link to your email");
            }, (err) => {
                this.setState({ loadingOrder: false })
                alert(err.message);
            })
        })
    }

    render() {
        const { activeItem, loadingAccount, user, errors, loadingOrder, data, order } = this.state;

        return (
            <div id="gofree-bg">
            <Segment id="gofree-topbar">
                <h1>Checkout</h1>
            </Segment>
            <div style={{ padding: 30 }}>


                <Segment id="gofree-content" loading={loadingAccount || loadingOrder} >
                    {(!data.id) && (
                        <div style={style.center}>
                            <Header textAlign icon>
                                <Icon circular name="shopping cart" />
                                Your order is empty!
                            </Header>
                        </div>
                    )}
                    {(data.id) && (<Segment style={{ backgroundColor: loadingAccount? "#ffffff" : "transparent" }} loading={loadingAccount}>
                        <Card fluid color="pink">
                            <Card.Content>
                                <div style={styles.betweenStart}>
                                    <Card.Header>
                                        ACCOUNT DETAILS
                                    </Card.Header>

                                </div>
                            </Card.Content>
                            <Card.Content>
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
                                        Update
                                    </Form.Button>
                                </Form>
                            </Card.Content>
                        </Card>
                    </Segment>)}
                    
                    {(!!order.id) && (!!data.id) && (<Segment loading={loadingOrder}>
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
                                    <List.Description>
                                        <Label basic color="pink" size="small" >
                                            TOTAL PRICE: {Number(order.price).toFixed(2)} {order.currency}
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
                                    <List.Description>
                                        {(order.status === "order") && (
                                            <Button circular color="black" onClick={() => this.setUpInvoice()}>
                                                Pay {Number(order.price).toFixed(2)} {order.currency}
                                            </Button>
                                        )}

                                        {(order.status !== "order") && (
                                            <h3>This order invoice has been sent</h3>
                                        )}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        </List>
                    </Segment>)}
                
                </Segment>
            </div>
        </div>
        )
    }
}
