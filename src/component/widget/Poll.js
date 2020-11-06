import React, { Component } from 'react';
import { Card, Feed, Icon, Progress, Dropdown, Header, Form, Button, Label, Message } from 'semantic-ui-react';
import styles from '../../styles';
import { serverTimestamp, fetchMyVote, fetchPolls, addData } from '../fbase'

export default class Poll extends Component {
    constructor (props) {
        super(props);

        this.state = {
            mode: 'view',
            fetching: false,
            sending: false,
            fetchingVote: false,
            castingVote: false,
            create: {
                question: '',
                options: { },
                deadline: new Date(),
                createdBy: props.team.userId,
                workspaceId: props.team.workspaceId,
                createdAt: ''
            },
            optionValue: '',
            data: {
                id: '',
                question: '',
                options: {

                },
                deadline: new Date(),
                createdBy: props.team.userId,
                workspaceId: props.team.workspaceId,
                createdAt: ''
            },
            total: 0,
            polls: [],
            vote: {},
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
        const {team} = this.props;
        this.unsubscribe = fetchPolls(team.workspaceId, (res) => {
            this.setState({ fetching: false, polls: res })
        }, (err) => {

            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }

    selectPoll = data => {
        const { polls } = this.state;

        let poll = polls.find(x => x.id === data.value)

        if (poll) {
            let total = Object.values(poll.options).reduce((prev, curr) => prev + curr ,0)
            this.setState({ data: poll, total, vote: {}, fetchingVote: true }, () => {
                this.getVote(poll.id)
            })
        }   
    }

    getVote = (id) => {
        const {team} = this.props;
        fetchMyVote(id, team.userId, (res) => {
            this.setState({ vote: res, fetchingVote:  false})
        }, (err) => {
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }

    castVote = (option, pollId) => {
        const { team } = this.props;
        
        let data = {
            pollId,
            option,
            userId: team.userId,
            createdAt: serverTimestamp(),
            workspaceId: team.workspaceId,
        }

        addData('vote', data, (res) =>  {
            
        }, (err) => {

            this.setState({ errors: { ...this.state.errors, general:  err.message }})
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

    discard = () => {
        this.setState({  create: {
            ...this.state.create,
            question: '',
            options: {},
            deadline: new Date()
        }})
        this.changeMode('view')
    }

    addOption = () => {
        const { optionValue } = this.state;
        if (!!optionValue)  {
            this.setState({ create: { ...this.state.create, options: { ...this.state.create.options, [optionValue]: 0 }}, optionValue: "" })
        }
    }

    deleteOption = (option) => {
        let { create } = this.state;

        delete create['options'][option];

        this.setState({ create: { ...this.state.create } })
    }

    validate = (question, options, deadline) => {
        let err = {};

        if (!question) err.question = 'Poll question is required';
        if (Object.keys(options).length < 2) err.options = "Minimum of two options are required for poll"; 
        if (new Date(deadline).getTime() < new Date().getTime()) err.deadline = "Poll deadline must be a future date"; 

        return err
    }

    send = () => {
        const { create } = this.state;
        let errors = this.validate(create.question, create.options, create.deadline)

        if (Object.keys(errors).length === 0) {
            
            let data = {
                ...create,
                createdAt: serverTimestamp(),
                // deadline: new Date(create.deadline)
            }
            this.setState({ sending: true },  () => {
                addData('poll', data, () => {
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
        const { mode, data, fetching, sending, errors, polls, total, optionValue, create, vote, castingVote } = this.state;
        //  const { team, rolePermission } = this.props;

        return (
            <div>
                <Card>
                    <Card.Content>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Card.Header as='h3'>Polls</Card.Header>
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
                                    <b>no poll selected</b>
                                   
                                </Card.Meta>
                            )}

                            {(!!data.id) && (
                            <div>
                                <Header as='h5'>
                                   {data.question}
                                </Header>
                                {/* <Feed.Event>
                                    {Object.keys(data.options).map(option => (
                                    <Feed.Content key={option}>
                                        <Feed.Summary>{option}</Feed.Summary>
                                        <Progress value={data.options[option]} total={total} progress='ratio' size="small" color='teal' />
                                    </Feed.Content>
                                    ))}
                                </Feed.Event> */}
                                <Button.Group  fluid vertical>
                                    {Object.keys(data.options).map(option => (
                                        <Button loading color={'teal'} basic onClick={() => data.options[option]}>
                                           {option} 
                                        </Button>
                                    ))}
                                </Button.Group>
                            </div>)}
                        </div>
                    </Card.Content>
                    )}
                    {(mode === 'create') && (
                    <Card.Content>
                        <Label color='teal' ribbon>
                            Create Poll
                        </Label>
                        <Form>
                            <Form.Field>
                                <Form.Input label={'Question'} error={!!errors.question} name='question' defaultValue={create.question} onChange={(e, data) => this.addData(data)} placeholder='Add poll question' />
                            </Form.Field>
                            <Form.Field>

                                <Form.Input 
                                    label="Options"
                                    fluid
                                    error={!!errors.options && ({ 
                                        content: errors.options,
                                        pointing: 'above',
                                    })} 
                                    value={optionValue}
                                    name='options' 
                                    onChange={(e, data) => this.setState({ optionValue: data.value })} 
                                    placeholder='Add poll option' 
                                    onSubmit={() => this.addOption()}
                                    action
                                >
                                    <input />
                                    <Button color={'teal'} onClick={() => this.addOption()}><Icon name="add"/> Add </Button>
                                </Form.Input>

                                
                                {Object.keys(create.options).map(option => (
                                    <p key={option} style={{...styles.row, alignItems: "center" }}>
                                        <Icon color='red' name='remove' onClick={() => this.deleteOption(option)} />
                                        
                                        {option}
                                    </p>
                                ))}

                            </Form.Field>

                            <Form.Field error={!!errors.deadline}>
                                <label>Deadline</label>
                                <input type="date" min={new Date()} name='deadline' defaultValue={create.deadline} onChange={(e) => this.addData(e.target)} placeholder='Add poll deadline' />
                                {(errors.deadline) && (
                                <Label basic color='red' pointing>
                                    {errors.deadline}
                                </Label>)}
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
                    {(mode === 'view') && (
                    <Card.Content extra>
                        <Dropdown
                            placeholder='Select poll'
                            fluid
                            search
                            selection
                            options={polls.map(x => ({ key: x.id, value: x.id, text: x.question }))}
                            loading={fetching}
                            onClick={() => this.decideFetch()}
                            onChange={(e, data) => this.selectPoll(data)}
                        />
                    </Card.Content>)}
                </Card>
            </div>
        )
    }
}
