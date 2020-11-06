import React, { useState, useEffect, useRef } from 'react';
import { Card, Segment, Feed, Loader, Dimmer, Image, Message } from 'semantic-ui-react'
import styles from '../../styles';
import { currentUser, fetchNotification } from '../fbase';


const Notification = () => {
    const [notifications, addNotification] = useState([])
    const [error, setError] = useState('')
    const [fetching, setFetching] = useState(false)
    let unUser = useRef(null)

    useEffect(() => {
        getInvite()
          // returned function will be called on component unmount 
        return () => {
           if (unUser) {
               unUser()
           }
        }
    }, [])

    const getInvite = () => {
        const cUser = currentUser()
        setFetching(true)
        
        unUser = fetchNotification(cUser.uid, (res) => {
            addNotification(res)
            setFetching(false)
        }, (err) => {
            setError(err.message)
            setFetching(false)
        })
    }

    return (
    <Card>
        <Card.Content>
            <Card.Header as='h3'>Notification</Card.Header>
            {(!!error) && (
            <Message 
                error 
                content={error} 
                onDismiss={() => setError('')}
                compact
                size="tiny"
            />)}
        </Card.Content>
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
                {(!fetching) && (notifications.length === 0) && (
                    <Card.Meta textAlign='center'>
                        <b>no notification</b>
                        
                    </Card.Meta>
                )}
                {notifications.map(val => (
                    <Segment key={val.id}> 
                        <Feed>
                            <Feed.Event>
                                <Feed.Content>
                                    <Feed.Summary>
                                    <Feed.Date>{val.createdAt? new Date(val.createdAt.seconds * 1000 + val.createdAt.nanoseconds/1000000).toLocaleString() : ""}</Feed.Date>
                                    </Feed.Summary>
                                    <Feed.Extra text>
                                    {val.message}
                                    </Feed.Extra>
                                </Feed.Content>
                            </Feed.Event>  
                        </Feed>
                    </Segment>
                ))}
            </div>
        </Card.Content>
    </Card>

    )
}

export default Notification
