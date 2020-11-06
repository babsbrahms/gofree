import React, { useState } from 'react';
import { Card, Segment, Button, Modal, Message, Header, Table, Divider, Label, Icon, Dropdown, Confirm, Popup } from "semantic-ui-react"
import { enableSubscription, disableSubscription, fetchInvoices,  fetchTeamLogForNewWorkspace, fetchTeamLogForSubscribers, analytics } from "../fbase";
import { Link } from "react-router-dom"
import SubscriptionForm from "../container/SubscriptionForm";
import { getSubAmmount } from "../../utils/resources";

let dropdownOptions = [
    {
        key: "status", 
        text: "Change Subscription Status", 
        value: "status"
    },
    {
        key: "invoice", 
        text: "Get Transaction History", 
        value: "invoice"
    },
    {
        key: "renew", 
        text: "Renew Subscription", 
        value: "renew"
    },
    {
        key: "update", 
        text: "Update payment Info", 
        value: "update"
    }
];
const Subscription = ({ workspace, close }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [option, setOption] = useState('');
    const [open, setOpen] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [teamLogs, setTeamLogs] = useState([])
    const [confirm, setConfirm] = useState(false)

    const changeSubscriptionStatus = () => {
        setConfirm(false)
        setLoading(true);
        setMessage('')
        if (workspace.subscription.status === 'active') {
            disableSubscription(workspace)
            .then(() => {
                analytics("disable_workspace_subscription", {
                    workspaceId: workspace.id,
                    workspaceName: workspace.name
                })
                setMessage("Subscription Disabled!")
                setLoading(false)
            })
            .catch((err) => {
                setMessage(err.message)
                setLoading(false)
            })
        } else {
            enableSubscription(workspace)
            .then(() => {
                analytics("enable_workspace_subscription", {
                    workspaceId: workspace.id,
                    workspaceName: workspace.name
                })
                setMessage("Subscription Enabled!")
                setLoading(false)
            })
            .catch((err) => {
                setMessage(err.message)
                setLoading(false)
            })
        }
    }

    const getInvoice = () => {
        setLoading(true)
        setMessage('')
        fetchInvoices(workspace.id, (res) => {
            // console.log(res);
            setInvoices(res)
            setLoading(false)
            if (res.length > 0) {
                setOpen("invoice")
            } else {
                setMessage('Invoice not found')
            }

        }, (err) => {
            setLoading(false)
            setMessage(err.message)
        })
    }

    const getUserChanges = () => {
        if (!!workspace.subscription.next_payment_date) {
            let date = new Date(workspace.subscription.current_payment_date);
            // console.log("date: ", date);
            date.setHours(0,0,0,0)
            // console.log("date: ", date);
            fetchTeamLogForSubscribers(workspace.id, date, (res) => {
                // console.log("teamlog: ", res);
                setTeamLogs(res)
                setOpen('team changes')
            }, (err) => {
                setMessage(err.message)
            })
        } else {
            fetchTeamLogForNewWorkspace(workspace.id, (res) => {
                // console.log("res: ", res);
                setTeamLogs(res)
                setOpen('team changes')
            }, (err) => {
                setMessage(err.message)
            })
        }
    }

    const changeOption = (value) => {
        if (value === 'invoice') {
            setOption(value)
            getInvoice()
        } else {
            setOption(value)
        }
    }
    return (
    <Segment loading={loading}>

        <Card fluid>
            <Card.Content>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start"}}>
                    <Card.Header>Workspace Subscription</Card.Header>

                    <Icon link name="window close" size="large" color="red" onClick={() => close()} />
                </div>
                
                <Confirm
                    open={confirm}
                    content={`Are you sure you want to ${workspace.subscription.status === 'active'? "Disable" : 'Enable'} Subscription?`}
                    onCancel={() => setConfirm(false)}
                    onConfirm={() => changeSubscriptionStatus()}
                />
            </Card.Content>
            <Card.Content>
                {(!!workspace.subscription.status) && (
                    <div>
                        <Header>
                            <Header.Subheader>Subscription Status: {workspace.subscription.status}</Header.Subheader>
                            <Header.Subheader>Max Team Size: {workspace.subscription.quantity} Members 
                                <Popup 
                                on="click"
                                trigger={
                                    <Icon link name={"info circle"} /> 
                                } > 
                                <Popup.Content>
                                The maximum number of people (team members that have accepted their workspace invitation) in a workspace during a billing period (30 days). It is reset to the actual number of team members after monthly subscriptions
                                </Popup.Content>
                                <Popup.Content>
                                    <Button onClick={() => getUserChanges()}>
                                        Display Size Team Changes
                                    </Button>
                                </Popup.Content>

                                </Popup>
                            </Header.Subheader>
                            <Header.Subheader>Next Payment Date: {new Date(workspace.subscription.next_payment_date).toDateString()}</Header.Subheader>
                            <Header.Subheader>Next Subscription Amount: {getSubAmmount(workspace.subscription.quantity) / 100} NGN (Max Team Size  x Price Per Team Member <Button size="mini" as={Link} to="/pricing" target="_blank"> <Icon name="info circle" /> Checkout Pricing Details</Button>) 
                            </Header.Subheader>
                            <Header.Subheader>Notification Email: {workspace.subscription.email}</Header.Subheader>
                            <Header.Subheader>Card Details: {workspace.subscription.authorization.bank} bank card that ends with {workspace.subscription.authorization.last4}</Header.Subheader>
                        </Header>

                        <Divider />
                        <Dropdown 
                            fluid
                            placeholder='Operation' 
                            selection 
                            defaultValue={option}
                            options={dropdownOptions} 
                            onChange={(e, { value }) => changeOption(value)}
                        />
                        <br />

                        {(option === 'update') && (<div>
                            <h3>Update notification email or card</h3>
                            <SubscriptionForm workspace={workspace} subscription={false} addMessage={(msg) => setMessage(msg)} />
                        </div>)}

                        {(option === 'renew') && (
                        <div>
                            <h3>Renew Subscription</h3>
                            <Label>
                                <Icon name="info" />
                                You subscription will end on {new Date(workspace.subscription.next_payment_date).toDateString()}. If you subscription has not ended or about to end, the payment form will not appear. In that case, just update your payment info and we will charge you when it is due.
                            </Label>
                            
                            
                            {((new Date().getTime() > (workspace.subscription.next_payment_date - (3 * 86400000)))) && (
                                <div>
                                    <SubscriptionForm workspace={workspace} subscription={true} addMessage={(msg) => setMessage(msg)} />
                                </div>
                            )}
                        </div>)}
                        {(option === 'status') && (
                            <Button fluid onClick={() => setConfirm(true)}> {workspace.subscription.status === 'active'? "Disable" : 'Enable'} Subscription</Button>
                        )}
                    </div>     
                )}
                
                {(!workspace.subscription.status) && (
                    <div>
                        <SubscriptionForm workspace={workspace} subscription addMessage={(msg) => setMessage(msg)} />
                    </div>
                )}
                {(!!message) && (<Message 
                    content={message} 
                    onDismiss={() => setMessage('')}
                    compact
                    size="tiny"
                />)}
            </Card.Content>
        </Card>

        <Modal
            open={!!open}
            onClose={() => setOpen("")}
            dimmer="inverted"
            closeIcon
        >
            <Modal.Header>{open === 'invoice' ?'Transaction History' : open}</Modal.Header>
            <Modal.Content>
                {(open === 'invoice') && (
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                            <Table.HeaderCell>Reason</Table.HeaderCell>
                            <Table.HeaderCell>Team Size</Table.HeaderCell>
                            <Table.HeaderCell>Price</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {invoices.map(invoice => (
                        <Table.Row>
                            <Table.Cell>{invoice.createdAt? new Date(invoice.createdAt.seconds * 1000 + invoice.createdAt.nanoseconds/1000000).toLocaleString() : "" }</Table.Cell>
                            <Table.Cell>{invoice.reason}</Table.Cell>
                            <Table.Cell>{!!invoice.quantity? invoice.quantity : 'nill'}</Table.Cell>
                            <Table.Cell>{invoice.amount/100} {invoice.currency}</Table.Cell>
                        </Table.Row>
                        ))}
                    </Table.Body>
                </Table>)}
                {(open === 'team changes') && (
                    <div>
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Date</Table.HeaderCell>
                                    <Table.HeaderCell>Action</Table.HeaderCell>
                                    <Table.HeaderCell>Email</Table.HeaderCell>
                                    <Table.HeaderCell>Team Size</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {teamLogs.map(log => (
                                <Table.Row>
                                    <Table.Cell>{log.createdAt? log.createdAt.toDate().toLocaleString() : "" }</Table.Cell>
                                    <Table.Cell>{log.action}{log.action.endsWith("add") ? "ad" : "d"} {log.userName}</Table.Cell>
                                    <Table.Cell>{log.userEmail}</Table.Cell>
                                    <Table.Cell>{log.count}</Table.Cell>
                                </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                )}
            </Modal.Content>
        </Modal>
    </Segment>
    )
}

export default Subscription;