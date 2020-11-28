import React, { useState } from 'react';
import { Button, Form, Message, Label, Icon } from 'semantic-ui-react';
import validator  from "validator"
import { emailSignIn, emailSignUp, forgotPassword } from "../fbase";

const Authentication = () => {
    const [data, setData] = useState({
        surname: "",
        given: "", 
        email: "",
        password: "",
        terms: false
    });
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


    return (
        <div>
            <Message
            attached
            header='Welcome to our site!'
            content={'Select an operation below by clicking a button'}
            color={'black'}
            />
            <Button.Group fluid attached>
                <Button color={active === 'register'? 'teal' : 'black'} active={active === 'register'} onClick={() => changeActive('register')}>Register</Button>
                <Button.Or />
                <Button color={active === 'login'? 'teal' : 'black'} active={active === 'login'} onClick={() => changeActive('login')}>Log In</Button>
                <Button.Or />
                <Button color={active === 'forgot'? 'teal' : 'black'} active={active === 'forgot'} onClick={() => changeActive('forgot')}>Forgot Password</Button>
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