import React, { Component, createRef } from 'react'
import validator from  'validator'
import { Card, Feed, Divider, Input, Form, Button, Dropdown, Confirm, Label, List, Icon, Message, Popup, Segment, Dimmer, Loader, Image, Modal } from 'semantic-ui-react';
import styles from '../../styles';
import { serverTimestamp, fetchDepartments, getAllTeamsByDepartment, fetchRoles, addRole, addTeam, addDepartment, editDepartment, editRole, editTeam, deleteDepartment, deleteTeam, deleteRole, analytics } from '../fbase'
import { RoleForm } from '../container/RoleForm';
import { absolutePermission, adminCreate, widgetName, permissionRole, widgetDescription } from "../../utils/resources";
import AdminModal from "../container/AdminModal"


//Fix role and roleId issue
export default class Administration extends Component {
    constructor (props) {
        super(props);

        this.state = {
            mode: 'view',
            confirmDelete:  false,
            deleteData: null,
            fetchingDept: false,
            fetchingTeam: false,
            fetchingRole: false,
            sending: false,
            create: {},
            selectedDept: {},
            departments: [],
            teams: [],
            roles: [],
            errors: {},
            type: "",
            active: "",
            permissions: [],
            config: "",
            search: '',
            modalStatus: {
                open: false,
                data: {},
                type: ""
            }
        }

        this.title = createRef()
    }

    componentWillUnmount() {
        if (this.unTeam) {
            this.unTeam() 
        }
        if (this.unrole) {
            this.unrole()
        }
        if (this.undept) {
            this.undept()
        }
    }

    getDepartment= () => {
        const {team } = this.props
        if (!this.undept) {
            this.setState({ fetchingDept: true }, () => {
                this.undept = fetchDepartments(team.workspaceId, (res) => {
                    //console.log('dept: ', res);
                    this.setState({ fetchingDept: false, departments: res, active: 'department' })
                }, (err) => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            })
        } else {
            this.setState({ active: 'department' })
        }
    }


    selectDepartment= (value) => {
        const { departments} = this.state;
        const department =  departments.find(x => x.id ===  value);
        if (department) {
            this.setState({ fetchingTeam: true, selectedDept: department, team: [] }, () => {
                this.getTeam(department.id) 
            })
        } else {
            this.setState({ fetchingTeam: false, selectedDept: {}, team: [] })
        }
    }

    getTeam = (id) => {
        if (this.unTeam) {
            this.unTeam()
        }

        this.unTeam = getAllTeamsByDepartment(id, (res) => {
            this.setState({ fetchingTeam: false , teams: res  })
        }, (err) => {
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }

    getRole= () => {
        const { team} = this.props;

        if (!this.unrole) {
            this.setState({ fetchingRole: true }, () => {
                this.unrole = fetchRoles(team.workspaceId, (res) => {
                    this.setState({ fetchingRole: false , roles: res, active: 'role' })
                }, (err) =>  {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            })
        } else {
            this.setState({ active: 'role' })
        }
    }

    adminAdd = async (type, info)  => {
        const { team } = this.props;
        await this.discard();
        let indoData = info? info : {};
        this.setState({ type: type, mode: 'create', create: {...adminCreate(type, team), ...indoData } })
    }

    adminEdit = (type, data) => this.setState({ type: type, mode: 'create', create: data, permissions: data.permission? Object.keys(data.permission) : [] })

    addData = (data) => this.setState({  
        create: {
            ...this.state.create,
            [data.name]: data.value,
        }}
    )

    searchTeams = (data) => this.setState({  search: data.value })

    // currently confiquring
    selectConfig = (config) => this.setState({ config })

    selectWidget = (data) => {
        const { create } = this.state;
        let widget = data.value[data.value.length - 1];

        if (widget) {
            // if wiget was added before
            if (!!create.permission[widget]) {
                this.setState({ permissions: data.value })
             } else {
                 this.setState({ 
                     permissions: data.value, 
                     create: { 
                         ...this.state.create, 
                         permission: {
                             ...this.state.create.permission,  
                             [widget]: absolutePermission[widget]
                         }
                     } 
                 }, () => {
                    //  console.log(this.state.create.permission);
                 })
             }  
        } else {
            this.setState({ permissions: data.value })
        }
    }

    addTeamRole = (data) => {
        const { roles } = this.state;
        
        let role = roles.find(x => x.id === data.value)

        if (role) {
            this.setState({ create: { ...this.state.create, roleId: role.id, roleTitle: role.title }})
        }   
    }

    addTeamDept = (data) => {
        const { departments } = this.state;
        
        let department = departments.find(x => x.id === data.value)

        if (department) {
            this.setState({ create: { ...this.state.create, departmentId: department.id, departmentName: department.name }})
        }
    }

    initBulkInvite = () => {
        this.getDepartment();
        this.getRole();
        this.setModalStatus(true, 'bulkInvite')
    }

    addPermision = (widget, first, firstValue, second, secondValue) => {
         if (second) {
             this.setState({ create: { 
                 ...this.state.create, 
                 permission: {
                     ...this.state.create.permission,  
                     [widget]: {
                         ...this.state.create.permission[widget],
                         [first]: {
                             ...this.state.create.permission[widget][first],
                             [second]: secondValue
                         }
                     }
                 }} 
             })
         } else {
             this.setState({ create: { 
                 ...this.state.create, 
                 permission: {
                     ...this.state.create.permission,  
                     [widget]: {
                         ...this.state.create.permission[widget],
                         [first]: firstValue
                     }
                 }} 
             })
        }
     }

    discard = () => this.setState({sending: false, create: {}, mode: "view", errors: {}, permissions: [], config: '' })

    validate = (create, permissions, type) => {
        let err = {};

        if ((type === 'role') && (!create.title)) err.title = `Title is required to make a ${type}`;
        if ((type === 'role') && (permissions.length === 0)) err.permission = 'Add widgets to role';

        if ((type === 'department') && (!create.name)) err.name = `Name is required to make a ${type}`;

        if (type === 'team') {
            if (!validator.isEmail(create.email)) err.email = 'Enter valid email address';
            if (!create.roleId) err.roleId = `Role is required to make a ${type}`;
            if (!create.departmentId) err.departmentId = `Department is required to make a ${type}`;
        }
 
        return err
    }

    send = () => {
        const { create, permissions, type } = this.state;
        
        let errors = this.validate(create, permissions, type)

        if (Object.keys(errors).length === 0) {
                // use permission to map create.permission and check data structure
            this.setState({ sending: true, errors: {} }, () => {
                if (type === 'role') {
                    let permission = {};
    
                    permissions.forEach(permit => {
                        permission[permit] = create.permission[permit] || absolutePermission[permit]
                    })
                    let data = {
                        ...create,
                        permission,
                    } 
    
                    this.submitRole(data)
                } else if (type === "team") {
                    this.submitTeam(create)
                } else if (type === "department") {
                    this.submitDept(create)
                }
            })
        } else {
            this.setState({ errors, sending: false })
        }
        
    }

    submitDept = (create) => {
        if (!create.id) {
            addDepartment({ ...create, createdAt: serverTimestamp ()})
            .then(() => {
                analytics.logEvent("create_department", {
                    name: create.name
                })
                this.discard() 
            })
            .catch(err => {
                this.setState({ sending: false, errors: { ...this.state.errors, general:  err.message }})
            })
        } else {
            editDepartment(create)
            .then(() => {
                this.discard()
            })
            .catch(err => {  
                this.setState({ sending: false, errors: { ...this.state.errors, general:  err.message }})
            })
        }
    }

    submitTeam = (create) => {
        if (!create.id) {
            addTeam({ ...create, createdAt: serverTimestamp ()})
            .then(() => {
                analytics.logEvent("create_team", {
                    email: create.email
                })
                this.discard()
            })
            .catch(err => {
                this.setState({ sending: false, errors: { ...this.state.errors, general:  err.message }})
            })
        } else {
            editTeam(create)
            .then(() => {
                this.discard()
            })
            .catch(err => {
                this.setState({ sending: false, errors: { ...this.state.errors, general:  err.message }})
            })
        }
    }

    submitRole = (create) => {
        if (!create.id) {
            addRole({ ...create, createdAt: serverTimestamp ()})
            .then(() => {
                analytics.logEvent("create_role", {
                    name: create.name
                })
                this.discard()
            })
            .catch(err => {
                this.setState({ sending: false,  errors: { ...this.state.errors, general:  err.message }})
            })
        } else {
            editRole(create)
            .then(() => {
                this.discard() 
            })
            .catch(err => {
                this.setState({ sending: false, errors: { ...this.state.errors, general:  err.message }})
            })
        }
    }

    adminConfirmDelete = (type, data) => this.setState({ type, confirmDelete: true, deleteData: data })

    adminDelete = () => {
        const { type, deleteData } = this.state;
        this.setState({ confirmDelete: false }, () => {
            if (type === 'team') {
                deleteTeam(deleteData)
                .then(() => {
    
                })
                .catch(err => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            } else if (type === 'role') {
                deleteRole(deleteData.id)
                .then(() => {
                })
                .catch(err => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            } else if (type === 'department') {
                deleteDepartment(deleteData.id)
                .then(() => {
                    this.setState({ selectedDept: { } })
                })
                .catch(err => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            }
        })
    }

    setModalStatus = (open, type, data) => this.setState({ modalStatus: { open, type: type || "", data: data || {} } }, () => {
        this.title.click()
    })

    render() {
        const { mode, departments, teams, roles, fetchingDept, fetchingTeam, fetchingRole, search,
             sending, errors, confirmDelete, type, active, create, permissions, config, selectedDept, modalStatus } = this.state;
            
         const { rolePermission, team: myTeam } = this.props;
        // use permission to display button (add and select)
        return (
            <div>
                <Card>
                    <Card.Content>
                        <div ref={(x) => this.title = x} style={styles.between}>
                            <div>
                            <Card.Header as='h3'>
                                Administration
                                <Popup trigger={<Icon size='small' link name='key' />}>
                                    <Popup.Header>Permission</Popup.Header>
                                    <Popup.Content>
                                            <p>You can read administrative data 
                                            {rolePermission.department? ', manage departments' : ''}
                                            {rolePermission.role? ', manage roles' : ''} 
                                            {rolePermission.team? ', manage team members' : ''} 
                                            </p>
                                        
                                    </Popup.Content>
                                </Popup>
                            </Card.Header>
                            <Card.Meta>
                            {widgetDescription.administration} 
                            </Card.Meta>
                            </div>

                            <Dropdown icon='' className='link item' trigger={<Icon bordered inverted color='teal' name='add' />}>
                                <Dropdown.Menu>
                                    <Dropdown.Item disabled={!rolePermission.department} onClick={() => this.adminAdd('department')}>Add Department</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item disabled={!rolePermission.role} onClick={() => this.adminAdd('role')}>Add Role</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item disabled={!rolePermission.team} onClick={() => this.adminAdd('team')}>Add Team Member</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <Popup
                            on="click"
                            trigger={
                            <Label as={"a"} color="grey">
                                <Icon color="teal" inverted name="info" /> Click here to reveal relationship between roles, departments and team members
                            </Label>
                            }
                        >
                            <Popup.Content>
                                A role has a title and a group of widgets with configurable permissions.
                            </Popup.Content>
                            <Popup.Content>
                                A department contains a group of team members.
                            </Popup.Content>
                            <Popup.Content>
                                A team member is in a department and has a role
                            </Popup.Content>
                        </Popup>
                        {(!!errors.general) && (
                        <Message 
                            error 
                            content={errors.general} 
                            onDismiss={() => this.setState({ errors: { ...errors, general: "" }})}
                            compact
                            size="tiny"
                        />)}
                    </Card.Content>
                    <Confirm
                        open={confirmDelete}
                        content={`Are you sure you want to delete ${type}`}
                        onCancel={() => this.setState({ confirmDelete:  false })}
                        onConfirm={() => this.adminDelete()}
                    />

                    {(mode === 'view') && (
                    <Card.Content>
                        <Button.Group fluid>
                            <Button active={active === 'department'} loading={fetchingDept} disabled={fetchingDept} onClick={() => this.getDepartment()}>Department</Button>
                            <Button.Or />
                            <Button active={active === 'role'} loading={fetchingRole} disabled={fetchingRole} onClick={() => this.getRole()}>Role</Button>
                        </Button.Group>
                    </Card.Content>
                    )}

                    {(mode === 'view') && (
                    <Card.Content>
                        {(!active) && (
                            <Card.Meta textAlign='center'>
                                <b>Select department or role to explore</b>     
                            </Card.Meta>
                        )}
                        {(!selectedDept.id) && (active === 'department') && (
                            <Card.Meta textAlign='center'>
                                <b>Select a department from the dropdown below</b>    
                            </Card.Meta>
                        )}
                        {(!!selectedDept.id) && (active === 'department') &&  (
                            <Segment inverted>
                                <div style={styles.betweenStart}>
                                <Card.Header>
                                    {selectedDept.name} Department
                                </Card.Header>

                                <Dropdown icon="ellipsis vertical" pointing="right">
                                    <Dropdown.Menu>
                                        <Dropdown.Item disabled={!rolePermission.department} icon="add" text='Add Department' onClick={() => this.adminAdd('department')} />
                                        <Dropdown.Item disabled={!rolePermission.department} icon="edit" text='Edit Department' onClick={() => this.adminEdit('department', selectedDept)} />
                                        <Dropdown.Item disabled={!rolePermission.department} icon="trash" text='Delete Department' onClick={() => this.adminConfirmDelete('department', selectedDept)} />
                                        <Dropdown.Divider/>
                                        <Dropdown.Item disabled={!rolePermission.team} icon="add" text="Add Team member" onClick={() => this.adminAdd('team', { departmentName: selectedDept.name, departmentId: selectedDept.id })} />
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                            <Input
                                placeholder='Search by role or name'
                                fluid
                                onChange={(e, data) => this.searchTeams(data)}
                                disabled={teams.length === 0}
                                defaultValue={search}
                                icon="search"
                            />
                            {teams.length} members
                            </Segment>
                        )}

                        {(active === 'role') &&  (
                            <Segment inverted>
                                <Button size={'mini'} basic  fluid color="teal" disabled={!rolePermission.team} icon="add" onClick={() => this.adminAdd('role')}>
                                    Create new role
                                </Button>
                                <br />
                                <Input
                                    placeholder='Search role'
                                    fluid
                                    onChange={(e, data) => this.searchTeams(data)}
                                    defaultValue={search}
                                    icon="search"
                                />
                            </Segment>
                        )}
                        <div style={styles.limit}>
                            {(fetchingTeam) && (
                            <Segment>
                                <Dimmer active inverted>
                                    <Loader inverted />
                                </Dimmer>

                                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                            </Segment>
                            )}
                            {(active === 'department') && (!!selectedDept.id) && (!fetchingTeam) && (teams.length === 0) && (
                                <Card.Meta textAlign='center'>
                                    <b>There is no team member in this department. You can add a team member with the <Icon name="add" /> or <Icon name="ellipsis vertical" /> icon above.</b>
                                     
                                </Card.Meta>
                            )}
                            {(!!selectedDept.id) && (active === 'department') && (
                            <Feed.Event>           
                                {teams.filter(x => x.name.toLowerCase().includes(search.toLowerCase()) || x.roleTitle.toLowerCase().includes(search.toLowerCase()) ).map(team => (
                                    <div key={team.id}>
                                        <Feed.Content>
                                            <Feed.Summary>
                                                <div style={styles.betweenStart}>
                                                    {team.accepted? team.name : <h5 style={{ color: 'red', margin: 0 }}>PENDING ACCEPTANCE</h5>}

                                                    <Dropdown disabled={!rolePermission.team} icon="ellipsis vertical" pointing="right">
                                                        <Dropdown.Menu>
                                                        <Dropdown.Item text='Edit' onClick={() => this.adminEdit('team', team)} />
                                                        <Dropdown.Item text='Delete' onClick={() => this.adminConfirmDelete('team', team)} />
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>            
                                            </Feed.Summary>
                                            <Feed.Meta>{team.email}</Feed.Meta>
                                            <Feed.Meta>{team.roleTitle} Role</Feed.Meta>
                                            {(team.owner) && (<Feed.Meta>Workspace Owner</Feed.Meta>)}
                                        </Feed.Content>
                                        <Divider />
                                    </div>
                                ))}
                            </Feed.Event>
                            )}


                            {(active === 'role') && (
                            <Feed.Event>
                                {roles.filter(x => x.title.toLowerCase().includes(search.toLowerCase()) ).map(role => (
                                    <div key={role.id}>
                                        <Feed.Content>
                                            <Feed.Summary>
                                            <div style={styles.between}>
                                                <Card.Header as="a" onClick={() => this.setModalStatus(true, 'viewRole', role)}>
                                                    {role.title} 
                                                </Card.Header>
                                                
                                                <Dropdown disabled={!rolePermission.role} icon="ellipsis vertical" pointing="right">
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item text='Edit' onClick={() => this.adminEdit('role', role)} />
                                                        <Dropdown.Item text='Delete' onClick={() => this.adminConfirmDelete('role', role)} />
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>           
                                            </Feed.Summary>
                                        </Feed.Content>
                                        <Divider />
                                    </div>
                                ))}
                            </Feed.Event> )}
                        </div>
                    </Card.Content>
                    )}
                    {(mode === 'view') && (
                    <Card.Content extra>
                        {(active === 'department') && (
                            <Dropdown
                                placeholder='Select department'
                                fluid
                                search
                                selection
                                options={departments.map(dept => ({ text: dept.name, value: dept.id, key: dept.id }))}
                                loading={!!fetchingDept}
                                onClick={() => this.getDepartment()}
                                onChange={(e, { value }) => this.selectDepartment(value)}
                            /> 
                        )}
                    </Card.Content>)}

                    {(mode === 'create') && (
                        <Card.Content>
                        <Label color='teal' ribbon>
                            {create.id?  "Edit" : "Add"} {type}
                        </Label>
                            <Form>
                                {(type === 'department') && (<Form.Field>
                                    <Form.Input
                                        label="Name"
                                        error={!!errors.name} 
                                        name='name' 
                                        fluid 
                                        onChange={(e, data) => this.addData(data)} 
                                        placeholder={`Add ${type} name`}
                                        defaultValue={create.name} 
                                    />
                                </Form.Field>)}


                                {(type === 'role') && (
                                <div>
                                <Form.Field>
                                    <Form.Input
                                        label="Title"
                                        error={!!errors.title} 
                                        name='title' 
                                        fluid 
                                        onChange={(e, data) => this.addData(data)} 
                                        placeholder={`Add ${type} title`}
                                        defaultValue={create.title} 
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label>Widgets</label>
                                    <Label pointing="below">
                                        Select widgets and configure their permissions (<b>VERY IMPORTANT</b>) from the dropdown below
                                    </Label>
                                    <div style={{maxHeight: 200, overflowY: 'auto', padding: '3px' }}>
                                    <List divided relaxed>
                                        {permissions.map(widget => (
                                        <List.Item key={widget}>
                                            {(config !== widget) && (
                                            <List.Content floated='right'>
                                                <Button color={"teal"} size='mini' onClick={() => this.selectConfig(widget)}>
                                                   Edit Permission
                                                </Button>
                                            </List.Content>)}
                                            <List.Content>
                                                <List.Header>{widgetName[widget].toUpperCase()}</List.Header>
                                            </List.Content>
                                            {(config === widget) && (
                                            <List.Content>
                                                <RoleForm widget={widget} permission={create.permission} addPermision={this.addPermision}/>
                                            </List.Content>)}
                                        </List.Item>
                                        ))}
                                    </List>
                                    </div>
                                    <Dropdown
                                        placeholder='Select widget for role'
                                        fluid
                                        multiple
                                        search
                                        selection
                                        error={!!errors.permission}
                                        options={permissionRole}
                                        value={permissions}
                                        onChange={(e, data) => this.selectWidget(data)}
                                    />
                                </Form.Field>
                                </div>)}

                                {(type === 'team') && (<div>
                                    
                                    <Label>
                                        The team members you invite will be added to this workspace after they accept their invitations                                    </Label>
                                    <br />
                                    <br />

                                    {(!create.id) && (
                                        <Button fluid color="black" onClick={() => this.initBulkInvite()}>
                                            Bulk Invitation
                                        </Button>
                                    )}

                                    <h3 style={{ textAlign: "center" }}>Or</h3>

                                    {(!create.id) && (
                                    <Form.Field>
                                        <Form.Input 
                                            label="Email"
                                            error={!!errors.email} 
                                            type='email' 
                                            name='email' 
                                            fluid onChange={(e, data) => this.addData(data)} 
                                            placeholder='Add email'
                                            defaultValue={create.email} 
                                        />
                                    </Form.Field>)}


                                    <Form.Field>
                                        <div style={styles.betweenStart}>
                                            <label>
                                                Department
                                            </label>

                                            <Popup
                                                trigger={<Icon name="add circle" color="black"/>}
                                                on="click"
                                            >
                                                <Popup.Content>
                                                    Select a department from the dropdown below or create a new department.
                                                </Popup.Content>
                                                <Popup.Content>
                                                    <Button fluid disabled={!rolePermission.department} onClick={() => this.setModalStatus(true, 'createDept')}> 
                                                        Create new department
                                                    </Button>
                                                </Popup.Content>
                                            </Popup>
                                        </div>
                                        <Form.Select
                                            fluid placeholder='Select department' 
                                            defaultValue={create.departmentId}
                                            options={departments.map(x => ({ key: x.id, value: x.id, text: x.name }))}
                                            loading={!!fetchingDept}
                                            onClick={() => this.getDepartment()}
                                            name='departmentId'
                                            onChange={(e, data) => this.addTeamDept(data)}
                                            error={!!errors.departmentId}
                                        />
                                    </Form.Field>

                                    <Form.Field>
                                    <div style={styles.betweenStart}>
                                            <label>
                                                Role
                                            </label>

                                            <Popup
                                                trigger={<Icon name="add circle" color="black"/>}
                                                on="click"
                                            >
                                                <Popup.Content>
                                                    Select a role from the dropdown below or create a new role.
                                                </Popup.Content>
                                                <Popup.Content>
                                                    <Button disabled={!rolePermission.role} fluid onClick={() => this.setModalStatus(true, 'createRole')}> 
                                                        Create new role
                                                    </Button>
                                                </Popup.Content>
                                            </Popup>
                                        </div>
                                        <Form.Select
                                            fluid placeholder='Select role' 
                                            defaultValue={create.roleId} 
                                            options={roles.map(x => ({ key: x.id, value: x.id, text: x.title }))}
                                            loading={!!fetchingRole}
                                            onClick={() => this.getRole()}
                                            name='roleId'
                                            onChange={(e, data) => this.addTeamRole(data)}
                                            error={!!errors.roleId}
                                        />                            
                                    </Form.Field>
                                    <Label pointing="above">
                                        The widgets and permissions you want the team member(s) to have.
                                    </Label>
                                </div>)}
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
                                    Publish
                                </Button>
                            </div>
                        </Card.Content>
                    )}
                </Card>

                <Modal 
                open={modalStatus.open}
                onClose={() => this.setModalStatus(false)}
                dimmer="inverted"
                closeOnDimmerClick={false}
                >
                    <Modal.Content>
                        <AdminModal departments={departments} roles={roles} fetchingDept={fetchingDept} fetchingRole={fetchingRole} team={myTeam} modalStatus={modalStatus} close={() => this.setModalStatus(false)} />
                    </Modal.Content>
                    
                </Modal>
            </div>
        )
    }
}
