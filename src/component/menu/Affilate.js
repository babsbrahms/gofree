import React, { useState } from 'react';
import { Card, Segment, Loader, Dimmer, Image, Message, Form, Button, Icon } from 'semantic-ui-react'
import banks from "../../utils/banks";
import states from "../../utils/states"
import { functionCaller, analytics } from "../fbase"

const Affiliate = ({ fetching, data, user, onClose }) => {
    const [errors, setErrors] = useState('');
    let [create, setCreate] = useState(data) 
    let [sending, setSending] = useState(false)
    let [change, setChange] = useState(false)

    const addCreate = (data) => {
        setCreate({ ...create, [data.name]: data.value });
        if ((data.name === "bank_code") || (data.name === "account_number")) {
           setChange(true)
        }
    }

    let validate = (create) => {
        let err = {};

        if (!create.bank_code) err.bank_code = "Bank is required";
        if (!create.account_number ||(create.account_number.length !== 10)) err.account_number = "Enter a valid bank account";
        if (!create.state) err.state = "Enter a valid state name";

        return err;
    }

    const validateAccount = () => {
        let errors = validate(create)

        if (Object.keys(errors).length === 0) {
            setSending(true)
            setErrors({})
            functionCaller('verify_account', create).then(res => {
                // console.log(res);
                let bank_name = banks.find(x => x.code === create.bank_code)
                if (res.data.status) {
                    setCreate({ ...create, account_name: res.data.data.account_name, bank_name: bank_name.name });
                    setChange(false)
                } else {
                    setErrors({ ...errors, general: res.data.message })
                }
                setSending(false)
                
            }).catch(err => {
                setSending(false)
                setErrors({ ...errors, general: err.message })
            })
        } else {
            setErrors(errors)
        }
    }

    const send = () => {
        let errors = validate(create)

        if (Object.keys(errors).length === 0) {
            setSending(true)
            setErrors({})
            if (!create.id) {
                createAffilate({ ...create, currency: "NGN", country: "Nigeria", userId: user.uid  })
            } else {
                // console.log("update: ", create);

                updateAffilate(create)
            }
        } else {
            setErrors(errors)
        }
    }

    const createAffilate = (madeData) => {
        functionCaller('create_affilate_partner', madeData)
        .then((res) => {
            analytics.logEvent("create_affiliate_account", {
                userId: user.uid,
                bank: madeData.bank_name 
            })
            setSending(false)
            onClose()
        })
        .catch((err) => {
            setSending(false)
            setErrors({ ...errors, general: err.message })
        })
    }

    const updateAffilate = (create) => {
        functionCaller("update_affilate_partner", create)
        .then((res) => {
            analytics.logEvent("update_affiliate_account", {
                userId: user.uid,
                bank: create.bank_name 
            })
            setSending(false)
        })
        .catch((err) => {
            setSending(false)
            setErrors({ ...errors, general: err.message })
        })
    }

    return (
    <Card fluid>
        <Card.Content>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start"}}>
                <Card.Header>Affiliate Account</Card.Header>

                <Icon link name="window close" size="large" color="red" onClick={() => onClose()} />
            </div>
            {(!!errors.general) && (
            <Message 
                error
                content={errors.general} 
                onDismiss={() => setErrors({})}
                compact
                size="tiny"
            />)}
        </Card.Content>
        <Card.Content>
            {/* <div style={{ ...styles.limit, height: styles.limit.height + 70 }}> */}
                {(fetching) && (
                <Segment>
                    <Dimmer active inverted>
                        <Loader inverted />
                    </Dimmer>

                    <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                </Segment>
                )}
                {(!fetching) && (
                    <Card.Meta>
                        <Form>
                            <Form.Select
                                label={'Bank'} 
                                defaultValue={create.bank_code || ""} 
                                error={!!errors.bank_code} 
                                search
                                name='bank_code' 
                                onChange={(e, data) => addCreate(data)} 
                                placeholder='Add bank name'
                                options={banks.map(bank => ({ key: bank.id, value: bank.code, text: bank.name }))}
                                disabled={sending}
                            />

                            <Form.Input 
                                label={'Account Number'} 
                                value={create.account_number || ""} 
                                error={!!errors.account_number} 
                                name='account_number' 
                                onChange={(e, data) => addCreate(data)} 
                                placeholder='Add your account number' 
                                disabled={sending}
                            />

                            {(!!create.account_name) && (<Form.Input 
                                label={'Account Name'} 
                                value={create.account_name || ""} 
                                name='account_name' 
                                disabled
                            />)}

                            
                            <Form.Select 
                                label={"State"} 
                                value={create.state || ""} 
                                error={!!errors.state} 
                                search
                                name='state' 
                                onChange={(e, data) => addCreate(data)} 
                                placeholder='Select Your State Of Residence' 
                                options={states.map(state => ({ key: state, value: state.toLowerCase(), text: state }))}
                                disabled={sending}
                            />
                        </Form>
                    </Card.Meta>
                )}
            {/* </div> */}
        </Card.Content>
        {(!fetching) && (
        <Card.Content>
            {(change) && (
            <Button fluid basic color='green' disabled={sending} loading={sending} onClick={() => validateAccount()}>
                validate account number
            </Button>)}
            {(!change) && (
            <Button fluid basic color='green' disabled={sending} loading={sending} onClick={() => send()}>
                Save
            </Button>)}
        </Card.Content>
        )}
    </Card>

    )
}

export default Affiliate

