import React, { useState, useEffect, useRef } from 'react';
import { Card, Dimmer, Segment, Loader, Image, Form, Button, Label, Message } from "semantic-ui-react"
import { updateName, updatePhotoUrl, fetchFirebasUser, currentUser, signOut } from "../fbase"

const Profile = ({ getUserInfo }) => {
    const [user, addUser] = useState({})
    const [mode, setMode] = useState('view')
    const [errors, setError] = useState({})
    const [sending, setSending] = useState(false)
    const [uploading, setUploading] = useState(false)
    let unUser = useRef(null)
    let photoInput = useRef(null)

    useEffect(() => {
        getUser()
          // returned function will be called on component unmount 
        return () => {
           if (unUser) {
               unUser()
           }
        }
    }, [])

    const getUser = () => {
        const cUser = currentUser()
        unUser = fetchFirebasUser(cUser.uid, (res) => {
            addUser(res)
        }, (err) => {
            setError({ ...errors, general: err.message })
        })
    }

    const validate = (data) => {
        let err = {}
        if (!data.surname) err.surname = 'surname name is required';
        if (!data.given) err.given = 'given name is required';

        return err;
    }
    const send = () => {
        let errors = validate(user)

        if (Object.keys(errors).length === 0) {
            setSending(true)
            setError({})
            updateName(user.uid, user.surname, user.given)
            .then(() => {
                discard()
                getUserInfo()
            })
            .catch(err => {
                setSending(false)
                setError({ ...errors, general: err.message })
            })
            
        } else {
            setError(errors)
        }
    }

    const discard = () => {
        setMode('view')
        setError({})
        setSending(false)
    }

    const addPhoto = (e) =>  {
        let file = e.target.files[0];
        if (file.size > 3000000) {
            setError({ ...errors, general: 'Image size exceed 3MB'})
        } else {
            setUploading(true)
            updatePhotoUrl(file, user.uid)
            .then(res => {
                setUploading(false) 
                getUserInfo()
            })
            .catch(err => {
                setUploading(false) 
                setError({ ...errors, general: err.message })
            })
        }
    }

    return (
    <div>
        <Card>
            {(!!errors.general) && (<Message 
                error 
                content={errors.general} 
                onDismiss={() => setError({ ...errors, general: "" })}
                compact
                size="tiny"
            />)}
            <Image src={user.photoUrl} wrapped ui={false} />
            {(uploading) && (
            <Segment>
                <Dimmer active inverted>
                    <Loader inverted />
                </Dimmer>

                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            </Segment>
            )}
            <div style={{ height:'0px', overflow: 'hidden' }}>
                <input ref={x => photoInput = x} type="file" accept='image/*' onChange={(e) => addPhoto(e)} />
            </div>
            {(mode === 'view') && (
            <Card.Content extra>
                <Button basic color='teal' fluid onClick={() => photoInput.click()}>
                    change profile image
                </Button>
            </Card.Content>
            )}
            {(mode === 'view') && (
            <Card.Content>
                <Card.Header>{user.name}</Card.Header>
                <Card.Description>
                    {user.email}
                </Card.Description>
            </Card.Content>
            )}
            {(mode === 'view') && (
            <Card.Content>
                <Button basic color='teal' fluid onClick={() => setMode('create')}>
                    Edit
                </Button>
            </Card.Content>
            )}
            {(mode === 'view') && (
            <Card.Content extra>
                <Button basic color='teal' fluid onClick={() => signOut()}>
                    Log Out
                </Button>
            </Card.Content>
            )}
            {(mode === 'create') && (
            <Card.Content>
                <Label color='teal' ribbon>
                    Edit User
                </Label>
                <Form>
                    <Form.Input
                        fluid
                        label='Surname Name'
                        placeholder='Surname Name'
                        type='text'
                        defaultValue={user.surname} 
                        error={!!errors.surname} 
                        name='surname' 
                        onChange={(e, { value, name }) => addUser({ ...user, [name]:  value })} 
                    />
                    <Form.Input
                        fluid
                        label='Given Names'
                        placeholder='Given Names'
                        type='text'
                        defaultValue={user.given} 
                        error={!!errors.given} 
                        name='given' 
                        onChange={(e, { value, name }) => addUser({ ...user, [name]:  value })} 
                    />
                </Form>
            </Card.Content>
            )}
            {(mode === 'create') && (
            <Card.Content extra>
                <div className='ui two buttons'>
                    <Button basic color='red' onClick={() => discard()}>
                        Discard
                    </Button>
                    <Button basic color='green' disabled={sending} loading={sending} onClick={() => send()}>
                        Update
                    </Button>
                </div>
            </Card.Content>
            )}
        </Card>
    </div>
    )
}

export default Profile;