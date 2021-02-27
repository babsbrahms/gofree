import React, { Component } from 'react'
import { Table, Icon, Menu, Segment, Label, Card, Form, List, Button, Modal, Popup, Divider, Dropdown } from 'semantic-ui-react';
import validator from "validator";
import "../css/style.css"
import { orderIcon, orderTite, months } from "../../utils/resources"
import { fetchAdminUsers, fetchPaidOrders, fetchNewOrders, fetchSentInvoiceOrders, fetchUsers, createAdmin, createAdminSuperUser, deleteAdmin, updateorderIcon, fetchMyAdmin, currentUser, signOut } from "../fbase"
import styles from '../../styles';
import { OrderDetails } from "../container/OrderDetails"

const years = Array.from({length: (new Date().getFullYear() - 2020)}, (item, i) => {
    return (2020 + i + 1)
});

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
        orderType: "invoice-prep",
        userIndex: 0,
        openAccountDetail: false,
        selectedUser: {},
        users: [],
        admins: [],
        data: {},
        errors: {},
        // updatedAt : {
        //     timestamp: new Date().getTime(),
        //     month: new Date().getMonth(),
        //     year: new Date().getFullYear(),
        //     day: new Date().getDate()
        // },
        period: {
            month: new Date().getMonth(),
            year: new Date().getFullYear()
        },
        currentPeriod: `${months[new Date().getMonth()]}-${new Date().getFullYear()}`,
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
        const { period, orderType } = this.state;
        
        if (this.unOrder) {
            this.unOrder()
        }

        this.setState({ loadingOrders: true, currentPeriod: `${months[period.month]}-${period.year}` }, () => {
            if (orderType === "invoice-prep")  {
                this.unOrder = fetchNewOrders(period, (res) => {
                    this.setState({ loadingOrders: false, orders:  res })
                }, (err) => {
                    this.setState({ loadingOrders: false })
                    alert(err.message)
                })
            } else if (orderType === "invoice-sent") {
                this.unOrder = fetchSentInvoiceOrders(period, (res) => {
                    this.setState({ loadingOrders: false, orders:  res })
                }, (err) => {
                    this.setState({ loadingOrders: false })
                    alert(err.message)
                })
            } else  {
                this.unOrder = fetchPaidOrders(period, (res) => {
                    this.setState({ loadingOrders: false, orders:  res })
                }, (err) => {
                    this.setState({ loadingOrders: false })
                    alert(err.message)
                })
            }

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
        const { activeItem, loadingUsers, openOrderDetail, selectedOrder, orders, loadingOrders, users, orderIndex, userIndex, loadingAdmins, me, data, errors, admins, period, currentPeriod, orderType } = this.state;

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
                            {/* <Card.Group centered stackable itemsPerRow="3">
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
                            </Card.Group> */}
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
                        <Button.Group fluid>
                            <Button active={orderType === "invoice-prep"} onClick={() => this.setState({ orderType: "invoice-prep"}, () => this.getOrder())}>New Order</Button>
                            <Button.Or />
                            <Button active={orderType === "invoice-sent"} onClick={() => this.setState({ orderType: "invoice-sent"}, () => this.getOrder())}>Sent Invoice</Button>
                            <Button.Or />
                            <Button active={orderType === "paid"} onClick={() => this.setState({ orderType: "paid"}, () => this.getOrder())}>Paid Order</Button>
                        </Button.Group>
                        <br/>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center"}}>
                        {(orderType !== "invoice-prep") && (
                        <span>
                        <b> Period: {currentPeriod} </b><Popup trigger={<Icon link bordered color="teal" name="pencil alternate"  />} on="click">
                            <Form>
                                <Form.Select value={period.year} label="year" options={years.map((x) => ({ text: x, value: x, key: x}))} value={period.year} onChange={(e, d) => this.setState({ period: { ...period, year: d.value }})} />

                                <Form.Select value={period.month} label="month" options={months.map((x, i) => ({ text: x, value: i, key: x}))} value={period.month} onChange={(e, d) => this.setState({ period: { ...period, month: d.value }})} />

                                <Form.Button fluid disabled={loadingOrders} loading={loadingOrders} onClick={() => this.getOrder()} >
                                    Get Orders
                                </Form.Button>
                            </Form>
                        </Popup>
                        </span>)} 
                        </div>
                        <Table celled unstackable>
                            <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>ORDER ID</Table.HeaderCell>
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
                            <OrderDetails selectedOrder={selectedOrder} />
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
