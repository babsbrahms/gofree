import React from 'react'
import { Card, Label, Dropdown, Image, Popup, Button, Icon } from 'semantic-ui-react';

const lists = [
    { key: 'at', value: 'backlog', text: 'Backlog' },
    { key: 'ax', value: 'todo', text: 'Todo' },
    { key: 'al', value: 'inProgress', text: 'In Progress' },
    { key: 'ad', value: 'done', text: 'Done' },
]

const myList = [
    { key: 'ax', value: 'todo', text: 'Todo' },
    { key: 'al', value: 'inProgress', text: 'In Progress' },
    { key: 'ad', value: 'done', text: 'Done' },
]

const priority = { 
    2:  { key: 'ax', color: 'red', text: 'High' },
    1: { key: 'al', color: 'yellow', text: 'Medium' },
    0: { key: 'ad', color: 'blue', text: 'Low' }
}

const TaskCard  = ({ data, open, userId, changeStatus, openTag, deleteTask, userScheduleTask, access }) => {
    return (
        <Card>
            <Card.Content>
                <Card.Header as='a' onClick={() => open(data)}>{data.title}</Card.Header>

                {/* <Card.Description as='a' onClick={() => open(data)}><b style={{ fontSize: 17, color: "#000000" }}>{data.title}</b></Card.Description> */}
                <div>
                    {(data.tags && data.tags[0]) && (
                    <Label basic as="a" size='tiny' onClick={() => openTag(data.tags[0], data.status)}>
                        {data.tags[0]}
                    </Label>)}

                    {(data.tags && data.tags[1]) && (
                    <Label basic as="a" size='tiny' onClick={() => openTag(data.tags[1], data.status)}>
                        {data.tags[1]}
                    </Label>)}
                    {(data.tags && data.tags[2]) && (                      
                        <Popup
                            on="click"
                            trigger={<Label basic size='tiny'>...</Label>}
                        >
                            <Popup.Header>Tags</Popup.Header>
                            <Popup.Content>
                                <Label.Group>
                                {data.tags.map((tag , i) => (
                                    <Label basic as="a" key={i} onClick={() => openTag(tag, data.status)}>{tag}</Label>  
                                ))}
                                </Label.Group>
                            </Popup.Content>
                        </Popup>
                    )}
                </div>
                
                <Card.Meta>
                <Label.Group size="small">
                <Popup
                    trigger= {
                        <Icon name={'folder open'} />
                    }
                    position="top left"
                    content={`${data.projectName} project`}
                /> 
                {(data.deadline) && (
                <Popup
                    trigger= {
                        <Label basic color='yellow'>
                            <Icon name="clock"/>
                            {data.deadline}
                        </Label>   
                    }
                    content='Deadline'
                />)}
                {(data.schedule && data.schedule[userId]) && (
                    <Popup
                        trigger= {
                            <Label basic color="green">
                                <Icon name="calendar alternate" />
                                {data.schedule[userId]}
                            </Label> 
                        }
                        content='Schedule'
                    />
                )}   
                <Popup
                    trigger= {
                        <Label empty circular color={priority[data.priority].color} /> 
                    }
                    position="top right"
                    content={`${priority[data.priority].text} Priority`}
                />   
                
                </Label.Group> 
                </Card.Meta>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                    <span>
                        status: {' '}
                        <Dropdown
                        inline
                        options={access? lists : myList}
                        defaultValue={data.status}
                        pointing="top"
                        floating
                        onChange={(e, { value}) => changeStatus(data, value)}
                        />
                    </span>

                    <Dropdown pointing={"right"} floating icon={'ellipsis vertical'}>
                        <Dropdown.Menu>
                            {(data.teamIds.includes(userId)) && (
                                <Dropdown.Item onClick={() => userScheduleTask(data)}>Schedule</Dropdown.Item>
                            )}
                            {(access) && (<Popup
                                trigger ={
                                    <Dropdown.Item>Delete</Dropdown.Item>
                                }
                                on='click'
                            >
                                <Popup.Header>Are you sure you want to delete this task?</Popup.Header>
                                <Button basic color='green' fluid onClick={() => deleteTask(data)}>
                                    Delete
                                </Button>
                            </Popup>)}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <br />
                {(data.teamRef && data.teamRef[0]) && (
                    <Popup content={data.teamRef[0].name} trigger={
                        <Image src={data.teamRef[0].photoUrl ? data.teamRef[0].photoUrl : 'https://react.semantic-ui.com/images/avatar/small/elliot.jpg'} avatar />
                    } />
                )}
                
                {(data.teamRef && data.teamRef[1]) && (
                    <Popup content={data.teamRef[1].name} trigger={
                        <Image src={data.teamRef[1].photoUrl ? data.teamRef[1].photoUrl : 'https://react.semantic-ui.com/images/avatar/small/elliot.jpg'} avatar />
                    } />
                )}

                {data.teamIds && data.teamIds[2] && (
                    <Label basic size='tiny'>more</Label>
                )}
          
            </Card.Content>
        </Card>
    )
}

export default TaskCard;