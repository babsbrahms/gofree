import React, { Component } from 'react'
import { Table, Icon, Menu, Segment, Label, Card } from 'semantic-ui-react'
import "../css/style.css"
import styles from "../../styles"
import Quote from "../container/Quote"

export default class Account extends Component {
    state = { activeItem: 'account' }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    render() {
        const { activeItem } = this.state;

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
                    <div>
                        <br />
                        <Card.Group itemsPerRow="3" centered stackable>
                            <Card>
                                <Card.Content>
                                    <div style={styles.betweenStart}>
                                        <Card.Header>
                                            ACCOUNT DETAILS
                                        </Card.Header>

                                        <Icon name="edit" color="blue" />
                                    </div>

                                <Card.Meta>
                                    <span className='date'>Joined in 2015</span>
                                </Card.Meta>
                                <Card.Description>
                                    Matthew is a musician living in Nashville.
                                </Card.Description>
                                </Card.Content>
                                <Card.Content extra>
                                <a>
                                    <Icon name='user' />
                                    22 Friends
                                </a>
                                </Card.Content>
                            </Card>

                            <Card>
                                <Card.Content>
                                <div style={styles.betweenStart}>
                                        <Card.Header>
                                            ADDRESS
                                        </Card.Header>

                                        <Icon name="edit" color="blue" />
                                    </div>
                                <Card.Meta>
                                    <span className='date'>Joined in 2015</span>
                                </Card.Meta>
                                <Card.Description>
                                    Matthew is a musician living in Nashville.
                                </Card.Description>
                                </Card.Content>
                                <Card.Content extra>
                                <a>
                                    <Icon name='user' />
                                    22 Friends
                                </a>
                                </Card.Content>
                            </Card>
                        </Card.Group>
                    </div>
                    )}
                    {(activeItem === 'orders') &&  (
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
                </Segment>
            </div>
        </div>
        )
    }
}
