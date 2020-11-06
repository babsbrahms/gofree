import React from 'react';
import { Form, Popup, Icon } from 'semantic-ui-react';

export const RoleForm = ({ widget, permission, addPermision}) => {
    let singleExplain = 'this refers to the department(s) of the team member(s) that are assigned to this role';
    return (
        <div>
            {(widget === 'administration') && (
                <div>
                    <Form.Group grouped>
                        <Form.Checkbox label='Manage Departments' checked={!!permission.administration.department} onChange={() => addPermision(widget, 'department', !permission.administration.department)}/>
                        <Form.Checkbox label='Manage Teams' checked={!!permission.administration.team} onChange={() => addPermision(widget, 'team', !permission.administration.team)}/>
                        <Form.Checkbox label='Manage Roles' checked={!!permission.administration.role} onChange={() => addPermision(widget, 'role', !permission.administration.role)}/>
                    </Form.Group>
                </div>
            )}

            {(widget === 'project') && (
                <Form.Group grouped>
                    <div style={{ display: 'flex', flexDirection: "row", alignItems: "center" }}>
                        <Form.Radio label="Manage Single (team member's) Department Project" value={'single'} checked={permission.project.control === 'single'} onChange={() => addPermision(widget, 'control', 'single')} />
                        <Popup
                            trigger={<Icon name="info circle" />}
                            content={singleExplain}
                        />
                    </div>
                    <Form.Radio label='Manage Multiple Departments Project' value={'multiple'} checked={permission.project.control === 'multiple'} onChange={() => addPermision(widget, 'control', 'multiple')} />
                </Form.Group>                                 
            )}


            {(widget === 'task') && (
                <Form.Group grouped>
                    <label>
                    <Icon color={"green"} name={'checkmark'}/> Manage assigned {(!!permission.project? "fully": "partially")}.
                    </label>
                    <br />
                    My task widget permission depends on a team member's role having the project widget. Project widget grants users permission to manage tasks, hence, they can perform task operations like delete, assign, and change deadline.
                    
                </Form.Group>                                 
            )}

            
            {(widget === 'suggestion') && (
                <Form.Group grouped>
                    <Form.Radio label='Unable To Review Suggestions' value={'none'} checked={permission.suggestion.review === 'none'} onChange={() => addPermision(widget, 'review', 'none')} />
                    <Form.Radio label="Review  Single (team member's) Department Suggestions" value={'department'} checked={permission.suggestion.review === 'department'} onChange={() => addPermision(widget, 'review', 'department')} />
                    <Form.Radio label='Review Suggetions For Management' value={'management'} checked={permission.suggestion.review === 'management'} onChange={() => addPermision(widget, 'review', 'management')} />
                    <Form.Radio label='Review All Suggestions' value={'all'} checked={permission.suggestion.review === 'all'} onChange={() => addPermision(widget, 'review', 'all')} />
                </Form.Group>                                 
            )}

            
            {(widget === 'announcement') && (
                <Form.Group grouped>
                    <Form.Radio label='Unable To Create Announcement' value={'none'} checked={permission.announcement.create === 'none'} onChange={() => addPermision(widget, 'create', 'none')} />
                    <div style={{ display: 'flex', flexDirection: "row", alignItems: "center" }}>
                        <Form.Radio label="Create For Single (team members's) Department" value={'single'} checked={permission.announcement.create === 'single'} onChange={() => addPermision(widget, 'create', 'single')} />

                        <Popup
                            trigger={<Icon name="info circle" />}
                            content={singleExplain}
                        />
                    </div>
                    <Form.Radio label='Create For Multiple Departments'  value={'multiple'} checked={permission.announcement.create === 'multiple'} onChange={() => addPermision(widget, 'create', 'multiple')} />
                </Form.Group>                                 
            )}

        </div>
    )
}
