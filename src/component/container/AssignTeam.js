import React, { useState, useEffect } from 'react'
import { Form, Segment, Message, Button, Dropdown, Header } from 'semantic-ui-react';
import {commitTaskChanges, fetchAllAcceptedTeams, fetchAllprojectTeams} from '../fbase'



const AssignTeam = ({ team, project, close, status, task}) => {
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({})
    const [teams, setTeams] = useState([])
    const [errors, setErrors] = useState({})
    const [choice, choose] = useState('')
    let changes = {
        priority: true,
        teamIds: true
    }
    let unsubscribe;

    useEffect(() => {
        if (!!task.id) {
            setData({...task, status})
        }
        
        return () => {
            if (!!unsubscribe) {
                unsubscribe()
            }
            
        }
    }, [])

    
    const getTeam = () => {
        if (!unsubscribe) {
            setLoading(true);

            if (project.departmentIds.length > 10) {
                unsubscribe = fetchAllAcceptedTeams(project.workspaceId, (res) => {
                    teamSuccess(res)
                }, (err) => {
                    teamError(err)
                })
            } else {
                unsubscribe = fetchAllprojectTeams(project.departmentIds, (res) => {
                    teamSuccess(res)
                }, (err) => {
                    teamError(err)
                })
            }
        }
    }

    const teamSuccess = (res) => {
        let teams =  res.map(team => (
            {
                key: team.id,
                text: team.name,
                value: team.userId,
                image: { avatar: true, src: team.photoUrl },
            }
        ))
        setTeams(teams)
        setLoading(false)
    }

    const teamError = (err) => {
        setErrors({ ...errors, general:  err.message })
        setLoading(false)
    }
    
    const addTeamMember = (d) => setData({ ...data, teamIds: d.value })

    const validate = (title, status, teamIds) => {
        let err = {};

        if (!title) err.title = 'Title is required to make a project';

        if (status !== 'backlog' && teamIds.length === 0) err.general = 'Add team members to task'
        return err
    }
    
    const sanitize = (res) => {
        // teamRef
        if(teams.length !== 0) {
            if (res.teamIds[0]) {
                let team = teams.find(x => x.value === res.teamIds[0])
    
                if (team) {
                    res.teamRef[0] = { name: team.text, photoUrl: team.image.src, userId: team.value };
                }
            }
    
            if (res.teamIds[1]) {
                let team = teams.find(x => x.value === res.teamIds[1])
    
                if (team && res.teamRef[0]) {
                    res.teamRef[1] = { name: team.text, photoUrl: team.image.src, userId: team.value };
                } else if (team) {
                    res.teamRef[0] = { name: team.text, photoUrl: team.image.src, userId: team.value }; 
                }
            }
        }

        return res
    }


    const send = () => {   
        // console.log({data, teams});     
        let errors = validate(data.title, data.status, data.teamIds);
        if (Object.keys(errors).length === 0) {
            setSending(true);
            setErrors({});

            let modData = sanitize(data)

            commitTaskChanges(changes, modData, task, team, project)
            .then(() => {
                close()
            })
            .catch((err) => {
                setSending(false)
                setErrors({ ...errors, general:  err.message })
            })
        } else {
            setSending(false)
            setErrors(errors)
        } 
    }

    const assignToSelf = async () => {
       await choose('self')
        let mySelf = [{
            key: team.id,
            text: team.name,
            value: team.userId,
            image: { avatar: true, src: team.photoUrl }
        }]
        
        let myId = [team.userId];

        await setTeams(mySelf);
        await setData({ ...data, teamIds: myId });
    }

    return (
        <div>
            <Segment>
                
                {(!!errors.general) && ( 
                    <Message 
                        error 
                        content={errors.general} 
                        onDismiss={() => setErrors({ ...errors, general: "" })}
                        compact
                        size="small"
                    />
                )}
                    <Header textAlign='center'>
                    {data.title}
                    </Header>
                        <Button.Group fluid>
                            <Button active={choice === 'self'} disabled={sending} loading={sending} onClick={() => assignToSelf()}>Assign to myself</Button>
                            <Button.Or />
                            <Button active={choice === 'others'} disabled={sending} onClick={() => choose('others')}>Assign to team members</Button>
                        </Button.Group>

                
                
                {(choice === 'others') && (
                <Form>  


                    <Form.Field>
                        <label>Team members </label> 

                        <Dropdown
                            placeholder='Assign task to team members'
                            fluid
                            multiple
                            search
                            selection
                            loading={loading}
                            options={teams}
                            value={data.teamIds}
                            onChange={(e, data) => addTeamMember(data)}
                            onClick={() => getTeam()}
                        />

                    </Form.Field>                
                    {/* <Button basic disabled={sending} loading={sending} color='green' onClick={() => send()}>
                        Update Task
                    </Button> */}
                </Form>)}
                <br />
                <br />
                {(!!choice) && (
                <Button basic disabled={sending} loading={sending} color='green' onClick={() => send()}>
                    Save
                </Button>)}

                

            </Segment>
        </div>
    )
}

export default AssignTeam
