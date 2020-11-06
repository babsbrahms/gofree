import React, { Component } from 'react'
import { Card, Segment, Icon, Feed, Button, Form, Loader, Dimmer, Image, Label, Message, Popup } from 'semantic-ui-react'
import styles from '../../styles';
import { serverTimestamp, fetchAnnoucement, fetchDepartments, addData, analytics } from '../fbase';
import { widgetDescription } from "../../utils/resources";

export default class Announcement extends Component {
    constructor (props) {
        super(props);

        this.state = {
            mode: 'view',
            fetching: true,
            sending: false,
            create: {
                departmentIds: [],
                subject: "",
                message: '',
                user: {
                    uid: props.team.userId,
                    name: props.team.name,
                    roleTitle: props.team.roleTitle
                },
                workspaceId: props.team.workspaceId,
            },
            data: [

            ],
            errors: {},
            fetchingDept: false,
            departments: []
        }
    }

    componentDidMount() {
        this.getData()
    }
    
    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe() 
        }
        if (this.unDept) {
            this.unDept()
        }
    }
    
    getData = () => {
        const { team} = this.props;
        this.unsubscribe = fetchAnnoucement(team.workspaceId, team.departmentId, (res) => {
            this.setState({ fetching: false, data: res })
        }, (err) => {
            // console.log(err);
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }
    
    decideFetch = () => {
        if (!this.unDept) {
            this.setState({ fetchingDept: true }, () => {
                this.getDepartment()
            })
        }
    }

    getDepartment= () => {
        const { team } = this.props;
        this.unDept = fetchDepartments(team.workspaceId, (depts) => {
            this.setState({ fetchingDept: false, departments: depts })
        }, (err) => {
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }

    changeMode = (mode) => this.setState({ mode, errors: {} })

    add = () => {
        const { rolePermission, team } = this.props;

        if (rolePermission.create === 'multiple') {
            this.changeMode('create')
        } else {
            this.setState({ create: { ...this.state.create, departmentIds: [team.departmentId]  }}, () => {
                this.changeMode('create')
            })
        }   
    }

    addData = (data) => this.setState({  
        create: {
            ...this.state.create,
            [data.name]: data.value,
        }}
    )

    discard = () => {
        this.setState({  create: {
            ...this.state.create,
            departmentIds: [],
            message: '',
            // subject: ""
        }})
        this.changeMode('view')
    }

    validate = (departmentIds, message, subject) => {
        let err = {};

        if (departmentIds.length === 0) err.departmentIds = 'Add departments to send announcement to.';
        if (!message) err.message = 'Message is required to make a announcement';
        if (!subject) err.subject = 'Subject is required to make a announcement';

        return err
    }

    send = () => {
        const { create } = this.state;
        let errors = this.validate(create.departmentIds, create.message, create.subject)

        let data = {
            ...create,
            createdAt: serverTimestamp(),
            postedOn: serverTimestamp(),
        }
        if (Object.keys(errors).length === 0) {
            this.setState({ sending: true },  () => {
                addData('announcement', data, () => {
                    analytics.logEvent("create_announcement", {
                        departmentIds: data.departmentIds
                    })
                    this.setState({ sending: false }, () => {
                        this.discard()
                    })
                }, (err) => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            })
        } else {
            this.setState({ errors })
        }
    }

    render() {
        const { mode, data, fetching, sending, errors, create, departments, fetchingDept } = this.state;
      const { rolePermission, team } = this.props;

        return (
            <div>
                <Card>
                    <Card.Content>
                        <div style={styles.between}>
                            <div>
                            <Card.Header as='h3'>
                                Announcement 
                                <Popup trigger={<Icon size='small' link name='key' />}>
                                    <Popup.Header>Permission</Popup.Header>
                                    <Popup.Content>
                                        {(rolePermission.create === 'none') && (
                                            <p>You can only read announcements.</p>
                                        )}

                                        {(rolePermission.create === 'single') && (
                                            <p>You can read and create announcements for your department.</p>
                                        )}

                                        {(rolePermission.create === 'multiple') && (
                                            <p>You can read and create announcements for multiple departments.</p>
                                        )}
                                    </Popup.Content>
                                </Popup>
                            </Card.Header>
                            <Card.Meta>
                                {widgetDescription.announcement} 
                            </Card.Meta>
                           </div> 

                            <Icon disabled={rolePermission.create === 'none'} bordered inverted color='teal' name='add' onClick={() => this.add()} />
                            
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
                    {(mode === 'view') && (
                    <Card.Content>
                        <div style={{ ...styles.limit, height: styles.limit.height + 70 }}>
                            {(fetching) && (
                            <Segment>
                                <Dimmer active inverted>
                                    <Loader inverted />
                                </Dimmer>

                                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                            </Segment>
                            )}
                            {(!fetching) && (data.length === 0) && (
                                <Card.Meta textAlign='center'>
                                    <b>no announcement</b>
                                    
                                </Card.Meta>
                            )}
                            {data.map(val => (
                                <Segment key={val.id}> 
                                    <Feed>
                                        <Feed.Event>
                                            <Feed.Content>
                                                <Feed.Label>{val.subject}</Feed.Label>
                                                <Feed.Summary>
                                                <Feed.Date>{val.postedOn? new Date(val.postedOn.seconds * 1000 + val.postedOn.nanoseconds/1000000).toLocaleString() : "" }</Feed.Date>
                                                </Feed.Summary>
                                                <Feed.Extra text>
                                                {val.message}
                                                </Feed.Extra>
                                                <Feed.Meta>
                                                    <h4>{val.user.name}</h4>
                                                    {val.user.roleTitle}
                                                </Feed.Meta>
                                            </Feed.Content>
                                        </Feed.Event>  
                                    </Feed>
                                </Segment>
                            ))}
                        </div>
                    </Card.Content>)}


                    {(mode === 'create') && (
                    <Card.Content>
                        <Label color='teal' ribbon>
                            Create Announcement
                        </Label>
                        <Form>
                            {(rolePermission.create === 'multiple') && (
                            <Form.Field>
                                <div style={styles.betweenStart}>
                                    <label>Department(s)</label>  
                                    {(departments.length > 0) && (
                                    <Label as="a" color="black" size="mini" onClick={() => this.setState({  create: { ...this.state.create, departmentIds: departments.map(x => x.id) }})} >
                                        select all
                                    </Label>)}
                                </div>

                                <Form.Dropdown
                                    placeholder='Select message destination'
                                    fluid
                                    multiple
                                    search
                                    selection
                                    value={create.departmentIds}
                                    options={departments.map(x => ({ key: x.id, value: x.id, text: x.name }))}
                                    loading={fetchingDept}
                                    error={!!errors.departmentIds}
                                    name='departmentIds' 
                                    onClick={() => this.decideFetch()}
                                    onChange={(e, data) => this.addData(data)}
                                />
                            </Form.Field>)}
                            {(rolePermission.create === 'single') && (
                            <Form.Input 
                                label={'Department'}
                                disabled 
                                defaultValue={team.departmentName} 
                                error={!!errors.departmentIds}
                                name='departmentIds'
                            />
                            )}
                            <Form.Input label={'Subject'} defaultValue={create.subject} error={!!errors.subject} name='subject' onChange={(e, data) => this.addData(data)} placeholder='Add your message subject' />
                            <Form.Field>
                                <Form.TextArea label={'Message'} defaultValue={create.message} error={!!errors.message} name='message' onChange={(e, data) => this.addData(data)} placeholder='Add your message' />
                            </Form.Field>
                        </Form>
                        <Label>
                            This message will be delivered to the recipient dashboard and email
                        </Label>
                    </Card.Content>
                    )}
                    {(mode === 'create') && (
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='red' onClick={() => this.discard()}>
                                Discard
                            </Button>
                            <Button basic color='green' disabled={sending} loading={sending} onClick={() => this.send()}>
                                Publish
                            </Button>
                        </div>
                    </Card.Content>
                    )}
                </Card>
            </div>
        )
    }
}
