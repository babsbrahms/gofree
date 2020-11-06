import React, { Component } from 'react'
import { Form, Message, Label } from 'semantic-ui-react';
import { addData, updateData, fetchDepartments, serverTimestamp, updateprojectandTask, analytics } from '../fbase'


export default class projectView extends Component {
    constructor (props) {
        super(props);

        this.state = {
            sending: false,
            data: {
                name: '',
                description: '',
                departmentIds: [],
                createdAt: new Date(),
                createdBy: props.team.userId,
                workspaceId: props.team.workspaceId
            },
            errors: {},
            departments: [],
            loading: true
        }
    }

    componentDidMount() {
        const { selectedproject } = this.props;

        if (selectedproject.id) {
            this.setState({ data: { ...this.state.data, ...selectedproject } })
        }
        this.getDept()
    }
    
    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe()
        }
    }
     
    getDept = () => {
        const { team } = this.props;
        this.unsubscribe = fetchDepartments(team.workspaceId, (res) => {
            this.setState({ departments:  res, loading: false })
        })
    }

    addData = (data) => this.setState({  
        data: {
            ...this.state.data,
            [data.name]: data.value,
        }}
    )

    discard = () => {
        this.setState({  
            data: {
                ...this.state.data,
                name: '',
                message: '',
            },
            errors: {}, 
            sending: false
        }, () => {
            this.props.close()
        })
    }

    validate = (name, departmentIds, permission, myDept) => {
        let err = {};

        if (!name) err.name = 'Name is required to make a project';
        if (departmentIds.length === 0) err.departmentIds = 'Department(s) are required to make a project';
        if ((permission === 'single') && !departmentIds.includes(myDept)) {
            err.departmentIds = departmentIds.length > 0 ? 'Your department is not included in selected departments' : "Add your department and other department that will collaborate on this project "
        }
        return err
    }

    send = () => {
        const { data } = this.state;
        const { selectedproject, pickProject, permission, team } = this.props;

        this.setState({ sending: true, errors: {} }, () => {
            let errors = this.validate(data.name, data.departmentIds, permission, team.departmentId)
            if (Object.keys(errors).length === 0) {
                if (!data.id) {
                    addData('project', { ...data, createdAt: serverTimestamp() }, (res) => {
                        analytics.logEvent("create_project", {
                            departmentIds: data.departmentIds
                        })
                        this.discard();
                        pickProject(res.id)
                    }, (err) => {
                        this.setState({ sending: false }, () => {
                            this.setState({ errors: { ...this.state.errors, general:  err.message }})
                        })
                    })
                } else {
                    if ((selectedproject.name === data.name) && (selectedproject.departmentIds.toString() === data.departmentIds.toString())) {
                        updateData('project', data.id, data, () => {
                            analytics.logEvent("update_project", {
                                departmentIds: data.departmentIds
                            })
                            this.discard()
                        }, (err) => {
                            this.setState({ sending: false, errors: { ...this.state.errors, general:  err.message }})
                        })
                    } else {
                        updateprojectandTask(data)
                        .then(res => {
                            analytics.logEvent("update_project", {
                                departmentIds: data.departmentIds
                            })
                            this.discard()
                        })
                        .catch(err => {
                            this.setState({ sending: false, errors: { ...this.state.errors, general:  err.message }})
                        })
                    }

                }
            } else {
                this.setState({ errors, sending: false })
            }
        })
    }

    render() {
        const { errors, data, departments, sending } = this.state;

        return (
        <div>
            {(!!errors.general) && (<Message 
                error 
                content={errors.general} 
                onDismiss={() => this.setState({ errors: { ...errors, general: "" }})}
                compact
                size="tiny"
            />)}
            <Form>
                <Form.Field>
                    <Form.Input required label={'Name'} defaultValue={data.name} error={!!errors.name} name='name' onChange={(e, data) => this.addData(data)} placeholder='Add project name' />
                </Form.Field>
                <Form.Field>
                    <Form.TextArea label={'Description'} defaultValue={data.description} error={!!errors.description} name='description' onChange={(e, data) => this.addData(data)} placeholder='Add project description' />
                </Form.Field>

                <Label pointing="below">
                    select department(s) that will collaborated on this project
                </Label>
                <Form.Select
                    label={'Department(s)'}
                    required
                    placeholder='Add department(s) to project'
                    fluid
                    multiple
                    search
                    selection
                    name={'departmentIds'}
                    error={!!errors.departmentIds && ({ content: errors.departmentIds })}
                    options={departments.map(dept => ({ x: dept.id, text: dept.name, value: dept.id }))}
                    value={data.departmentIds}
                    onChange={(e, data) => this.addData(data)}
                />

                <br />
                <Form.Button color="teal" loading={sending} disabled={sending} basic onClick={() => this.send()}>
                    Publish
                </Form.Button>
            </Form>
        </div>
        )
    }
}
