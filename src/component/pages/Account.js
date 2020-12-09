import React, { Component } from 'react'
import { Table, Icon, Menu, Segment, Label, Card, Form, List, Button, Modal, Popup, Divider } from 'semantic-ui-react';
import { currentUser } from "../fbase"
import "../css/style.css"
import styles from "../../styles"
import Quote from "../container/Quote"
import { orderStatus, orderTite } from "../../utils/resources"

export default class Account extends Component {
    state = { 
        activeItem: 'account',
        loadingAccount: false,
        editAccount: false,
        user: {},
        data: {},
        errors: {},
        openOrderDetail: false,
        selectedOrder: {},
        orders: []

    }

    componentDidMount() {
        this.getUser()
    }
    
    getUser = () => {
        let user = currentUser()
        this.setState({ user: user || {} })
        
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    addAddress = (data) => this.setState({ 
        user: {
            ...this.state.user,
            address: {
                [data.name]: data.value
            }
        }
    })

    addUserData = (data) => this.setState({ 
        user: {
            ...this.state.user,
            [data.name]: data.value
        }
    })

    render() {
        const { activeItem, loadingAccount, user, errors, editAccount, openOrderDetail, selectedOrder } = this.state;

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
                    <Segment style={{ backgroundColor: "transparent" }} loading={loadingAccount}>
                        <br />
                        <Card.Group itemsPerRow="2" centered stackable>
                            <Card>
                                <Card.Content>
                                    <div style={styles.betweenStart}>
                                        <Card.Header>
                                            ACCOUNT DETAILS
                                        </Card.Header>

                                        <Icon name="edit" color="blue" link onClick={() => this.setState({ editAccount: !editAccount})} />
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
                                {(editAccount) && (<Card.Content>
                                    <Form>
                                        
                                        <Form.Input 
                                            label="name"
                                            name="name" 
                                            defaultValue={(user.name)? user.name : ""}
                                            onChange={(e, data) => this.addUserData(data)} 
                                            placeholder={"add your name"}
                                            error={errors.address}
                                        />

                                        <Form.Input 
                                            label="email"
                                            name="email" 
                                            type="email"
                                            defaultValue={(user.email)? user.email : ""}
                                            onChange={(e, data) => this.addUserData(data)} 
                                            placeholder={"add your email"}
                                            error={errors.address}
                                        />

                                        <Form.Input 
                                            label="address"
                                            name="address" 
                                            defaultValue={(user.address && user.address.address)? user.address.address : ""}
                                            onChange={(e, data) => this.addAddress(data)} 
                                            placeholder={"add your address"}
                                            error={errors.address}
                                        />

                                        <Form.Input 
                                            label="city"
                                            name="city" 
                                            defaultValue={(user.address && user.address.address)? user.address.city : ""}
                                            onChange={(e, data) => this.addAddress(data)} 
                                            placeholder={"add your city"}
                                            error={errors.address}
                                        />


                                        <Form.Input 
                                            label="state"
                                            name="state" 
                                            defaultValue={(user.address && user.address.address)? user.address.state : ""}
                                            onChange={(e, data) => this.addAddress(data)} 
                                            placeholder={"add your state"}
                                            error={errors.address}
                                        />


                                        <Form.Input 
                                            label="country"
                                            name="country" 
                                            defaultValue={(user.address && user.address.address)? user.address.country : ""}
                                            onChange={(e, data) => this.addAddress(data)} 
                                            placeholder={"add your country"}
                                            error={errors.address}
                                        />

                                        <Form.Button color="linkedin">
                                            Submit
                                        </Form.Button>
                                    </Form>
                                </Card.Content>)}
                            </Card>
                        </Card.Group>
                    </Segment>
                    )}
                    {(activeItem === 'orders') &&  (
                    <Segment>
                        <List divided relaxed>
                            <List.Item>
                                <List.Content floated='right'>
                                    <Button size="small" color="black" onClick={() => this.setState({ openOrderDetail: true })}>VIEW DETAILS</Button>
                                </List.Content>
                                <List.Icon name={orderStatus.payment} size='large' verticalAlign='middle' />
                                <List.Content>
                                    <List.Header>5 parcel from uk to nigeria</List.Header>
                                    <List.Description>
                                        Order on 24th dec 2020
                                    </List.Description>
                                    <List.Description as='a'>order no: 2233444</List.Description>
                                    <List.Description>
                                        <Label size="small" color="pink" basic>
                                            {orderTite.payment}
                                        </Label>
                                        <Popup trigger={<Icon name="info circle" color="black" />}>
                                            <Popup.Header>
                                                5 transaction stages
                                            </Popup.Header>
                                            <Popup.Content>
                                               <Icon name={orderStatus.order} /> {orderTite.order}
                                            </Popup.Content>
                                            <Popup.Content>
                                                <Icon name={orderStatus.payment} /> {orderTite.payment}
                                            </Popup.Content>
                                            <Popup.Content>
                                                <Icon name={orderStatus.collection} /> {orderTite.collection}
                                            </Popup.Content>
                                            <Popup.Content>
                                                <Icon name={orderStatus.shipping} />{orderTite.shipping}
                                            </Popup.Content>
                                            <Popup.Content>
                                                <Icon name={orderStatus.delivery} />{orderTite.delivery}
                                            </Popup.Content>
                                        </Popup>
                                    </List.Description>
                                </List.Content>
                            </List.Item>

                        </List>
                    </Segment>
                    )}


                    {(activeItem === 'get quote') && (
                        <Quote color="linkedin" bg="steelblue" />
                    )}

                    {(activeItem === 'saved quote') &&  (
                    <Table celled unstackable>
                        <Table.Header>
                            <Table.Row>
                            <Table.HeaderCell>Header</Table.HeaderCell>
                            <Table.HeaderCell>Header</Table.HeaderCell>
                            <Table.HeaderCell>Header</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            <Table.Row>
                            <Table.Cell>
                                <Label ribbon>First</Label>
                            </Table.Cell>
                            <Table.Cell>Cell</Table.Cell>
                            <Table.Cell>Cell</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                            <Table.Cell>Cell</Table.Cell>
                            <Table.Cell>Cell</Table.Cell>
                            <Table.Cell>Cell</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                            <Table.Cell>Cell</Table.Cell>
                            <Table.Cell>Cell</Table.Cell>
                            <Table.Cell>Cell</Table.Cell>
                            </Table.Row>
                        </Table.Body>

                        <Table.Footer>
                            <Table.Row>
                            <Table.HeaderCell colSpan='3'>
                                <Menu floated='right' pagination>
                                <Menu.Item as='a' icon>
                                    <Icon name='chevron left' />
                                </Menu.Item>
                                <Menu.Item as='a'>1</Menu.Item>
                                <Menu.Item as='a'>2</Menu.Item>
                                <Menu.Item as='a'>3</Menu.Item>
                                <Menu.Item as='a'>4</Menu.Item>
                                <Menu.Item as='a' icon>
                                    <Icon name='chevron right' />
                                </Menu.Item>
                                </Menu>
                            </Table.HeaderCell>
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                    )}

                    <Modal 
                        open={openOrderDetail}
                        onOpen={() => this.setState({ openOrderDetail: true })}
                        onClose={() => this.setState({ openOrderDetail: false })}
                        closeIcon
                        dimmer="blurring"
                    >
                        <Modal.Header>
                            Order Details
                        </Modal.Header>
                        <Modal.Content>
                            <Label basic>Order No: </Label>
                            <Label basic>Date: 20-12-2020 </Label>
                            {/* <h3>Title: </h3> */}
                            <h3>Type: </h3>
                            <h3>From: </h3>
                            <h3>To: </h3>

                            <Label basic color="pink" size="small">
                                TOTAL PRICE: $5000
                            </Label>
                            <Label basic color="pink" size="small">STATUS: {orderTite.payment}</Label>
                            <Popup trigger={<Icon name="info circle" color="black" />}>
                                <Popup.Header>
                                    5 transaction stages
                                </Popup.Header>
                                <Popup.Content>
                                <Icon name={orderStatus.order} /> {orderTite.order}
                                </Popup.Content>
                                <Popup.Content>
                                    <Icon name={orderStatus.payment} /> {orderTite.payment}
                                </Popup.Content>
                                <Popup.Content>
                                    <Icon name={orderStatus.collection} /> {orderTite.collection}
                                </Popup.Content>
                                <Popup.Content>
                                    <Icon name={orderStatus.shipping} />{orderTite.shipping}
                                </Popup.Content>
                                <Popup.Content>
                                    <Icon name={orderStatus.delivery} />{orderTite.delivery}
                                </Popup.Content>
                            </Popup>

                            <Divider />
                            <p style={{ textAlign: "center"}}>
                                <b>PACKAGES</b>
                            </p>
                            
                            <List divided relaxed >
                                <List.Item>
                                    <List.Content floated='right'>
                                        $5000
                                    </List.Content>
                                    <List.Content>
                                        <List.Header>10CM * 10CM * 15KG</List.Header>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Content floated='right'>
                                        $5000
                                    </List.Content>
                                    <List.Content>
                                        <List.Header>10CM * 10CM * 15KG</List.Header>
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
