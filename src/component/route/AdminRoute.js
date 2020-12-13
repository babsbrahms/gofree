import React, { useState, useEffect, useRef } from 'react';
import { Route } from 'react-router-dom';
import { Loader, Segment, Dimmer, Message, Form, Button } from 'semantic-ui-react'
import firebase from '../firebaseConfig';
import { fetchMyAdmin, createAdminSuperUser } from '../fbase'
import Authentication from  "../container/Authentication";

const UserRoute = ({component: Component, ...rest }) => {
    let unsubscribe = useRef(null);
    let myAdmin = useRef(null)
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setAuth] = useState(false);
    const [isAuthorized, setAuthorized] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [sending, setSending] = useState(false);
    const [user, setUser] = useState({ uid: '', email: '' })
    const [errors, setError] = useState({})
    const [data, addData] = useState({})
    // const [disable, setDisable] = useState(false)

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
                setUser({ uid: user.uid, email: user.email })
                setError({})
                getMyAccount(user.email)
            } else {
                setAuth(false)
                setLoading(false)
            }
        });
    }

    const getMyAccount = (email) => {
        myAdmin.current = fetchMyAdmin(email, (res) => {
            if(res.id) {
                setAuthorized(true)
                setLoading(false)
            } else {
                setAuthorized(false)
                setLoading(false)
            }
        }, (err) => {
            setError({ ...errors, general: err.message })
        })
    }

    // const setTimer = () => {
    //     setTimeout(() => {
    //         setDisable(false)
    //     }, 60000)
    // }

    const validate = (data) => {
        let err = {}
        if (!data.name) err.name = 'Name is required';

        return err;
    }

    const send = () => {
        let errors = validate(data)

        if (Object.keys(errors).length === 0) {
            setSending(true)
            setError({})

            createAdminSuperUser(user.email, data.name, (res) => {
                setError({})
                setSending(false)
               // window.location.reload(true)
            }, (err) => {
                setSending(false)
                setError({ ...errors, general: err.message })
            })

            
        } else {
            setError(errors)
        }
    }

   // console.log({ loading, isAuthenticated, isAuthorized, hasProfile });
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
                                {isAuthorized && (<Route {...rest} render={(props)=> <Component  {...props}/>} />)}

                                {(!isAuthorized) && (
                                    <Segment>
                                        {/* <Button size="small" floated="right" color="black" icon="log out" content="Log Out" onClick={() => signOut()} /> */}
                                        <h3 style={{ textAlign: "center"}}>You don't have an admin account.</h3>
                                        {(!isOwner) && (<Button color="black" onClick={() => setIsOwner(true)}>If you are the owner of this app, click here</Button>)}
                                        {(isOwner) && (<Form>
                                            <Form.Input
                                                fluid
                                                label='Name'
                                                placeholder='Add your name'
                                                type='text'
                                                defaultValue={data.name} 
                                                error={!!errors.name} 
                                                name='name' 
                                                onChange={(e, { value, name }) => addData({ ...data, [name]:  value })} 
                                            />


                                            <Form.Button basic color='green' disabled={sending} loading={sending} onClick={() => send()}>
                                                Submit
                                            </Form.Button>
                                        </Form>)}
                                    </Segment>
                                )}
                            </div>
                        )} 
                    </div>
                )}

                {(!!errors.general) && (
                <Message 
                    error 
                    content={errors.general} 
                    onDismiss={() => setError({ ...errors, general: "" })}
                    attached="top"
                    size="small"
                />)}
                
            </div>
        </div>
    )
}

export default UserRoute
