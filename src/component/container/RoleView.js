import React from 'react';
import { Table, Label, Icon, Segment, Popup } from "semantic-ui-react";
import { widgetDescription } from "../../utils/resources"

const RoleView = ({ role: { permission, title } }) => {

    return (
        <div>
            <Segment attached="top" textAlign="center" inverted>
                {title} role
            </Segment>
            <Table celled selectable>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>WIDGET</Table.HeaderCell>
                    <Table.HeaderCell>DESCRIPTION</Table.HeaderCell>
                    <Table.HeaderCell>PERMISSION</Table.HeaderCell>
                </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>
                            <Label ribbon>Administration <Icon color={!!permission.administration? "green" : "red"} name={!!permission.administration? "checkmark" : "close"} /></Label>
                        </Table.Cell>
                        <Table.Cell>
                            {widgetDescription.administration}
                        </Table.Cell>
                        <Table.Cell>
                            {(!!permission.administration) && (<div>
                                <Icon color={"green"} name={'checkmark'} /> Can read administrative data
                                <br />
                                <Icon color={!!permission.administration.department? "green" : "red"} name={!!permission.administration.department? 'checkmark': "close"} /> Manage Departments (Create, delete, rename)
                                <br />
                                <Icon color={!!permission.administration.team? "green" : "red"} name={!!permission.administration.team? 'checkmark': "close"} /> Manage teams (Invite, delete, edit)
                                <br />
                                <Icon color={!!permission.administration.role? "green" : "red"} name={!!permission.administration.role? 'checkmark': "close"} /> Manage roles <Popup trigger={<Icon name={"info circle"} />} content="A role has a group of widgets with configurable permissions." />
                            </div>)}
                            {(!permission.administration) && ( 
                                <div>
                                    <Icon color={"red"} name={"close"} /> Don't have administration widget
                                </div>
                            )}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <Label ribbon>Project <Icon color={!!permission.project? "green" : "red"} name={!!permission.project? "checkmark" : "close"} /></Label>
                        </Table.Cell>
                        <Table.Cell>
                            {widgetDescription.project}                       
                        </Table.Cell>
                        <Table.Cell>
                            {(!!permission.project) && (
                            <div>
                                {(permission.project.control === 'single') && (
                                    <p>
                                        <Icon color={"green"} name={'checkmark'}/> Manage projects for team member's department (include project collaboration with other departments)
                                    </p>
                                )}
                                {(permission.project.control === 'multiple') && (
                                    <p>
                                        <Icon color={"green"} name={'checkmark'}/> Manage projects for multiple departments
                                    </p>
                                )}
                            </div>)}
                            {(!permission.project) && (
                            <div>
                                <Icon color={"red"} name={'close'}/> Don't have project widget
                            </div>)}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <Label ribbon>My Task <Icon color={!!permission.task? "green" : "red"} name={!!permission.task? "checkmark" : "close"} /></Label>
                        </Table.Cell>
                        <Table.Cell>
                            {widgetDescription.task}
                        </Table.Cell>
                        <Table.Cell>
                            {(!!permission.task) && (
                                <div>
                                   <Icon color={"green"} name={'checkmark'}/> Manage assigned assign {(!!permission.project? "fully": "partially")}. 
                                   <br />
                                   <Icon color={"green"} name={"info"}/> My task widget permission depends on a team member's role having the project widget. Project widget grants users permission to manage tasks, hence, they can perform task operations like delete, assign, and change deadline.
                                </div>
                            )}
                            {(!permission.task) && (
                                <div>
                                    <Icon color="red" name="close" /> Don't have my task widget
                                </div>
                            )}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <Label ribbon>Announcement <Icon color={!!permission.announcement? "green" : "red"} name={!!permission.announcement? "checkmark" : "close"} /></Label>
                        </Table.Cell>
                        <Table.Cell>
                            {widgetDescription.announcement}
                        </Table.Cell>
                        <Table.Cell>
                            {(!!permission.announcement) && (
                            <div>
                                <Icon color="green" name={'checkmark'} /> Read announcements

                                {(permission.announcement.create === 'none') && (
                                    <p>
                                       <Icon color={"green"} name={'checkmark'}/> Can't create announcement 
                                    </p>
                                )}

                                {(permission.announcement.create === 'single') && (
                                    <p>
                                        <Icon color={"green"} name={'checkmark'}/> Create announcement for team member's department
                                    </p>
                                )}
                                {(permission.announcement.create === 'multiple') && (
                                    <p>
                                        <Icon color={"green"} name={'checkmark'}/> Create announcement for multiple departments
                                    </p>
                                )}
                            </div>)}
                            {(!permission.announcement) && (
                                <div>
                                    <Icon name="close" color="red" /> Don't have announcement widget
                                </div>
                            )}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <Label ribbon>Suggestion Box <Icon color={!!permission.suggestion? "green" : "red"} name={!!permission.suggestion? "checkmark" : "close"} /></Label>
                        </Table.Cell>
                        <Table.Cell>
                            {widgetDescription.suggestion}
                        </Table.Cell>
                        <Table.Cell>
                            {(!!permission.suggestion) && (
                            <div>

                                {(permission.suggestion.review === 'none') && (
                                    <p>
                                       <Icon color={"green"} name={'checkmark'}/> Can't review suggestions
                                    </p>
                                )}

                                {(permission.suggestion.review === 'department') && (
                                    <p>
                                        <Icon color={"green"} name={'checkmark'}/> Review suggestions for team member's department
                                    </p>
                                )}
                                {(permission.suggestion.review === 'management') && (
                                    <p>
                                        <Icon color={"green"} name={'checkmark'}/> Review suggestions for management
                                    </p>
                                )}
                                {(permission.suggestion.review === 'all') && (
                                    <p>
                                        <Icon color={"green"} name={'checkmark'}/> Review all suggestions
                                    </p>
                                )}
                            </div>)}
                            {(!permission.suggestion) && (
                                <div>
                                    <Icon name="close" color="red" /> Don't have suggestion widget
                                </div>
                            )}
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    )
}

export default RoleView
