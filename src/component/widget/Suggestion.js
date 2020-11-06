import React, { Component } from 'react'
import { Card, Button, Icon, Form, Segment, Dimmer, Loader, Image, Label, Message, Popup } from 'semantic-ui-react';
import styles from '../../styles';
import { serverTimestamp, fetchAllSuggestions, fetchSuggestionsByDepartment, fetchManagementSuggestions, addData, updateData, deleteData, analytics } from '../fbase';
import { widgetDescription } from "../../utils/resources";

const recipientList = [
    { value: 'department', text: "My Department", key: "department"}, 
    { value: 'management', text: "Management", key: "management"}
]

export default class SuggestionBox extends Component {
    constructor (props) {
        super(props);

        this.state = {
            mode: 'view',
            fetching: false,
            sending: false,
            active: null,
            create: {
                recipient: "",
                message: '',
                action: '',
                anonymous: false,
                createdAt: '',
                departmentName: props.team.departmentName,
                departmentId: props.team.departmentId,
                userId: props.team.userId,
                name: props.team.name,
                workspaceId: props.team.workspaceId, 
            },
            suggestions: [],
            suggestionIndex: -1,
            errors: {}
        }
    }
    

    getData = (active) => {
        const { team, rolePermission } = this.props;
        this.setState({ fetching: true, suggestionIndex: -1 }, ( ) => {
            let handelSuccess = (res) => {
                this.setState({ fetching: false, suggestions: res, active, data: res.length > 0? res[0] : {}, suggestionIndex: res.length > 0? 0 : -1  })
            }

            let handleError = (err) => {
                console.log(err);
                this.setState({ errors: { ...this.state.errors, general:  err.message }})
            }

            if (rolePermission.review === 'all') {
                fetchAllSuggestions(active, team.workspaceId, (res) =>  {
                    handelSuccess(res)
                }, (err) => {
                    handleError(err)
                })
            } else if (rolePermission.review === 'management') {
                fetchManagementSuggestions(active, team.workspaceId, (res) =>  {
                    handelSuccess(res)
                }, (err) => {
                    handleError(err)
                })
            } else if (rolePermission.review === 'department') {
                fetchSuggestionsByDepartment(active, team.departmentId, team.workspaceId, (res) =>  {
                    handelSuccess(res)
                }, (err) => {
                    handleError(err)
                })
            }
        })
    }
    
    changeMode = (mode) => this.setState({ mode, errors: {} })

    add = () =>  this.changeMode('create')

    addData = (data) => this.setState({  
        create: {
            ...this.state.create,
            [data.name]: data.value,
        }}
    )

    changeAnonymous = (data) => {
        const { team } = this.props;

        this.setState({ 
            create: {
                ...this.state.create,
                anonymous: data.value,
                userId: data.value? "" : team.userId,
                name: data.value? "" : team.name,
            }
        })
    }

    discard = () => {
        this.setState({  create: {
            ...this.state.create,
            message: '',
            anonymous: false,
        }})
        this.changeMode('view')
    }

    validate = (message, recipient) => {
        let err = {};

        if (!message) err.message = 'message is required to make a suggestion';
        if (recipient)  err.recipient = 'recipient is required in suggestion'
        return err
    }

    send = () => {
        const { create } = this.state;
        let errors = this.validate(create.message)

        if (Object.keys(errors).length === 0) {

            let data = {
                ...create,
                createdAt: serverTimestamp(),
            }

            this.setState({ sending: true },  () => {
                addData('suggestion', data, (res) =>  {
                    this.setState({ sending: false }, () => {
                        analytics.logEvent("create_suggestion", {
                            recipient: data.recipient
                        })
                        this.discard()
                    })
                }, (err) => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            })
        } else {
            this.setState({ errors: errors })
        }
    }

    incrementSuggestion = inc => this.setState({ suggestionIndex: (this.state.suggestionIndex + inc) })

    takeAction = (action) => {
        const { suggestionIndex, suggestions } = this.state;
        // reduce indexby one if not on zero, reduce suggestion by 1
        let index = 0;
        let data = suggestions[suggestionIndex];
        suggestions.splice(suggestionIndex, 1);
        if ((suggestions.length > 0) && (suggestionIndex === 0)) {
           index = 0
        } else {
            index = suggestionIndex - 1
        }

        this.setState({ suggestionIndex: index, suggestions }, () => {
            if (action === 'delete') {
                deleteData('suggestion', data.id, (res) =>  {
                   // console.log(res);
                    analytics.logEvent("delete_suggestion", {
                        recipient: data.recipient || ""
                    })
                }, (err) => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            } else {
                updateData('suggestion', data.id, { ...data, action }, (res) => {
                  //  console.log(res);
                  analytics.logEvent(`${action}_suggestion`, {
                    recipient: data.recipient || ""
                })
                }, (err) => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            }
        })
    }


     render() {
        const { mode, fetching, sending, errors, suggestions, create, active, suggestionIndex } = this.state;
        const { rolePermission } = this.props;

        return (
            <div>
                <Card>
                    <Card.Content>
                    <div style={styles.between}>
                        <div>
                            <Card.Header as='h3'>
                                Suggestion Box
                                <Popup trigger={<Icon size='small' link name='key' />}>
                                    <Popup.Header>Permission</Popup.Header>
                                    <Popup.Content>
                                        {(rolePermission.review === 'none') && (
                                            <p>You can only create suggestions.</p>
                                        )}

                                        {(rolePermission.review === 'department') && (
                                            <p>You can create and review suggestions for your department.</p>
                                        )}

                                        
                                        {(rolePermission.review === 'management') && (
                                            <p>You can create and review suggestions for management.</p>
                                        )}

                                        
                                        {(rolePermission.review === 'all') && (
                                            <p>You can create and review all suggestions.</p>
                                        )}
                                    </Popup.Content>
                                </Popup>
                            </Card.Header>
                            <Card.Meta>
                            {widgetDescription.suggestion}
                            </Card.Meta>
                            </div>
                            
                            <Icon bordered inverted color='teal' name='add' onClick={() => this.add()}  />
                        </div>
                        {(!!errors.general) && (
                        <Message 
                            error 
                            content={errors.general} 
                            onDismiss={() => this.setState({ errors: { ...errors, general: "" }})}
                            compact
                            size="tiny"
                        />)}
                    </Card.Content>
                    {(mode === 'view') && (rolePermission.review !== "none") && (
                    <Card.Content>
                        <Card.Header textAlign="center">View suggestions by:</Card.Header>
                        <Button.Group fluid>
                            <Button active={active === ''} disabled={fetching} onClick={() => this.getData('')}>New</Button>
                            <Button.Or />
                            <Button active={active === 'approve'} disabled={fetching} onClick={() => this.getData('approve')}>Approved</Button>
                            <Button.Or />
                            <Button active={active === 'decline'} disabled={fetching} onClick={() => this.getData('decline')}>Declined</Button>
                        </Button.Group>
                    </Card.Content>
                    )}
                    {(mode === 'view') && (suggestionIndex !== -1) && (
                    <Card.Content>
                        <div style={styles.betweenStart}>
                            <Icon color='teal' disabled={suggestionIndex === 0} name='arrow left' onClick={() => this.incrementSuggestion(-1)}  />

                            <Icon color='teal' disabled={suggestionIndex === (suggestions.length -1)} name='arrow right' onClick={() => this.incrementSuggestion(1)}  />
                        </div>
                    </Card.Content>
                    )}
                    {(mode === 'view') && (
                    <Card.Content>
                        <div style={styles.limit}>

                            {(fetching) && (
                            <Segment>
                                <Dimmer active inverted>
                                    <Loader inverted />
                                </Dimmer>

                                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                            </Segment>
                            )}

                            {(!fetching) && (suggestionIndex === -1) && (
                                <Card.Meta textAlign='center'>
                                    <b>no {active}{active? "d" : ""} suggestion(s)</b>
                                    
                                </Card.Meta>
                            )}

                            {(suggestionIndex >= 0) && (
                            <div>
                                <Card.Meta>{suggestions[suggestionIndex].createdAt? new Date(suggestions[suggestionIndex].createdAt.seconds * 1000 + suggestions[suggestionIndex].createdAt.nanoseconds/1000000).toLocaleString() : ""}</Card.Meta>
                                <Card.Header>Recipient: {suggestions[suggestionIndex].recipient === 'department'? `${suggestions[suggestionIndex].departmentName} department` : 'management'}</Card.Header>
                                <Card.Description>
                                    {suggestions[suggestionIndex].message}
                                </Card.Description>
                                {suggestions[suggestionIndex].anonymous? <div /> : <Card.Meta>{suggestions[suggestionIndex].name}</Card.Meta>}
                                <Card.Meta>{suggestions[suggestionIndex].departmentName} department</Card.Meta>
                            </div>)}
                        </div>
                    </Card.Content>
                    )}

                    {(mode === 'view') && (suggestionIndex !== -1) && (rolePermission.review !== "none") && (
                    <Card.Content extra>
                        <div className='ui three buttons'>
                            <Button basic color='green' disabled={active === 'approve'} onClick={() => this.takeAction('approve')}>
                                Approve
                            </Button>
                            <Button basic color='yellow' disabled={active === 'decline'} onClick={() => this.takeAction('decline')}>
                                Decline
                            </Button>
                            <Button basic color='red' onClick={() => this.takeAction('delete')}>
                                Delete
                            </Button>  
                        </div>
                    </Card.Content>
                    )}

                    {(mode === 'create') && (
                    <Card.Content>
                        <Label color='teal' ribbon>
                            Add Suggestion
                        </Label>
                        <Form>
                            <Form.Select 
                                label="recipient" 
                                name="recipient" 
                                defaultValue={create.recipient} 
                                error={!!errors.recipient} 
                                onChange={(e, data) => this.addData(data)} 
                                placeholder={"Select Suggestion reciever"} 
                                options={recipientList}
                            />
                            <Form.Field>
                                <Form.TextArea label={'Message'} defaultValue={create.message} error={!!errors.message} name='message' onChange={(e, data) => this.addData(data)} placeholder='Add suggestion message' />
                            </Form.Field>
                            <Form.Field>
                                <Form.Checkbox label='Post anonymously' name='anonymous' value={!create.anonymous} onChange={(e, data) => this.changeAnonymous(data)} />
                            </Form.Field>
                        </Form>
                    </Card.Content>
                    )}

                    {(mode === 'create') && (
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='red' onClick={() => this.discard()}>
                                Discard
                            </Button>
                            <Button basic color='green' disabled={sending} loading={sending} onClick={() => this.send()}>
                                Save
                            </Button>
                        </div>
                    </Card.Content>
                    )}
                </Card>
            </div>
        )
    }
}
