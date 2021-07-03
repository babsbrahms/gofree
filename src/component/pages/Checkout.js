import React, { Component } from 'react'
import { Icon, Segment, Card, Form, Button, Popup, List, Label, Header, Divider } from 'semantic-ui-react';
import validator from "validator"
import { currentUser, updateData, fetchUserByEmail, fetchOrderById, serverTimestamp, createProfileName } from "../fbase";
import { getUrlParams, orderTite, orderIcon } from "../../utils/resources"
import "../css/style.css"
import styles from "../../styles"
import style from "../../styles";
import { calcUnitPrice, deliveryOptions, nigeriaStates, ukStates } from "../../utils/resources"


export default class Checkout extends Component {
    state = { 
        activeItem: 'account',
        loadingAccount: true,
        loadingOrder: true,
        editAccount: true,
        user: {

        },
        data: {

        },
        errors: {},
        order: { },
        trackId: "",
        address: {
            billing: false,
            address: "",
            city: "",
            state: "",
            country: "" 
        },
        pickup: {
            type: "",
            address: "",
            city: "",
            state: "",
            country: ""
        },
        paymentMethod: ""
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
            if (!res.uid) {
                const us = currentUser();

                createProfileName(us.uid, us.displayName, "", us.email)
                .then(() => {
                    this.setState({ loadingAccount: false, user: { email: us.email, name: us.displayName }, data: { email: us.email, name: us.displayName } })
                })
                .catch((err) => {
                    this.setState({ loadingAccount: false })
                    alert(err.message)
                })
            } else {
                this.setState({ loadingAccount: false, user: res, data: res })
            }
            // this.setState({ loadingAccount: false, data: res, user: res })
        }, (err) => {
            this.setState({ loadingAccount: false })
            alert(err.message)
        })
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    addAddress = (data) => this.setState({ 
        address: {
            ...this.state.address,
            [data.name]: data.value
        }
    })

    // addUserData = (data) => this.setState({ 
    //     data: {
    //         ...this.state.data,
    //         [data.name]: data.value
    //     }
    // })

    addPickupAddress = (name, value) => this.setState({ pickup: { ...this.state.pickup, [name]: value  } })

    changePickupType = (type) => this.setState({ pickup: { ...this.state.pickup, type } }, () => {
        if (type === "office") {
            this.setState({
                pickup: { 
                    ...this.state.pickup,
                    address: "No: 724, Green Lane Dagenham, Essex.",
                    city: "Dagenham,",
                    state: "Essex",
                    country: "uk"
                }
            })
        } else {
            this.setState({
                pickup: { 
                    ...this.state.pickup,
                    address: "",
                    city: "",
                    state: "",
                    country: "uk"
                }
            })
        };
        this.setUpInvoice()
    })

    deliveryType = (billing) => {
        console.log(billing);
        this.setState((state, props) => {
            if (billing) {
                return {
                    address: { 
                        ...state.address,
                        billing: true,
                        ...state.data.address
                            // address: "No: 724, Green Lane Dagenham, Essex.",
                            // city: "Dagenham,",
                            // state: "Essex",
                            // country: "uk"
                    }
                }
            } else {
                return {
                    address: { 
                        ...state.address,
                        billing: false,
                        address: "",
                        city: "",
                        state: "",
                        country: ""
                    }
                }
            }
        })
    }

    setUpInvoice = () => {
        const { order, user, pickup, address } = this.state;

        let stateRate = deliveryOptions.find((x) => x.value === order.to)
        let calcPackage = order.packages.map((px) => ({
            ...px,
            price: calcUnitPrice(px.length, px.width, px.height, px.weight, order.type, pickup.type === "address"? (stateRate.rate + 1) : stateRate.rate)
        }));
        let totaQty = order.packages.reduce((acc, curr) => acc + curr.weight, 0)
        let deliveryFee = (totaQty >= 50)? 0 : 15;
        let totalPrice = calcPackage.reduce((prev, curr) => prev + curr.price, 0) + 20 + deliveryFee;

        this.setState({ 
            order: {
                ...this.state.order,
                packages: calcPackage,
                price: totalPrice,
                delivery: deliveryFee,
                handling: 20,
            }
         })
    } 

    validate = (address, pickup) => {
        let err = {}
            // if (!data.name) err.name = "Name is required";
            // if (!validator.isEmail(data.email || "")) err.email = "Enter a valid email"

                if (!address.address) err.address = "Address is required";
                if (!address.city) err.city = "City is required";
                if (!address.state) err.state = "State is required";
                if (!address.country) err.country = "Country is required";

                if (!pickup.type) err.p_type = "Collection type is required";
                if (!pickup.address) err.p_address = "Address is required";
                if (!pickup.city) err.p_city = "City is required";
                if (!pickup.state) err.p_state = "State is required";
                if (!pickup.country) err.p_country = "Country is required";

        return err
    }

    saveViaLink = () => {
        const { address, pickup, order } = this.state;
        this.setState({ errors: {}, loadingAccount: true }, () => {
            let errors = this.validate(address, pickup)

            if (Object.keys(errors).length === 0) {
                let date = serverTimestamp();

                this.setState({ loadingOrder: true }, () => {
                    updateData("orders", order.id, {
                        ...order,
                        // packages: order.packages,
                        // price: order.totalPrice,
                        // delivery: order.delivery,
                        // handling: 20,
                        updatedAt : {
                            timestamp: new Date().getTime(),
                            month: new Date().getMonth(),
                            year: new Date().getFullYear(),
                            day: new Date().getDate()
                        },
                        pickup: pickup,
                        address: address,
                        paid: false,
                        ready : true,
                        status: "invoice-prep",
                        date: {
                            ...order.date,
                            "invoice-prep": date
                        },
                        paymentMethod: "payment link"
                    }, () => {
                        this.setState({ loadingOrder: false })
                        alert("Payment will be sent to your email");
                        window.location.reload(true);
                    }, (err) => {
                        this.setState({ loadingOrder: false })
                        alert(err.message);
                    })
                })
                
            } else {
                this.setState({ errors, loadingAccount: false })
            }
        })
    }


    saveViaCard = () => {
        const { address, pickup, order } = this.state;
        this.setState({ errors: {}, loadingAccount: true }, () => {
            let errors = this.validate(address, pickup)

            if (Object.keys(errors).length === 0) {
                let date = serverTimestamp();

                this.setState({ loadingOrder: true }, () => {
                    updateData("orders", order.id, {
                        ...order,
                        // packages: order.packages,
                        // price: order.totalPrice,
                        // delivery: order.delivery,
                        // handling: 20,
                        updatedAt : {
                            timestamp: new Date().getTime(),
                            month: new Date().getMonth(),
                            year: new Date().getFullYear(),
                            day: new Date().getDate()
                        },
                        pickup: pickup,
                        address: address,
                        paid: true,
                        ready : true,
                        status: "invoice-prep",
                        date: {
                            ...order.date,
                            "invoice-prep": date
                        },
                        paymentMethod: "card"
                    }, () => {
                        this.setState({ loadingOrder: false })
                        alert("Your payment and order has been recieved");
                        window.location.reload(true);
                    }, (err) => {
                        this.setState({ loadingOrder: false })
                        alert(err.message);
                    })
                })
                
            } else {
                this.setState({ errors, loadingAccount: false })
            }
        })
    }

    openPaymentModal = () => {

    }

    render() {
        const { activeItem, loadingAccount, user, errors, loadingOrder, data, order, pickup, address, paymentMethod } = this.state;

        return (
            <div id="gofree-bg">
            <Segment id="gofree-topbar">
                <h1>Checkout</h1>
            </Segment>
            <div style={{ padding: 30 }}>


                <Segment id="gofree-content" loading={loadingAccount || loadingOrder} >
                    {(!order.id) && (
                        <div style={style.center}>
                            <Header textAlign icon>
                                <Icon circular name="shopping cart" />
                              {(!loadingAccount || !loadingOrder) && <p> Your order is empty!</p>} 
                            </Header>
                        </div>
                    )}

                <div id="gofree-grid">
                    {(data.id) && (<Segment style={{ backgroundColor: loadingAccount? "#ffffff" : "transparent" }} loading={loadingAccount}>
                        <Card fluid color="pink">
                            <Card.Content>
                                <div style={styles.betweenStart}>
                                    <Card.Header as="h3">
                                        COLLECTION ADDRESS
                                    </Card.Header>
                                </div>
                                <Form>
                                    <Form.Group inline >
                                        <Form.Radio
                                            label='our office (Free)'
                                            value={pickup.type}
                                            checked={pickup.type === 'office'}
                                            onChange={() => this.changePickupType("office")}
                                        />
                                        <Form.Radio
                                            label='3 mile from our office (Free)'
                                            value={pickup.type}
                                            checked={pickup.type === '3miles'}
                                            onChange={() => this.changePickupType("3miles")}
                                        />
                                        <Form.Radio
                                            label='pickup address (Paid)'
                                            value={pickup.type}
                                            checked={pickup.type === 'address'}
                                            onChange={() => this.changePickupType("address")}
                                        />
                                    </Form.Group>
                                    {(!!errors.p_type) && (
                                    <Label basic color="red" pointing="above">
                                        {errors.p_type}
                                    </Label>)}
                                    {(pickup.type === "address") && (<Form.Field>
                                        <small style={{ color: "black", marginBottom: 15, display: "block" }}><Icon name="asterisk" /> Address pickup attracts additional 1 pound per kg</small>
                                    </Form.Field>)}
                                    {(pickup.type === "3miles") && (<Form.Field>
                                        <small style={{ color: "black", marginBottom: 15, display: "block" }}><Icon name="asterisk" /> Free collection for addresses within 3 miles radius of our office.</small>
                                    </Form.Field>)}
                                    {(pickup.type === "office") && (<Form.Field>
                                        <small style={{ color: "black", marginBottom: 15, display: "block" }}><Icon name="asterisk" /> Bring your document/parcel to our office address listed below.<Icon name="hand point down outline" /> </small>
                                    </Form.Field>)}
                                </Form>
                            </Card.Content>
                            <Card.Content>
                                {(!pickup.type) && (<h4>
                                    Select a collection type <Icon name="hand point up outline" />
                                </h4>)}

                                {(pickup.type === "office") && (
                                    <h4>
                                        No: 724, Green Lane Dagenham, Essex. 
                                    </h4>
                                )}

                                {(!!pickup.type) && (pickup.type !== "office") && (<Form> 
                                    <Form.Input 
                                        required
                                        label="Address"
                                        name="address" 
                                        value={pickup.address || ""}
                                        onChange={(e, data) => this.addPickupAddress(data.name, data.value)} 
                                        placeholder={"add collection address"}
                                        error={errors.p_address}
                                    />

                                    <Form.Input 
                                        required
                                        label="City"
                                        name="city" 
                                        value={pickup.city || ""}
                                        onChange={(e, data) => this.addPickupAddress(data.name, data.value)} 
                                        placeholder={"add collection city"}
                                        error={errors.p_city}
                                    />


                                    <Form.Select
                                        options={ukStates.map((x) => ({ key: x, value: x, text: x }))} 
                                        search
                                        required
                                        label="State"
                                        name="state" 
                                        value={pickup.state || ""}
                                        onChange={(e, data) => this.addPickupAddress(data.name, data.value)} 
                                        placeholder={"add state state"}
                                        error={errors.p_state}
                                    />


                                    <Form.Select 
                                        options={[{ key: "uk", value: "uk", text: "uk" }]}
                                        required
                                        label="Country"
                                        name="country" 
                                        value={pickup.country || ""}
                                        onChange={(e, data) => this.addPickupAddress(data.name, data.value)} 
                                        placeholder={"add collection country"}
                                        error={errors.p_country}
                                    />
                                </Form>)}
                            </Card.Content>

                        </Card>
                    </Segment>)}


                    {(data.id) && (<Segment style={{ backgroundColor: loadingAccount? "#ffffff" : "transparent" }} loading={loadingAccount}>
                        <Card fluid color="pink">
                            <Card.Content>
                                <div style={styles.betweenStart}>
                                    <Card.Header as="h3">
                                    DELIVERY ADDRESS
                                    </Card.Header>
                                </div>
                                {(!!data.address && !!data.address.country) && (data.address.country.toLowerCase() === "nigeria") && (<Form>
                                    <Form.Group inline>
                                        <Form.Checkbox
                                            label='Use my billing address'
                                            value={address.billing}
                                            checked={address.billing}
                                            onChange={(e, data) => this.deliveryType(!data.value)}
                                        />
                                    </Form.Group>
                                </Form>)}
                            </Card.Content>
                            <Card.Content>
                                <Form> 
                                    <Form.Input 
                                        required
                                        label="Address"
                                        name="address" 
                                        value={address.address || ""}
                                        onChange={(e, data) => this.addAddress(data)} 
                                        placeholder={"add your address"}
                                        error={errors.address}
                                    />

                                    <Form.Input 
                                        required
                                        label="City"
                                        name="city" 
                                        value={address.city || ""}
                                        onChange={(e, data) => this.addAddress(data)} 
                                        placeholder={"add your city"}
                                        error={errors.city}
                                    />


                                    <Form.Select 
                                        options={nigeriaStates.map((x) => ({ key: x, value: x, text: x }))} 
                                        search
                                        required
                                        label="State"
                                        name="state" 
                                        value={address.state || ""}
                                        onChange={(e, data) => this.addAddress(data)} 
                                        placeholder={"add your state"}
                                        error={errors.state}
                                    />


                                    <Form.Select
                                        options={[{ key: "nigeria", value: "nigeria", text: "nigeria" }]} 
                                        required
                                        label="Country"
                                        name="country" 
                                        value={address.country || ""}
                                        onChange={(e, data) => this.addAddress(data)} 
                                        placeholder={"add your country"}
                                        error={errors.country}
                                    />
                                </Form>
                            </Card.Content>

                        </Card>
                    </Segment>)}
                    </div>

                    {(!!order.id) && (user.address && user.address.address) && (
                    <Segment loading={loadingOrder}>
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
                                    {/* <h3>Payment Method</h3> */}
                                    <Form.Group inline>
                                        <label style={{ fontSize: 20, fontWeight: "500" }}>Payment Method</label>
                                        <Form.Radio
                                            label='Payment Link'
                                            value={paymentMethod}
                                            checked={paymentMethod === "paymentLink"}
                                            onChange={() => this.setState({ paymentMethod: "paymentLink"})}
                                        />
                                        <Form.Radio
                                            label='Card'
                                            value={paymentMethod}
                                            checked={paymentMethod === "card"}
                                            onChange={() => this.setState({ paymentMethod: "card"})}
                                        />

                                    </Form.Group>
                                    <br />
                                    <br />
                                    <List.Description>
                                        {(order.status === "order") &&  (
                                            <>
                                                {(paymentMethod === "paymentLink") && (
                                                <Button circular color="black" onClick={() => this.saveViaLink()}>
                                                    Pay {Number(order.price).toFixed(2)} {order.currency}
                                                </Button>)}

                                                {(paymentMethod === "card") && (
                                                <Button circular color="black" onClick={() => this.openPaymentModal()}>
                                                    Pay {Number(order.price).toFixed(2)} {order.currency}
                                                </Button>)}
                                            </>
                                        )}

                                        {(order.status !== "order") && (
                                            <h3>Your order has been received</h3>
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
