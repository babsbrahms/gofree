import React from 'react'
import Announcement from './widget/Announcement';
import Administration from './widget/Administration';
import Project from './widget/Project';
import Task from './widget/Task';
// import Note from './widget/Note';
// import Poll from './widget/Poll';
import Suggestion from './widget/Suggestion';

const Widget = ({name, role, team }) => {
    let display;

    switch (name) {
        case 'announcement':
            display =  <Announcement rolePermission={role.permission.announcement} team={team} />
            break;
        case 'administration':
            display = <Administration rolePermission={role.permission.administration} team={team}  />
            break;
        case 'project':
            display = <Project rolePermission={role.permission.project} team={team}  />
            break;
        case 'task':    
            display = <Task team={team} access={!!role.permission.project}  />
            break;
        case 'suggestion':
            display = <Suggestion rolePermission={role.permission.suggestion} team={team}  />
            break;
        // case 'note':
        //     display = <Note team={team}  />
        //     break;
        // case 'poll':
        //     display = <Poll rolePermission={role.permission.poll} team={team}  />
        //     break;
        default:
            display = <div />
    }

    return (
        display
    )
}

export default Widget;