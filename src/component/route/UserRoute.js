import React, { useState, useEffect, useRef } from 'react';
import { Route } from 'react-router-dom';
import { Loader, Segment, Dimmer, Step, Icon, Button, Message, Form } from 'semantic-ui-react'
import firebase from '../firebaseConfig';
import { sendVerificationEmail, createProfileName, signOut } from '../fbase'
import Authentication from  "../container/Authentication";
import styles from "../../styles"

const UserRoute = ({component: Component, ...rest }) => {
    let unsubscribe = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setAuth] = useState(false);
    const [isVerified, setVerify] = useState(false)
    const [hasProfile, setProfile] = useState(false)
    const [sending, setSending] = useState(false);
    const [user, setUser] = useState({ uid: '', email: '' })
    const [errors, setError] = useState({})
    const [data, addData] = useState({})
    const [disable, setDisable] = useState(false)

    useEffect(() => {
        getUser()

        return () => {
            unsubscribe()  
        }
    }, [])

    const getUser = () => {
        unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setAuth(true)
                setVerify(user.emailVerified)
                let disPlayName = !!user.displayName? true: false
                setProfile(disPlayName)
                setUser({ uid: user.uid, email: user.email })
                setError({})
                setLoading(false)
            } else {
                setAuth(false)
                setLoading(false)
            }
        });
    }


    const sendEmail = () => {
        console.log('sending');
        setSending(true);
        setError({})
        sendVerificationEmail()
        .then(() => {
            setSending(false) 
            setDisable(true)
            setTimer()
        })
        .catch((err) => {
            setSending(false)
            setError({ ...errors, general: err.message })
        })
    }


    const setTimer = () => {
        setTimeout(() => {
            setDisable(false)
        }, 60000)
    }

    const validate = (data) => {
        let err = {}
        if (!data.surname) err.surname = 'Surname name is required';
        if (!data.given) err.given = 'Given name is required';

        return err;
    }

    const send = () => {
        let errors = validate(data)

        if (Object.keys(errors).length === 0) {
            setSending(true)
            setError({})
            createProfileName(user.uid, data.surname, data.given, user.email)
            .then(() => {            
                setError({})
                setSending(false)
                window.location.reload(true)
            })
            .catch(err => {
                setSending(false)
                setError({ ...errors, general: err.message })
            })
            
        } else {
            setError(errors)
        }
    }

   // console.log({ loading, isAuthenticated, isVerified, hasProfile });
    return (
        <div id="gofree-bg">
            <div>
                {loading && (<Segment>
                    <Dimmer active>
                        <br/>
                        <br/>
                        <Loader>Loading</Loader>
                        <br/>
                        <br/>
                    </Dimmer>

                </Segment>)}
                
                {!loading && (
                    <div>
                        {/* {!isAuthenticated && (<Redirect to="/auth" />)} */}
                        {!isAuthenticated && (
                            <Authentication />
                        )}

                        {isAuthenticated && (
                            <div>
                                {isVerified && hasProfile && (<Route {...rest} render={(props)=> <Component  {...props}/>} />)}

                                {(!isVerified || !hasProfile) && (
                                    <div>
                                        <Button size="small" floated="right" color="black" icon="log out" content="Log Out" onClick={() => signOut()} />
                                        <Step.Group ordered attached='top'>
                                            <Step completed>
                                                <Step.Content>
                                                    <Step.Title>Registration</Step.Title>
                                                    <Step.Description>Enter email and password</Step.Description>
                                                </Step.Content>
                                            </Step>

                                            <Step active={!isVerified} completed={isVerified}>
                                                <Step.Content>
                                                    <Step.Title>Email Verification</Step.Title>
                                                    <Step.Description>Verify your email address</Step.Description>
                                                </Step.Content>
                                            </Step>

                                            <Step disabled={!isVerified} active={isVerified}>
                                                <Step.Content>
                                                    <Step.Title>Complete Profile</Step.Title>
                                                    <Step.Description>Add profile info</Step.Description>
                                                </Step.Content>
                                            </Step>
                                        </Step.Group>
                                        <Segment>
                                            {(!isVerified) && (
                                                <div>
                                                    {(disable) && (
                                                        <b>A verification email was sent to {user.email}. It will be delivered between now and the next 1 minute.</b>
                                                    )}
                                                    <br />
                                                    <Button.Group>
                                                        <Button loading={sending} disabled={sending || disable} basic color='teal' onClick={() => sendEmail()}>
                                                            Send Verification Email
                                                        </Button>

                                                        <Button basic color='teal' onClick={() => window.location.reload(true)}>
                                                            <Icon name="long arrow alternate right" />  proceed to profile
                                                        </Button>
                                                    </Button.Group>
                                                </div>
                                            )}
                                            {(isVerified) && (
                                                <Form>
                                                    <Form.Input
                                                        fluid
                                                        label='Surname Name'
                                                        placeholder='Surname Name'
                                                        type='text'
                                                        defaultValue={data.surname} 
                                                        error={!!errors.surname} 
                                                        name='surname' 
                                                        onChange={(e, { value, name }) => addData({ ...data, [name]:  value })} 
                                                    />
                                                    <Form.Input
                                                        fluid
                                                        label='Given Names'
                                                        placeholder='Given Names'
                                                        type='text'
                                                        defaultValue={data.given} 
                                                        error={!!errors.given} 
                                                        name='given' 
                                                        onChange={(e, { value, name }) => addData({ ...data, [name]:  value })} 
                                                    />

                                                    <Form.Button basic color='green' disabled={sending} loading={sending} onClick={() => send()}>
                                                        Submit
                                                    </Form.Button>
                                                </Form>
                                            )}
                                        </Segment>
                                        {(!!errors.general) && (
                                        <Message 
                                            error 
                                            content={errors.general} 
                                            onDismiss={() => setError({ ...errors, general: "" })}
                                            attached="top"
                                            size="small"
                                        />)}
                                    </div>
                                )}
                            </div>
                        )} 
                    </div>
                )}
                
            </div>
        </div>
    )
}

export default UserRoute

