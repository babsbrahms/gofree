import React, { Component } from 'react'
import { Table, Icon, Menu, Segment, Label, Card, Form, List, Button, Modal, Popup, Divider, Dropdown } from 'semantic-ui-react';
import validator from "validator";
import "../css/style.css"
import { orderIcon, orderTite } from "../../utils/resources"
import { fetchAdminUsers, fetchOrders, fetchUsers, createAdmin, createAdminSuperUser, deleteAdmin, updateorderIcon, fetchMyAdmin, currentUser, signOut } from "../fbase"
import styles from '../../styles';

export default class Admin extends Component {
    state = { 
        me: {},
        activeItem: 'stats',
        loadingOrders: true,
        loadingUsers: true,
        loadingStats: true,
        loadingAdmins: false,
        errors: {},
        orderIndex: 0,
        openOrderDetail: false,
        selectedOrder: {},
        orders: [],
        userIndex: 0,
        openAccountDetail: false,
        selectedUser: {},
        users: [],
        admins: [],
        data: {},
        errors: {},
    }

    componentDidMount() {
        this.getMe()
        this.getAdmins()
        this.getOrder()
        this.getUser()
    }


    componentWillUnmount() {
        if (this.unOrder) {
            this.unOrder()
        }

        if (this.unUser) {
            this.unUser()
        }

        if (this.unAdmin) {
            this.unAdmin()
        }

        if (this.unMyUser) {
            this.unMyUser()
        }
    }

    getMe = () => {
        let user = currentUser()

        if (user && user.uid) {
            this.unMyUser = fetchMyAdmin(user.email, (res) => {
                console.log(res);
                this.setState({ me: res })
            }, (err) => {
                alert(err.message)
            })
        }

    }
    
    getUser = () => {
        this.unUser = fetchUsers((res) => {
            this.setState({ loadingUsers: false, users:  res })
        }, (err) => {
            this.setState({ loadingUsers: false })
            alert(err.message)
        })
    }
    
    getOrder = () => {
        this.unOrder = fetchOrders((res) => {
            this.setState({ loadingOrders: false, orders:  res })
        }, (err) => {
            this.setState({ loadingOrders: false })
            alert(err.message)
        })
    }

    getAdmins = () => {
        this.Admin = fetchAdminUsers((res) => {
            this.setState({ loadingAdmins: false, admins: res })
        },(err) => {
            this.setState({ loadingAdmins: false })
            alert(err.message)
        })
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

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

        return err
    }

    save = () => {
        const { data } = this.state;
        this.setState({ errors: {}, loadingAdmins: true }, () => {
            let errors = this.validate(data)

            if (Object.keys(errors).length === 0) {
                createAdmin(data.name, data.email)
                .then(() => {
                    this.setState({ data: {}, loadingAdmins: false })
                }).catch((err) => {
                    this.setState({ loadingAdmins: false })
                    alert(err.message)
                })
                
            } else {
                this.setState({ errors, loadingAdmins: false })
            }
        })
    }

    adminDel = (id) => {
        this.setState({ loadingAdmins: true }, () => {
            deleteAdmin(id, () => {
                this.setState({ loadingAdmins: false })
            }, (err) => {
                this.setState({ loadingAdmins: false })
                alert(err.message)
            })
        })

    }

    render() {
        const { activeItem, loadingUsers, openOrderDetail, selectedOrder, orders, loadingOrders, users, orderIndex, userIndex, loadingAdmins, me, data, errors, admins } = this.state;

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
                        name='admin'
                        icon="user doctor"
                        active={activeItem === 'admin'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name='users'
                        icon="user"
                        active={activeItem === 'users'}
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
                        <Segment> 
                            <Segment style={styles.betweenStart}>
                                <h2>{me.name}</h2> <Button basic color="pink" content="log out" icon="log out" onClick={() => signOut()}  />
                            </Segment>
                            <Card.Group centered stackable itemsPerRow="3">
                                <Card link color="pink">
                                    <Card.Content>
                                        <Card.Header>Users</Card.Header>
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

                    {(activeItem === 'admin') && (
                    <Segment loading={loadingAdmins}>
                        <Segment clearing textAlign="center">
                            
                            <Popup position="top center" on="click" trigger={<Icon color="black" name="add circle" size="huge" link />}>

                                <Popup.Header>
                                    Create Admin Account
                                </Popup.Header>
                                <Popup.Header>
                                    <Card>
                                        <Card.Content>
                                            <Form >
                                                <Form.Input 
                                                    required
                                                    label="Name"
                                                    name="name" 
                                                    type="name"
                                                    placeholder={"add your name"}
                                                    value={(data.name)? data.name : ""}
                                                    onChange={(e, data) => this.addUserData(data)} 
                                                    error={errors.name}
                                                />

                                                <Form.Input 
                                                    required
                                                    label="Email"
                                                    name="email" 
                                                    type="email"
                                                    placeholder={"add your email"}
                                                    value={(data.email)? data.email : ""}
                                                    onChange={(e, data) => this.addUserData(data)} 
                                                    error={errors.email}
                                                
                                                />

                                                <Form.Button loading={loadingAdmins} disabled={loadingAdmins} floated="right" onClick={() => this.save()} color='pink' basic>
                                                    Submit
                                                </Form.Button>
                                            </Form>
                                        </Card.Content>
                                    </Card>
                                </Popup.Header>
                            </Popup>
                        </Segment>
                        <Table unstackable>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>E-mail address</Table.HeaderCell>
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                        
                            <Table.Body>
                                {admins.map((user, key) => (
                                <Table.Row key={users.email}>
                                    <Table.Cell>{user.name}</Table.Cell>
                                    <Table.Cell>{user.email}</Table.Cell>
                                    <Table.Cell>
                                        {(me.superUser) && (!user.superUser) && (
                                        <Popup on="click" trigger={<Button size="mini" color="black" >DELETE</Button>}>
                                            <Popup.Header>
                                                Are you sure?
                                            </Popup.Header>
                                            <Popup.Content>
                                                <Button color='green' content='Yes, delete user' onClick={() => this.adminDel(user.id)} />
                                            </Popup.Content>
                                        </Popup>)}
                                        
                                    </Table.Cell>
                                </Table.Row>
                                ))}
                            </Table.Body>

                            {/* <Table.Footer>
                                <Table.Row>
                                    <Table.HeaderCell colSpan='4'>
                                    <Menu floated='right' pagination>
                                        <Menu.Item disabled={userIndex === 0} as='a' icon>
                                            <Icon name='chevron left' />
                                        </Menu.Item>
                                        <Menu.Item disabled={users.length < 25} as='a' icon>
                                            <Icon name='chevron right' />
                                        </Menu.Item>
                                    </Menu>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer> */}
                        </Table>
                    </Segment>
                    )}


                    {(activeItem === 'users') && (
                    <Segment loading={loadingUsers}>
                        <Table unstackable>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Registration Date</Table.HeaderCell>
                                    <Table.HeaderCell>E-mail address</Table.HeaderCell>
                                    <Table.HeaderCell>Detail</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                        
                            <Table.Body>
                                {users.map((user, key) => (
                                <Table.Row key={users.email}>
                                    <Table.Cell>{user.name}</Table.Cell>
                                    <Table.Cell>{user.createdAt.toDate().toDateString()}</Table.Cell>
                                    <Table.Cell>{user.email}</Table.Cell>
                                    <Table.Cell>
                                        <Popup position="top right" on="click" trigger={<Button size="mini" color="black" >VIEW DETAILS</Button>}>
                                            <Popup.Header>Account Detail</Popup.Header>
                                            <Popup.Content>
                                                <Card>
                                                    <Card.Content >
                                                        <Card.Description>
                                                            Name: {user.name}
                                                        </Card.Description>
                                                        <Card.Description>
                                                            Email: {user.email}
                                                        </Card.Description>
                                                        {(user.address) && (<Card.Description>
                                                            Address: {user.address.address}
                                                        </Card.Description>)}
                                                        {(user.address) && (<Card.Description>
                                                            City: {user.address.city}
                                                        </Card.Description>)}
                                                        {(user.address) && (<Card.Description>
                                                            State: {user.address.state}
                                                        </Card.Description>)}
                                                        {(user.address) && (<Card.Description>
                                                            Country: {user.address.country}
                                                        </Card.Description>)}
                                                    </Card.Content>
                                                </Card>
                                            </Popup.Content>
                                        </Popup>
                                    </Table.Cell>
                                </Table.Row>
                                ))}
                            </Table.Body>

                            <Table.Footer>
                                <Table.Row>
                                    <Table.HeaderCell colSpan='4'>
                                    <Menu floated='right' pagination>
                                        <Menu.Item disabled={userIndex === 0} as='a' icon>
                                            <Icon name='chevron left' />
                                        </Menu.Item>
                                        <Menu.Item disabled={users.length < 25} as='a' icon>
                                            <Icon name='chevron right' />
                                        </Menu.Item>
                                    </Menu>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>
                    </Segment>
                    )}
                    {(activeItem === 'orders') &&  (
                    <Segment loading={loadingOrders}>
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
                                    <Menu floated='right'  pagination>
                                        <Menu.Item as='a' disabled={orderIndex === 0} icon>
                                            <Icon name='chevron left' />
                                        </Menu.Item>
                                        <Menu.Item as='a' disabled={orders.length < 25} icon>
                                            <Icon name='chevron right' />
                                        </Menu.Item>
                                    </Menu>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>
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
                            <h3>Customer Name: </h3>
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
