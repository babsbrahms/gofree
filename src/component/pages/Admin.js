import React, { Component } from 'react'
import { Table, Icon, Menu, Segment, Label, Card, Form, List, Button, Modal, Popup, Divider, Dropdown } from 'semantic-ui-react';
import "../css/style.css"
import styles from "../../styles"
import Quote from "../container/Quote"
import { orderStatus, orderTite } from "../../utils/resources"

export default class Admin extends Component {
    state = { 
        activeItem: 'stats',
        loadingOrders: true,
        loadingAccounts: true,
        loadingStats: true,
        errors: {},
        openOrderDetail: false,
        selectedOrder: {},
        orders: [],
        accounts: [],
    }

    componentDidMount() {
        this.getUser()
    }
    
    getUser = () => {
      
        const orders= [
            {
                "id": "13dwee33112H",
                "from": "Nigeria",
                "to": "Uk",
                "type": "parcel",
                "packages": [
                    {
                        length: 10,
                        width: 10,
                        height: 10,
                        weight: 15,
                        price: 5000
                    },
                    {
                        length: 10,
                        width: 10,
                        height: 10,
                        weight: 15,
                        price: 5000
                    },
                ],
                "email": "user.email",
                "userId": "user.id",
                "status": "shipping",
                "paid": false,
                "orderedOn": "20-20-2020",
                "deliveredOn": "20-20-2020",
                "price": 10000,
                "currency": "Naira",
                "address": {
                    "address": "No 21, Lagos Street, Garki, Abuja",
                    "country": "Nigeria",
                    "state": "FCT",
                    "city": "Abuja"
                },
                "payment": {
        
                }
            }
        ];


        setTimeout(() => {
            this.setState({
                orders,
                loadingOrders: false,
            })
        }, 1000)
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    render() {
        const { activeItem, loadingAccounts, openOrderDetail, selectedOrder, orders, loadingOrders, quotes } = this.state;

        return (
            <div id="gofree-bg">
            <Segment id="gofree-topbar">
                <h1>Admin</h1>
            </Segment>
            <div style={{ padding: 30 }}>
                <Menu pointing stackable>
                    <Menu.Item
                        name='stats'
                        icon="chart area"
                        active={activeItem === 'stats'}
                        onClick={this.handleItemClick}
                    />

                    <Menu.Item
                        name='accounts'
                        icon="user"
                        active={activeItem === 'accounts'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name='orders'
                        icon='shopping cart'
                        active={activeItem === 'orders'}
                        onClick={this.handleItemClick}
                    />

                </Menu>

                <Segment id="gofree-content" >
                    {(activeItem === 'stats') && (
                        <Segment style={{ backgroundColor: "steelblue"}}>
                            <Card.Group centered stackable itemsPerRow="3">
                                <Card link color="pink">
                                    <Card.Content>
                                        <Card.Header>Accounts</Card.Header>
                                        <Card.Description>35</Card.Description>
                                    </Card.Content>
                                </Card>

                                <Card link color="pink">
                                    <Card.Content>
                                        <Card.Header>Orders</Card.Header>
                                        <Card.Description>40</Card.Description>
                                    </Card.Content>
                                </Card>

                                <Card link color="pink">
                                    <Card.Content>
                                        <Card.Header>Revenue</Card.Header>
                                        <Card.Description>40000</Card.Description>
                                    </Card.Content>
                                </Card>
                            </Card.Group>
                        </Segment>
                    )}

                    {(activeItem === 'accounts') && (
                    <Table unstackable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>Registration Date</Table.HeaderCell>
                                <Table.HeaderCell>E-mail address</Table.HeaderCell>
                                <Table.HeaderCell>Admin</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                    
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>John Lilki</Table.Cell>
                                <Table.Cell>September 14, 2013</Table.Cell>
                                <Table.Cell>jhlilk22@yahoo.com</Table.Cell>
                                <Table.Cell>No</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Jamie Harington</Table.Cell>
                                <Table.Cell>January 11, 2014</Table.Cell>
                                <Table.Cell>jamieharingonton@yahoo.com</Table.Cell>
                                <Table.Cell>Yes</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Jill Lewis</Table.Cell>
                                <Table.Cell>May 11, 2014</Table.Cell>
                                <Table.Cell>jilsewris22@yahoo.com</Table.Cell>
                                <Table.Cell>Yes</Table.Cell>
                            </Table.Row>
                        </Table.Body>

                        <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='4'>
                                <Menu floated='right' pagination>
                                    <Menu.Item as='a' icon>
                                        <Icon name='chevron left' />
                                    </Menu.Item>
                                    <Menu.Item as='a' icon>
                                        <Icon name='chevron right' />
                                    </Menu.Item>
                                </Menu>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                    )}
                    {(activeItem === 'orders') &&  (
                    <Table celled unstackable>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>ORDER NO</Table.HeaderCell>
                            <Table.HeaderCell>DESCRIPTION</Table.HeaderCell>
                            <Table.HeaderCell>STATUS</Table.HeaderCell>
                            <Table.HeaderCell>ACTION</Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>
                    
                        <Table.Body>
                        {orders.map(order => (
                            <Table.Row>
                                <Table.Cell>{order.id}</Table.Cell>
                                <Table.Cell>{order.packages.length} {order.type}(s) from {order.from} to {order.to}</Table.Cell>
                                <Table.Cell>{orderTite[order.status]}</Table.Cell>
                                <Table.Cell><Button size="mini" color="black" onClick={() => this.setState({ openOrderDetail: true, selectedOrder: order })}>VIEW DETAILS</Button></Table.Cell>
                            </Table.Row>
                        ))}
                        </Table.Body>
                    
                        <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='4'>
                                <Menu floated='right' pagination>
                                    <Menu.Item as='a' icon>
                                        <Icon name='chevron left' />
                                    </Menu.Item>
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
                        // dimmer="blurring"
                    >
                        <Modal.Header>
                            Order Details
                        </Modal.Header>
                        <Modal.Content>
                            <Label basic>Order No: {selectedOrder.id}</Label>
                            <Label basic>Date:  </Label>
                            <h3>Customer Name: </h3>
                            <h3>Type: {selectedOrder.type} </h3>
                            <h3>From: {selectedOrder.from}</h3>
                            <h3>To: {selectedOrder.to}</h3>

                            <Label basic color="pink" size="small">
                                TOTAL PRICE: {selectedOrder.price} {selectedOrder.currency}
                            </Label>
                            <Label basic color="pink" size="small">STATUS: {orderTite[selectedOrder.status]}</Label>
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
                            {(selectedOrder.status === "delivery") && (<Label basic color="pink" size="small">DELIVERED OB: {selectedOrder.deliveredOn}</Label>)}
                            <Divider />
                            <p style={{ textAlign: "center"}}>
                                <b>PACKAGES</b>
                            </p>
                            
                            <List divided relaxed >
                                {selectedOrder.packages && selectedOrder.packages.map((pack) => 
                                    <List.Item>
                                        <List.Content floated='right'>
                                            {pack.price} {selectedOrder.currency}
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
