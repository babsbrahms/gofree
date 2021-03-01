import React, { useState } from 'react';
import { Button, Form, Message, Label, Icon } from 'semantic-ui-react';
import validator  from "validator"
import { emailSignIn, emailSignUp, forgotPassword, googleAuth } from "../fbase";

const Authentication = () => {
    const [data, setData] = useState({
        surname: "",
        given: "", 
        email: "",
        password: "",
        terms: false
    });
    const [method, setMethod] = useState("");
    const [active, setActive] = useState('register');
    const [sending, setSending] = useState(false);
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});

    const addData = (d) => setData({
        ...data,
        [d.name]: d.value,
    })
    

    const validate = (data, active) => {
        let err = {};

        if (active === 'register') {
            if (!data.terms) err.terms = 'Agree to the terms and conditions';
        }

        if (!validator.isEmail(data.email)) err.email = 'Valid email address is required';

        if (['register', 'login'].includes(active)) {
            if (data.password.length < 5) err.password = 'Password is required';
        }

        return err
    }

    const send = () => {
        let error = validate(data, active)

        if (Object.keys(error).length === 0) {
            setSending(true)
            setErrors({})
            setShow(false)

            let auth;
            if (active === 'register') {
                auth =  emailSignUp(data.email, data.password)
            } else if (active === 'login') {
                auth =  emailSignIn(data.email, data.password)
            } else if (active === 'forgot') {
                auth = forgotPassword(data.email)
            }

            auth.then((res) => {
                setSending(false)
                setShow(true)
            })
            .catch((err) => {
                setSending(false)
                setErrors({...errors, general:  err.message})
            }) 
        
        } else {
            setErrors(error)
        }
    }

    const changeActive = (active) => {
        setActive(active)
        setErrors({})
        setShow(false)
    }


    const googleSignin = async () => {
        await setErrors({});
        await setSending(true);

        googleAuth()
        .then((result) => {
            var credential = result.credential;
        
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...

            setSending(false)
          }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            setErrors({ general: errorMessage })
            setSending(false)
            // ...
          });
    }


    return (
        <div style={{ padding: 20 }}>
            <Message
            attached
            header='Welcome to our site!'
            content={'Select an authenication method'}
            color={'black'}
            />
                <Button.Group fluid attached>
                    <Button color={method === 'email'? 'blue' : 'black'} active={method === 'email'} onClick={() => setMethod('email')}><Icon name="mail" /> Email</Button>
                    <Button.Or />
                    <Button color={method === 'google'? 'blue'  : 'black'} active={method === 'google'} onClick={() => setMethod('google')}><Icon name="google" /> Google</Button>
                    {/* <Button.Or />
                    <Button color={method === 'forgot'? 'blue'  : 'black'} active={active === 'forgot'} onClick={() => changeActive('forgot')}>Forgot Password</Button> */}
                </Button.Group>

                <br />
                <br />
            
            {(method === "email") && (
            <div>
                <Button.Group fluid attached>
                    <Button color={active === 'register'? 'blue' : 'black'} active={active === 'register'} onClick={() => changeActive('register')}>Register</Button>
                    <Button.Or />
                    <Button color={active === 'login'? 'blue'  : 'black'} active={active === 'login'} onClick={() => changeActive('login')}>Log In</Button>
                    <Button.Or />
                    <Button color={active === 'forgot'? 'blue'  : 'black'} active={active === 'forgot'} onClick={() => changeActive('forgot')}>Forgot Password</Button>
                </Button.Group>
                <Form className='attached fluid segment'>

                    <Form.Input label='Email' placeholder='Email' type='email' defaultValue={data.email} error={!!errors.email} name='email' onChange={(e, data) => addData(data)} />
                    
                    {(['register', 'login'].includes(active)) && (
                    <Form.Input label='Password' placeholder="Password" type='password' defaultValue={data.password} error={!!errors.password} name='password' onChange={(e, data) => addData(data)} />)}
                    
                    {(active === 'register') && (<Form.Checkbox inline label='I agree to the terms and conditions' checked={data.terms} defaultValue={data.terms} error={!!errors.terms} name='terms' onChange={(e, { value }) => setData({ ...data, terms: !value })} />)}
                
                    <Button color='green' basic loading={sending} disabled={sending} onClick={() => send()}>Submit</Button>
                    <br />
                    <br />
                    {(show) && (active === 'forgot') && (
                        <Label as="a" color="green">
                            Check your email for reset password link
                            <Icon name="close" onClick={() => setShow(false)} />
                        </Label>
                    )}
                </Form>
            </div>)}
            {(method === "google") && ( 
                <Button fluid color="google plus" onClick={() => googleSignin()}>
                    Signin With Google
                </Button>
            )}
            {(!!errors.general) && (
            <Message 
                error 
                content={errors.general} 
                onDismiss={() => setErrors({ ...errors, general: "" })}
                attached
                size="small"
            />)}
        </div>
    )
}
export default Authentication;