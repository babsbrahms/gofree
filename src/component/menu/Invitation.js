import React, { useState } from 'react';
import { Card, Dropdown, Button, Message } from "semantic-ui-react"
import { deleteTeam, acceptInvitation, analytics } from "../fbase"

const Invitation = ({ invitation, user, openInvite}) => {
    // const [invitation, addInvitation] = useState([])
    // const [user, addUser] = useState({})
    const [team, addTeam] = useState({})
    const [sending, setSending] = useState(false)
    // const [fetching, setFetching] = useState(false)
    const [error, setError] = useState('')

    // let unUser = useRef(null)

    // useEffect(() => {
    //     getInvite()
    //       // returned function will be called on component unmount 
    //     return () => {
    //        if (unUser) {
    //            unUser()
    //        }
    //     }
    // }, [])

    // const getInvite = () => {
    //     const cUser = currentUser()
    //     addUser(cUser)
    //     setFetching(true)
    //     unUser = fetchMyInvitation(user.email, (res) => {
    //         addInvitation(res)
    //         setFetching(false)
    //     }, (err) => {
    //         setError(err.message)
    //         setFetching(false)
    //     })
    // }

    const selectInvite = value => {
        let team = invitation.find(x => x.id === value)

        if (team) {
            addTeam(team)
        }   
    }

    const accept = () => {
        setSending(true)
        acceptInvitation(team.workspaceId, team.id, user.uid, user.displayName, user.photoURL, user.email)
        .then(() => {
            analytics.logEvent("accept_workspace_invitation", {
                workspaceId: team.workspaceId,
                workspaceName: team.workspaceName,
                userId: user.uid,
                userEmail: user.email
            })
            openInvite({ ...team, userId: user.uid, name: user.displayName, photoUrl: user.photoURL })
            addTeam({})
            setSending(false)
        })
        .catch(err => {
            analytics.logEvent("reject_workspace_invitation", {
                workspaceId: team.workspaceId,
                workspaceName: team.workspaceName,
                userId: user.uid,
                userEmail: user.email
            })
            setSending(false)
            setError(err.message)
        })
    }

    const reject = () => {
        setSending(true)
        deleteTeam(team)
        .then(() => {
            addTeam({})
            setSending(false)
        })
        .catch(err => {
            setSending(false)
            setError(err.message)
        })
    }


    return (
    <div>
        <Card>
            <Card.Content>
                <Card.Header>My Invitations</Card.Header>
                {(!!error) && (<Message 
                error 
                content={error} 
                onDismiss={() => setError('')}
                compact
                size="tiny"
            />)}
            </Card.Content>
            <Card.Content>
                <Dropdown
                    placeholder='Select Invitation'
                    fluid
                    search
                    selection
                    options={invitation.map(x => ({ key: x.id, value: x.id, text: x.workspaceName }))}
                    // loading={fetching}
                    onChange={(e, { value }) => selectInvite(value)}
                />
            </Card.Content>
            <Card.Content>
                {(invitation.length !== 0) && (!team.id) && (
                    <Card.Meta textAlign='center'>
                        <b>no invitation selected</b>
                        
                    </Card.Meta>
                )}
                {(team.id) && (
                    <div>
                        <Card.Header>{team.workspaceName}</Card.Header>
                        <Card.Description>
                            {team.roleTitle} role
                        </Card.Description>
                        <Card.Description>
                            {team.departmentName} department
                        </Card.Description>
                    </div>
                )}
            </Card.Content>
            {(team.id) && (
            <Card.Content extra>
                <div className='ui two buttons'>
                    <Button basic color='red' disabled={sending} loading={sending} onClick={() => reject()}>
                        Reject
                    </Button>
                    <Button basic color='green' disabled={sending} loading={sending} onClick={() => accept()}>
                        Accept
                    </Button>
                </div>
            </Card.Content>
            )}
        </Card>
    </div>
    )
}

export default Invitation;