import React, { Component } from 'react'
import { Card, Feed, Icon, Dropdown, Form, Label, Button, Message } from 'semantic-ui-react';
import validator from 'validator';
import styles from '../../styles';
import { fetchAcceptedworkspaces, currentUser, createworkspace, deleteMyworkspace, changeworkspaceName, deleteTeam, transferworkspaceOwnership, generatefirestoreId, analytics } from '../fbase'
import { absolutePermission, permissionRole } from "../../utils/resources";


export default class Workspace extends Component {
    constructor (props) {
        super(props);

        this.state = {
            mode: 'view',
            fetching: false,
            sending: false,
            create: {
                roleTitle: "",
                departmentName: "",
                workspaceName: "",
                widgets: [],
                createdBy: currentUser() ? currentUser().uid : '',
                owner : currentUser() ? currentUser().uid : '',
                createdAt: Date.now()
            },
            data: {

            },
            email: '',
            workspaces: [],
            errors: {},
            newWorkspaceId: ""
        }
    }
    
    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe() 
        }
    }
    
    decideFetch = () => {

        if (!this.unsubscribe) {
            this.setState({ fetching: true }, () => {
                this.getData()
            })
        }
    }

    getData = () => {
        let userId = currentUser() ? currentUser().uid : '';
        this.unsubscribe = fetchAcceptedworkspaces(userId, (res) => {
            this.setState({ fetching: false, workspaces: res  }, () => {
                this.watchTeam()
            })
        }, (err) => {
            this.setState({ errors: { ...this.state.errors, general: err.message }})
        })
    }

    selectworkspace = data => {
        const { workspaces } = this.state;
        
        let workspace = workspaces.find(x => x.id === data.value)

        if (workspace) {
            this.setState({ data: workspace }, () => {
                this.watchTeam()
            })
        }   
    }

    watchTeam = () => {
        const { changeworkspace, onBoard } = this.props;
        const { workspaces, data, newWorkspaceId } = this.state;
        if (!!newWorkspaceId && workspaces.length > 0) {
            let team = workspaces.find(x => x.workspaceId === newWorkspaceId)
            if (team) {
                this.setState({ data: team, newWorkspaceId: "" }, () => {
                    onBoard(team) 
                })
            }
        } else if (data) {
            let team = workspaces.find(x => x.id === data.id)
            if (team) {
                this.setState({ data: team }, () => {
                    changeworkspace(team) 
                })
            }             
        }        
    }
    
    changeMode = (mode) => this.setState({ mode, errors: {} })

    add = () =>  this.changeMode('create')

    addData = (data) => this.setState({  
        create: {
            ...this.state.create,
            [data.name]: data.value,
        }
    })

    discard = () => {
        this.setState({  
            create: {
            ...this.state.create,
            roleTitle: "",
            departmentName: "",
            workspaceName: "",
            widgets: [],
            createdBy: currentUser() ? currentUser().uid : '',
            owner : currentUser() ? currentUser().uid : '',
            createdAt: Date.now()
            },
            sending: false
        })
        this.changeMode('view')
    }

    validate = (create) => {
        let err = {};
        if (!create.id) {
            if (!create.roleTitle) err.roleTitle = 'Role title is required';
            if (!create.departmentName) err.departmentName = 'Department name is required';
            if (!create.widgets.includes('administration')) err.widgets = 'Administration widget is required'
        }

        if (!create.workspaceName) err.workspaceName = 'workspace name is required';
        return err
    }

    send = () => {
        const { create, data } = this.state;
        let errors = this.validate(create)
        let user = currentUser();

        if ((Object.keys(errors).length === 0) && (user !== null)) {
            this.setState({ sending: true, errors: {} },  () => {
                if (!create.id) {
                    let permission = {};
    
                    create.widgets.forEach(widget => {
                        permission[widget] = absolutePermission[widget]
                    })

                    let workspaceId = generatefirestoreId('workspace');
                    this.decideFetch();

                    createworkspace(create.workspaceName, create.roleTitle, create.departmentName, user.uid, user.displayName, user.email, permission, workspaceId, user.photoURL)
                    .then(() => {
                        analytics.logEvent("create_worksapce", {
                            userName: user.displayName,
                            userId: user.uid,
                            userEmail: user.email
                        })
                        if (sessionStorage.getItem("affiliateId")) {
                            analytics.logEvent("create_worksapce_with_affililate", {
                                affiliateId: sessionStorage.getItem("affiliateId"),
                                userName: user.displayName,
                                userId: user.uid,
                                userEmail: user.email
                            })
                        }
                        this.setState({ newWorkspaceId: workspaceId.id }, () => {
                            this.discard();
                        })
                    })
                    .catch((err) => {
                        this.setState({ sending: false, errors: { ...this.state.errors, general: err.message }})
                    })
                } else {
                    changeworkspaceName(data.workspaceId, create.workspaceName)
                    .then(err => {
                        this.discard()
                    })
                    .catch(err => {
                        this.setState({ sending: false, errors: { ...this.state.errors, general: err.message }})
                    })
                }
            })
        } else {
            this.setState({ errors })
        }
    }

    editworkspace = data => this.setState({ create: data, mode: 'create' })

    deleteworkspace = () => {
        const { data} = this.state;
        this.setState({ sending: true }, () => {
            deleteMyworkspace(data.workspaceId)
            .then(res => {
                analytics.logEvent("delete_workspace", {
                    workspaceId: data.workspaceId || "",
                    workspaceName: data.workspaceName || "",
                    date: new Date()
                })
                this.setState({ data: {} },() => {
                    this.discard()
                })  
            })
            .catch(err => {
                this.setState({ sending: false, errors: { ...this.state.errors, general: err.message }})
            })
        })
    }

    leaveworkspace = () => {
        const { data } = this.state;
        this.setState({ sending: true }, () => {
            deleteTeam(data)
            .then(res => {
                let user =currentUser()
                analytics.logEvent("leave_workspace", {
                    userId:  user.uid,
                    userEmail: user.email,
                    date: new Date()
                })
                this.setState({ data: {} },() => {
                    this.discard()
                })  
            })
            .catch(err => {
                this.setState({ sending: false, errors: { ...this.state.errors, general: err.message }})
            })
        })
    }


    transferworkspace = () => {
        const { data, email } = this.state;

        if (!validator.isEmail(email)) {
            this.setState({ errors: { ...this.state.errors, email: 'Enter avalid email address' } })
        } else {
            this.setState({ sending: true, errors: {} }, () => {
                transferworkspaceOwnership(email, data.id, data.workspaceId, data.workspaceName)
                .then(res => {
                    analytics.logEvent("transfer_workspace_ownership", {
                        newOwnerEmail: email,
                        oldOwnerEmail: currentUser().email,
                        date: new Date()
                    })
                    this.setState({ data: {} },() => {
                        this.discard()
                    })  
                })
                .catch(err => {
                    this.setState({ sending: false, errors: { ...this.state.errors, general: err.message }})
                })
            })
        }
    }



    render() {
        const { mode, data, fetching, sending, errors, workspaces, create, email } = this.state;

        return (
            <div>
                <Card>
                    <Card.Content>
                        <div style={styles.between}>
                            <Card.Header as='h3'>Workspaces</Card.Header>
                            <Icon bordered inverted color='teal' name='add' onClick={() => this.add()} />
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
                        <div>
                            {(!data.id) && (
                                <Card.Meta textAlign='center'>
                                    <b>Create or select workspace</b>
                                </Card.Meta>
                            )}

                            {(!!data.id) && (
                            <div>
                                    <Feed.Event>
                                        <Feed.Content>
                                            <div style={styles.betweenStart}>
                                                <Feed.Summary>{data.workspaceName}</Feed.Summary>

                                                <Dropdown icon="ellipsis vertical" pointing="right">
                                                    <Dropdown.Menu>
                                                        {(data.owner) && (
                                                        <Dropdown.Item text='Edit' onClick={() => this.editworkspace(data)} />
                                                        )}
                                                        {(data.owner) && (
                                                        <Dropdown.Item text='Delete' onClick={() => this.changeMode('delete')}/>)}
                                                        {(!data.owner) && (
                                                        <Dropdown.Item text='Leave' onClick={() => this.changeMode('leave')}/>)}
                                                        {(data.owner) && (
                                                        <Dropdown.Item text='Transfer Ownership' onClick={() => this.changeMode('transfer')}/>)}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                            <Feed.Meta>{data.roleTitle} role</Feed.Meta>
                                            <Feed.Meta>{data.departmentName} department</Feed.Meta>

                                        </Feed.Content>
                                    </Feed.Event>
                            </div>)}
                        </div>
                    </Card.Content>
                    )}
                    {(mode === 'create') && (
                    <Card.Content>
                        <Label color='teal' ribbon>
                            {!create.id? 'Create' : 'Edit'} workspace
                        </Label>
                        <Form>
                            <Form.Field>
                                <Form.Input label={'Workspace or Company Name'} defaultValue={create.workspaceName} error={!!errors.workspaceName} name='workspaceName' onChange={(e, data) => this.addData(data)} placeholder='Add workspace or company name' />
                            </Form.Field>

                            {(!create.id) && (
                            <Form.Field>
                                <Form.Input label={'Role Title'} defaultValue={create.roleTitle} error={!!errors.roleTitle} name='roleTitle' onChange={(e, data) => this.addData(data)} placeholder='Add role title' />
                            </Form.Field>)}

                            {(!create.id) && (
                                <Form.Select 
                                label={'Role Widgets'}
                                placeholder='Select widget for your role'
                                fluid
                                multiple
                                search
                                selection
                                error={!!errors.widgets && ({ 
                                    content: errors.widgets,
                                    pointing: 'above',
                                })} 
                                name="widgets"
                                options={permissionRole}
                                value={create.widgets}
                                onChange={(e, data) => this.addData(data)}
                            />

                            )}
                            {(!create.id) && (
                            <Form.Field>
                                <Form.Input label={'Department Name'} defaultValue={create.departmentName} error={!!errors.departmentName} name='departmentName' onChange={(e, data) => this.addData(data)} placeholder='Add department name' />
                            </Form.Field>)}
                        </Form>
                         <br />
                        {(!create.id) && <Label>
                            Your 10 days free trial will start after creating this workspace
                        </Label>}
                       
                    </Card.Content>
                    )}
                    {(mode === 'create') && (
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='red' disabled={sending} onClick={() => this.discard()}>
                                Discard
                            </Button>
                            <Button basic color='green' disabled={sending} loading={sending} onClick={() => this.send()}>
                                Publish
                            </Button>
                        </div>
                    </Card.Content>
                    )}
                    {(mode === 'delete') && (
                    <Card.Content>
                        <p>Are you sure you want to delete this workspace?</p>
                    </Card.Content>)}
                    {(mode === 'delete') && (
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='red' disabled={sending} onClick={() => this.discard()}>
                                Discard
                            </Button>
                            <Button basic color='green' disabled={sending} loading={sending} onClick={() => this.deleteworkspace()}>
                                Delete
                            </Button>
                        </div>
                    </Card.Content>)}
                    {(mode === 'leave') && (
                    <Card.Content>
                        <p>Are you sure you want to leave this workspace?</p>
                    </Card.Content>)}
                    {(mode === 'leave') && (
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='red' disabled={sending} onClick={() => this.discard()}>
                                Discard
                            </Button>
                            <Button basic color='green' disabled={sending} loading={sending} onClick={() => this.leaveworkspace()}>
                                Leave
                            </Button>
                        </div>
                    </Card.Content>)}
                    {(mode === 'transfer') && (
                    <Card.Content>
                        <Label color='teal' ribbon>
                            Transfer workspace Ownership
                        </Label>
                        <Form>
                            <Form.Field>
                                <Form.Input label={'Team Email'} defaultValue={email} error={!!errors.email} name='email' onChange={(e, { value }) => this.setState({ email: value })} placeholder='Add team email' />
                            </Form.Field>
                        </Form>
                    </Card.Content>)}
                    {(mode === 'transfer') && (
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='red' disabled={sending} onClick={() => this.discard()}>
                                Discard
                            </Button>
                            <Button basic color='green' disabled={sending} loading={sending} onClick={() => this.transferworkspace()}>
                                Transfer
                            </Button>
                        </div>
                    </Card.Content>)}
                    {(mode === 'view') && (
                    <Card.Content extra>
                        <Dropdown
                            placeholder='Select workspace'
                            fluid
                            search
                            selection
                            options={workspaces.map(x => ({ key: x.id, value: x.id, text: x.workspaceName }))}
                            loading={fetching}
                            onClick={() => this.decideFetch()}
                            onChange={(e, data) => this.selectworkspace(data)}
                        />
                    </Card.Content>
                    )}
                </Card>
            </div>
        )
    }
}
