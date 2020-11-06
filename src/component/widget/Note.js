import React, { Component } from 'react'
import { Card, Icon, Dropdown, Form, Button, Label, Message } from 'semantic-ui-react';
import styles from '../../styles';
import { serverTimestamp, addData, fetchNote } from '../fbase'


export default class Note extends Component {
    constructor (props) {
        super(props);

        this.state = {
            mode: 'view',
            fetching: false,
            sending: false,
            create: {
                title: '',
                message: '',
                createdAt: '',
                userId: props.team.userId,
                workspaceId: props.team.workspaceId,
            },
            data: {
                id: '',
                title: '',
                message: '',
                createdAt: '',
                userId: props.team.userId,
                workspaceId: props.team.workspaceId,
            },
            notes: [],
            errors: {}
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
        const {team } = this.props;
        this.unsubscribe = fetchNote(team.workspaceId, team.userId, (res) => {
            this.setState({ fetching: false, notes: res  })
        }, (err) => {
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }

    selectNote = data => {
        const { notes } = this.state;

        let note = notes.find(x => x.id === data.value)

        if (note) {
            this.setState({ data: note })
        }   
    }
    
    changeMode = (mode) => this.setState({ mode, errors: {} })

    add = () =>  this.changeMode('create')

    addData = (data) => this.setState({  
        create: {
            ...this.state.create,
            [data.name]: data.value,
        }}
    )

    discard = () => {
        this.setState({  create: {
            ...this.state.create,
            title: '',
            message: '',
        }})
        this.changeMode('view')
    }

    validate = (title, message) => {
        let err = {};

        if (!title) err.title = 'Title is required to make a note';
        if (!message) err.message = 'Message is required to make a note';

        return err
    }

    send = () => {
        const { create } = this.state;
        let errors = this.validate(create.title, create.message)

        if (Object.keys(errors).length === 0) {

            let data = {
                ...create,
                createdAt: serverTimestamp(),
            }
            this.setState({ sending: true },  () => {
                addData('note', data, () => {
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
        const { mode, data, fetching, sending, errors, notes, create } = this.state;

        return (
            <div>
                <Card>
                    <Card.Content>
                        <div style={styles.between}>
                            <Card.Header as='h3'>Note</Card.Header>
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
                        <div style={styles.limit}>
 
                            {(!data.id) && (
                                <Card.Meta textAlign='center'>
                                    <b>no note selected</b>
                                    
                                </Card.Meta>
                            )}

                            {(!!data.id) && (
                            <div>
                                <Card.Header>{data.title}</Card.Header>
                                <Card.Meta>{data.createdAt}</Card.Meta>
                                <Card.Description>{data.message}</Card.Description>
                            </div>)}

                        </div>
                    </Card.Content>)}
                    {(mode === 'create') && (
                    <Card.Content>
                        <Label color='teal' ribbon>
                            Add Note
                        </Label>
                        <Form>
                            <Form.Field>
                                <Form.Input label={'Title'} defaultValue={create.title} error={!!errors.title} name='title' onChange={(e, data) => this.addData(data)} placeholder='Add note title' />
                            </Form.Field>
                            <Form.Field>
                                <Form.TextArea label={'Message'} defaultValue={create.message} error={!!errors.message} name='message' onChange={(e, data) => this.addData(data)} placeholder='Add note message' />
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
                                Create
                            </Button>
                        </div>
                    </Card.Content>
                    )}
                    {(mode === 'view') && (
                    <Card.Content extra>
                        <Dropdown
                            placeholder='Select note'
                            fluid
                            search
                            selection
                            options={notes.map(x => ({ key: x.id, value: x.id, text: x.title }))}
                            loading={fetching}
                            onClick={() => this.decideFetch()}
                            onChange={(e, data) => this.selectNote(data)}
                        />
                    </Card.Content>)}
                </Card>
            </div>
        )
    }
}
