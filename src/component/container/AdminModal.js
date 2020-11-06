import React, { useState, useEffect } from 'react'
import { Form, Button, Dropdown, Label, List, Icon, Message, Table, Segment } from 'semantic-ui-react';
import validator from "validator"
import { serverTimestamp,  addRole, addDepartment, addTeam, analytics } from '../fbase'
import { RoleForm } from '../container/RoleForm';
import { absolutePermission, adminCreate, widgetName, permissionRole, CSVToArray } from "../../utils/resources";
import RoleView from "./RoleView";

//Fix role and roleId issue
const AdminModal = ({  modalStatus, close, team, departments, fetchingDept, roles, fetchingRole }) => {
    const [sending, setSending] = useState(false)
    const [create, setCreate] = useState({});
    const [errors, setErrors] = useState({});
    const [errorList, setErrorList] = useState([])
    const [permissions, setPermissions] = useState([]);
    const [config, setConfig] = useState('');
    const [teamList, setTeamList] = useState([]);

    useEffect(() => {

        if (modalStatus.type === 'createRole') {
            setCreate(adminCreate('role', team))
        } else if (modalStatus.type === 'createDept') {
            setCreate(adminCreate('department', team))
        }
    }, [])
    
    const addData = (data) => setCreate({ ...create, [data.name]: data.value }) 

    // currently confiquring
    const selectConfig = (config) => setConfig(config)

    const selectWidget = (data) => {
        let widget = data.value[data.value.length - 1];

        if (widget) {
            // if wiget was added before
            if (!!create.permission[widget]) {
                setPermissions(data.value)
            } else {
                setPermissions(data.value)
                setCreate({ 
                    ...create, 
                    permission: {
                        ...create.permission,  
                        [widget]: absolutePermission[widget]
                    }
                })
            }  
        } else {
            setPermissions(data.value)
        }
    }

    const addPermision = (widget, first, firstValue, second, secondValue) => {
        if (second) {
            setCreate({
                ...create, 
                permission: {
                    ...create.permission,  
                    [widget]: {
                        ...create.permission[widget],
                        [first]: {
                            ...create.permission[widget][first],
                            [second]: secondValue
                        }
                    }
                }
            })

        } else {
            setCreate({
                ...create, 
                permission: {
                    ...create.permission,  
                    [widget]: {
                        ...create.permission[widget],
                        [first]: firstValue
                    }
                } 
            })
        }
    }

    const addBulk = (data, index) => {
        if (data.name === 'email') {
            teamList[index][data.name] = data.value;
            setTeamList([...teamList])  
        } else if (data.name === 'departmentId') {
            let department = departments.find(x => x.id === data.value)

            if (department) {
                teamList[index]['departmentId'] = department.id;
                teamList[index]['departmentName'] = department.name;
                setTeamList([...teamList])  
            }
        } else if (data.name === 'roleId') {
            let role = roles.find(x => x.id === data.value)

            if (role) {
                teamList[index]['roleId'] = role.id;
                teamList[index]['roleTitle'] = role.title;
                setTeamList([...teamList])  
            }  
        }
    } 

    const addNewItemToList = () => setTeamList([...teamList, adminCreate('team', team)])

    const deleteTeamItem = (index) => {
        teamList.splice(index, 1)
        setTeamList([...teamList])
    }

    const onUpload = e => {
        e.preventDefault()
        
        if (e.target.files.length > 0) {
        // // Check for the various File API support.
        //     console.log('file length > 0');
            
            if (window.FileReader) {
                // console.log('has file reader');
                if (e.target.files[0].type === "text/csv" || "application/vnd.ms-excel") {
                    // console.log('content type is csv');
                    
                    // FileReader are supported.;
                    var reader = new FileReader();
                    // Read file into memory as UTF-8      
                    reader.readAsText(e.target.files[0]);
                    // Handle file load
                    reader.onload = (event) => {
                        // console.log(event);
                        let  list = []
                        var csvString = event.target.result;
                        
                        CSVToArray(csvString).forEach(arr => {
                            arr.forEach(res => {
                                if (validator.isEmail(res)) {
                                    list.push({ ...adminCreate('team', team), email: res })
                                }
                            })
                        })

                        setTeamList([ ...teamList, ...list]);
                    };

                    //HANDLE FILE ERROR
                    reader.onerror = (evt) => {
                        if(evt.target.error.name === "NotReadableError") {
                            setErrors({ ...errors, general:  'Cannot read file !' })
                        }
                    }
                } else {
                    setErrors({ ...errors, general:  'The file seleceted is not a csv file-type.' })
                }
            } else {
                setErrors({ ...errors, general:  'FileReader are not supported in this browser' })
            }
        }
    }

    const discard = () => {
        setSending(false)
        setErrors({})
        close()
    }

    const validate = (create, permissions, type) => {
        let err = {};

        if ((type === 'createRole') && (!create.title)) err.title = `Title is required to make a role`;
        if ((type === 'createRole') && (permissions.length === 0)) err.permission = 'Add widgets to role';

        if ((type === 'createDept') && (!create.name)) err.name = `Name is required to make a department`;
 
        return err
    }

    const send = () => {
        
        let errors = validate(create, permissions, modalStatus.type)

        if (Object.keys(errors).length === 0) {
                // use permission to map create.permission and check data structure
            setSending(true)
            setErrors({})

            if (modalStatus.type === 'createRole') {
                let permission = {};

                permissions.forEach(permit => {
                    permission[permit] = create.permission[permit] || absolutePermission[permit]
                })
                let data = {
                    ...create,
                    permission,
                } 

                submitRole(data)
            } else if (modalStatus.type === "createDept") {
                submitDept(create)
            }
            
        } else {
            setErrors(errors)
            setSending(false)
        }
        
    }

    const submitDept = (create) => {
        addDepartment({ ...create, createdAt: serverTimestamp ()})
        .then(() => {
            analytics.logEvent("create_department", {
                name: create.name
            })
            discard() 
        })
        .catch(err => {
            setSending(false)
            setErrors({ ...errors, general:  err.message })
        })
    }

    const submitRole = (create) => {
        addRole({ ...create, createdAt: serverTimestamp ()})
        .then(() => {
            analytics.logEvent("create_role", {
                name: create.name
            })
            discard()
        })
        .catch(err => {
            setSending(false)
            setErrors({ ...errors, general:  err.message })        
        })
    }

    const validateBulk = (list) => {
        let errorList = [];
        list.forEach((team, index) => {
            let conflict = list.findIndex((x, i) => ((x.email === team.email) && (index !== i)))
            if (!validator.isEmail(team.email) || !team.departmentId || !team.roleId || (conflict !== -1)) {
                errorList.push(true)
            } else {
                errorList.push(false)
            }
        })

        return errorList
    }

    const submitBulk = () => {
        let errors = validateBulk(teamList)
        let errorCount = errors.reduce((prev, curr) => prev + !!curr? 1 : 0 ,0)
        // console.log({ errors, errorCount });
        if (errorCount === 0) {
                // use permission to map create.permission and check data structure
            setSending(true)
            setErrorList([])
            setErrors({})
            let teamForm = teamList.map(team => addTeam(team))

            Promise.all(teamForm)
            .then((res) => {
                // console.log('success: ', res);
                let failedList = [];
                let msg = '';
                res.forEach(r => {
                    if (r.email) {
                        failedList.push(r.email)
                    }
                })
                if (failedList.length > 0) {
                    msg = `The following invitation [${failedList.toString()}] was not delivered because they are already members for this workspace.`
                }

                analytics.logEvent("send_bulk_invite", {
                    size: team.length,
                    failure: failedList.length,
                    success: teamForm.length - failedList.length
                })
                
                setErrors({ ...errors, general: `Bulk invitation successfully sent. ${msg}` })
                setTeamList([])
                setSending(false)
            })
            .catch((err) => {
                setErrors({ ...errors, general:  err.message })
                setSending(false)
            })
            
        } else {
            setErrorList(errors)
            setSending(false)
        }
    }

    return (
        <div>
            <div style={{ position: 'fixed', top: "0%", left: "0%", width: '80%' }}>
            {(!!errors.general) && ( 
                <Message 
                    content={errors.general} 
                    onDismiss={() => setErrors({ ...errors, general: "" })}
                    compact
                    size="small"
                />
            )}
            </div>
        <Button color="red" size="small" floated="right" onClick={() => close()}>
            <Icon name="close" /> exit
        </Button>
        <br />
        <br />
            {(modalStatus.type === 'createRole') && (
            <Form>
                <Label color='teal' ribbon>
                    Create Role
                </Label>
                <Form.Field>
                    <Form.Input
                        label="Title"
                        error={!!errors.title} 
                        name='title' 
                        fluid 
                        onChange={(e, data) => addData(data)} 
                        placeholder={`Add role title`}
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
                                <Button color={"teal"} size='mini' onClick={() => selectConfig(widget)}>
                                    Edit Permission
                                </Button>
                            </List.Content>)}
                            <List.Content>
                                <List.Header>{widgetName[widget].toUpperCase()}</List.Header>
                            </List.Content>
                            {(config === widget) && (
                            <List.Content>
                                <RoleForm widget={widget} permission={create.permission} addPermision={addPermision}/>
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
                        onChange={(e, data) => selectWidget(data)}
                    />
                </Form.Field>


                <Button basic color='green' disabled={sending} loading={sending} onClick={() => send()}>
                    Publish
                </Button>
            </Form>)}

            {(modalStatus.type === 'createDept') && (
            <Form>
                <Label color='teal' ribbon>
                    Create Department
                </Label>
                <Form.Field>
                    <Form.Input
                        label="Name"
                        error={!!errors.name} 
                        name='name' 
                        fluid 
                        onChange={(e, data) => addData(data)} 
                        placeholder={`Add department name`}
                        defaultValue={create.name} 
                    />
                </Form.Field>

                <Button basic color='green' disabled={sending} loading={sending} onClick={() => send()}>
                    Publish
                </Button>
            </Form>)}

            {(modalStatus.type === 'bulkInvite') && (
            <Segment loading={sending}>
                <Form>
                    <Label color='teal' ribbon>
                        Bulk Invitation
                    </Label>
                    <Message>
                        <Message.Header>
                            Bulk invitation allows you to invite multiple team members together.
                        </Message.Header>
                        <Message.Content>
                        The list below contains the checklist of things to do before you can proceed.
                        </Message.Content>
                        <Message.List>
                            <Message.Item>Create all the departments for team members you want to invite</Message.Item>
                            <Message.Item>Create all roles for the team members you want to invite</Message.Item>
                        </Message.List>

                        <Message.Content>
                        You can use the file input below to add team members' emails via a CSV / Microsoft Excel file or input it manually.
                        </Message.Content>
                    </Message>
                    

                    <Form.Field>
                        <div>
                            <label>Import email list via csv or Microsoft Excel file</label>
                            <input type="file" accept='.csv' onChange={(e) => onUpload(e)} />
                        </div>
                    </Form.Field>
                    <Form.Field>

                        <Table compact celled definition>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell />
                                    <Table.HeaderCell>Email</Table.HeaderCell>
                                    <Table.HeaderCell>Department {(fetchingDept) && (<Icon loading name="spinner" />)}</Table.HeaderCell>
                                    <Table.HeaderCell>Role {(fetchingRole) && (<Icon loading name="spinner" />)}</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {teamList.map((list, index) => (
                                <Table.Row error={!!errorList[index]} key={index}>
                                    <Table.Cell collapsing>
                                        <Icon circular bordered color='red' name="close" onClick={() => deleteTeamItem(index)} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Form.Input value={list.email} error={!!errors.email} type="email" name='email' onChange={(e, data) => addBulk(data, index)} placeholder='Add email' />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Form.Select
                                            fluid placeholder='Select department' 
                                            value={list.departmentId}
                                            options={departments.map(x => ({ key: x.id, value: x.id, text: x.name }))}
                                            loading={!!fetchingDept}
                                            name='departmentId'
                                            onChange={(e, data) => addBulk(data, index)}
                                            error={!!errors.departmentId}
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Form.Select
                                            fluid placeholder='Select role' 
                                            value={list.roleId} 
                                            options={roles.map(x => ({ key: x.id, value: x.id, text: x.title }))}
                                            loading={!!fetchingRole}
                                            name='roleId'
                                            onChange={(e, data) => addBulk(data, index)}
                                            error={!!errors.roleId}
                                        /> 
                                    </Table.Cell>
                                </Table.Row>
                                ))}
                            </Table.Body>

                            <Table.Footer fullWidth>
                                <Table.Row>
                                    <Table.HeaderCell />
                                    <Table.HeaderCell colSpan="2">
                                    </Table.HeaderCell>
                                    <Table.HeaderCell colSpan='1'>
                                        <Button color="teal" fluid onClick={() => addNewItemToList()}>
                                           <Icon name="add" /> Add New Row
                                        </Button>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>
                        {(errorList.length > 0 ) && (
                            <b style={{ color: 'red'}}> You have errors(s) in the rows with a red background color. Check if the email is valid, role and department fields are selected. If you cannot find the source of the error, then check if the email is duplicate on other rows.</b>
                        )}
                        {/* <Icon  name="add" color="teal" bordered circular onClick={() => addNewItemToList()} /> */}

                    </Form.Field>
                

                    <Button basic color='green' disabled={sending} loading={sending} onClick={() => submitBulk()}>
                        Publish
                    </Button>
                </Form>
            </Segment>
            )}

            


            {(modalStatus.type === "viewRole") && (<RoleView role={modalStatus.data} />)}
        </div>
    )
}

export default AdminModal;
