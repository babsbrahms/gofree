import React, { Component, createRef } from 'react'
import { Form, Label, Icon, Tab, Progress, List, Checkbox, Menu, Accordion, Segment, Message, Button, Confirm, Dropdown, Image, Popup } from 'semantic-ui-react';
import styles from '../../styles';
import { CommentView } from "./Comment";
import { TaskLog } from './TaskLog';
import { updateData, commitNewTask, serverTimestamp, generatefirestoreId, commitTaskDelete, commitTaskChanges, fetchTaskComment, fetchAllAcceptedTeams, fetchNewTaskComment,
    fetchAllprojectTeams, addAttachment, removeAttachment, addChecklist, removeChecklist, clearUnwantedTask, fetchTaskAttachment, fetchTaskChecklist, fetchTaskLogs, fetchNewTaskLogs, analytics } from '../fbase'


const progressList = [
    { key: 'a1', value: 'backlog', text: 'Backlog' },
    { key: 'ax', value: 'todo', text: 'Todo' },
    { key: 'al', value: 'inProgress', text: 'In Progress' },
    { key: 'ad', value: 'done', text: 'Done' }
]

const priorityList = [
    { key: 'ax', value: 2, text: 'High' },
    { key: 'al', value: 1, text: 'Medium' },
    { key: 'ad', value: 0, text: 'Low' }
]

export default class TaskView extends Component {
    constructor (props) {
        super(props);

        this.state = {
            confirmOpen: false,
            sending: false,
            create: true,
            uploading: false,
            activeIndex: 0,
            data: {
                title: "",
                description: "",
                deadline: "",
                teamIds: [],
                teamRef: [],
                tags: [],
                teamLead: "",
                priority: 1,
                status: "backlog",
                schedule: {},
                createdAt: new Date(),
                projectId: props.project.id,
                projectName: props.project.name,
                projectDeptIds: props.project.departmentIds,
                createdBy: props.team.userId,
                workspaceId: props.team.workspaceId
            },
            checklist: [],
            attachment: [],
            errors: {},
            loading: {},
            edit: {
                title: false,
                description: false,
                teamIds: false,
                tags: false,
                checklist: false,
                teamLead: false,
                segment: false,
                attachment: false
                // deadline: false,
                // priority: false,
                // status: false,   
            },
            changes: {

            },
            comments: { lastVal: null, comments: [] },
            latestComment: { isNew: true, comments: [] },
            logs: { lastVal: null, logs: [] },
            latestLog: { isNew: true, logs: [] },
            teams: [],
            todo: '',
            todoIndex: -1,
            openings: {
                tags: false,
                checklist: false, 
                attachment: false
            },
            createId: null, // generate id during create
            createdTask: false, // to know if task is creates
            allowEditAll: false
        }
        this.attachmentInput = createRef()
    }

    componentDidMount() {
        const { task } = this.props;

        if (!!task.id) {
            // view
            this.setState({ create: false, data: { ...task } })
            this.getAttachment(task.id);
            this.getChecklIst(task.id);
            this.getComment(task.id)
        } else {
            // create
            let genId = generatefirestoreId('task');
            this.setState({ createId : genId, create: true })
            this.getAttachment(genId.id);
            this.getChecklIst(genId.id);
        }
    }

    componentWillUnmount() {
        const { create, checklist, attachment, createdTask } = this.state;
        if (this.unChecklist) {
            this.unChecklist()
        }
        
        if (this.unAttachment) {
            this.unAttachment()
        }
        
        if (this.unComment) {
            this.unComment()
        }

        if (this.unLog) {
            this.unLog()
        }

        if (this.unTeam) {
            this.unTeam()
        }

        if (create && !createdTask) {
            // discard attachment and checklist
           clearUnwantedTask(checklist, attachment)
        }

    }

    getChecklIst = (id) => {
        this.setState({ loading: { ...this.state.loading, checklist: true } }, () => {
            this.unChecklist = fetchTaskChecklist(id, (res) => {
                this.setState({ checklist: res, loading: { ...this.state.loading, checklist: false } })
            }, (err) => {
                // console.log(err);
                this.setState({ 
                    loading: { ...this.state.loading, checklist: false },
                    errors: { ...this.state.errors, general:  err.message }
                })
            })
        })
    }

    getAttachment = (id) => {
        this.setState({ loading: { ...this.state.loading, attachment: true } }, () => {
            this.unAttachment = fetchTaskAttachment(id, (res) => {
                this.setState({ attachment: res, loading: { ...this.state.loading, attachment: false } })
            }, (err) => {
                this.setState({
                    loading: { ...this.state.loading, attachment: false },
                    errors: { ...this.state.errors, general:  err.message }
                })
            })
        })

    }
    
    getComment = (id) => {
        if (!this.unComment) {
            this.setState({ loading: { ...this.state.loading, comments: true } }, () => {
                this.unComment = fetchNewTaskComment(id, (res) => {
                    // console.log("latest: ", res);
                    if (this.state.latestComment.isNew) {
                        // console.log("cancel length::", res.length, );
                        this.setState({ latestComment: { 
                            ...this.state.latestComment, 
                            isNew: false
                        }})                    
                    } else {
                        // console.log("set length::", res.length);
                        this.setState({ latestComment: { 
                            ...this.state.latestComment, 
                            comments: [  ...res, ...this.state.latestComment.comments ]
                        }})
                    }
                }, (err) => {
                    this.setState({ 
                        errors: { ...this.state.errors, general:  err.message }
                    })                
                })
                
                
                fetchTaskComment(id, (res) => {
                    this.setState({ comments: res, loading: { ...this.state.loading, comments: false } })
                }, (err) => {
                    // console.log(err);
                    this.setState({ 
                        loading: { ...this.state.loading, comments: false },
                        errors: { ...this.state.errors, general:  err.message }
                    })
                    
                })
            })

        }
    }

    getLogs = (id) => {
        if (!this.unLog) {
            this.setState({ loading: { ...this.state.loading, logs: true } }, () => {
                this.unLog = fetchNewTaskLogs(id, (res) => {
                    if (this.state.latestLog.isNew) {
                        this.setState({ latestLog: { 
                            ...this.state.latestLog, 
                            isNew: false
                        }})                    
                    } else {
                        this.setState({ latestLog: { 
                            ...this.state.latestLog, 
                            logs: [  ...res, ...this.state.latestLog.logs ]
                        }})
                    }
                }, (err) => {
                    this.setState({ 
                        errors: { ...this.state.errors, general:  err.message }
                    })                
                })
                
                
                fetchTaskLogs(id, (res) => {
                    this.setState({ logs: res, loading: { ...this.state.loading, logs: false } })
                }, (err) => {
                    // console.log(err);
                    this.setState({ 
                        loading: { ...this.state.loading, logs: false },
                        errors: { ...this.state.errors, general:  err.message }
                    })
                    
                })
            })

        }
    }

    // getLogs = (id) => {
    //     if (!this.unLog) {
    //         this.setState({ loading: { ...this.state.loading, logs: true } }, () => {
    //             this.unLog = fetchTaskLogs(id, (res) => {
    //                 this.setState({ logs: res, loading: { ...this.state.loading, logs: false } })
    //             }, (err) => {
    //                 // console.log(err);
    //                 this.setState({ 
    //                     loading: { ...this.state.loading, logs: false },
    //                     errors: { ...this.state.errors, general:  err.message }
    //                 })
                    
    //             })
    //         })

    //     }
    // }

    getTeam = () => {
        const { project } = this.props;
        const success = (res) => {
            // console.log('Teams: ', res);
            let teams =  res.map(team => (
                {
                    key: team.id,
                    text: team.name,
                    value: team.userId,
                    image: { avatar: true, src: team.photoUrl },
                }
            ))
            this.setState({ teams, loading: { ...this.state.loading, teamIds: false } })
        }

        const error = (err) => {
            this.setState({ 
                loading: { ...this.state.loading, teamIds: false },
                errors: { ...this.state.errors, general:  err.message }
            })
        }

        // console.log('project: ', project);

        if (!this.unTeam && project.departmentIds) {
            this.setState({ loading: { ...this.state.loading, teamIds: true } }, () => {
                // console.log('called team');
                if (project.departmentIds.length > 10) {
                    this.unTeam = fetchAllAcceptedTeams(project.workspaceId, (res) => {
                        success(res)
                    }, (err) => {
                        error(err)
                    })
                } else {
                    this.unTeam = fetchAllprojectTeams(project.departmentIds, (res) => {
                        success(res)
                    }, (err) => {
                        error(err)
                    })
                }
            })
        }
    }

    addData = (data) => {
        const { create, changes } = this.state;
        const { task } = this.props

            this.setState({  
                data: {
                    ...this.state.data,
                    [data.name]: data.value,
                }
            }, () => {
                if (!create) {
                    const { data: current } = this.state;
                    if ((task[data.name] !== current[data.name]) && !changes[data.name]) {
                        this.setState({
                            changes: {
                                ...this.state.changes,
                                [data.name]: true
                            }
                        })
                    } else if ((task[data.name] === current[data.name]) && changes[data.name]) {
                        // 
                        delete changes[data.name];
                        this.setState({
                            changes
                        })
                    }
                }
            })
        
    }

    addToChecklist = () => {
        const { todo, create, createId, data } = this.state;
        const { team, project } = this.props;

        if (todo) {
            let payload = { 
                text: todo, 
                checked: false,
                taskId: create? createId.id : data.id,
                userId: team.userId,
                projectId: project.id,
                createdAt: serverTimestamp(),
                workspaceId: team.workspaceId
            }

            this.setState({ todo: "", todoIndex: -1 }, () => {
                addChecklist(payload, create, createId, data, team, project)
                .then(res => {
                    analytics.logEvent("add_checklist")
                })
                .catch(err =>  {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })

            })   
        }
    }

    removeChecklist = (selected, i) => {
        const { create, data, createId } = this.state;
        const { team, project } = this.props;

        this.setState({ todo: '', todoIndex: -1 }, () => {
            removeChecklist(selected, create, createId, data, team, project)
            .then(res => {
                analytics.logEvent("remove_checklist")
            })
            .catch(err =>  {
                this.setState({ errors: { ...this.state.errors, general:  err.message }})
            })  
        })

    }

    updateChecklistCheck = (selected, i) => {
        const payload = { ...selected, checked: !selected.checked}
        this.setState({ todo: '', todoIndex: -1 }, () => {
            updateData('checklist', payload.id, payload, (res) => {

            }, (err) => {
                this.setState({ errors: { ...this.state.errors, general:  err.message }})
            })
        })
    }

    updateChecklistText = () => {
        const { checklist, todo, todoIndex } = this.state;

        if (todo) {
            const selected = checklist[todoIndex]
            const payload = { ...selected, text: todo }
            this.setState({ todo: '', todoIndex: -1 }, () => {
                updateData('checklist', payload.id, payload, (res) => {

                }, (err) => {
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            })
        }

    }

    addToTag = (value) => {
        const { create, changes } = this.state;
        const { task } = this.props;

        this.setState({ 
            data: { 
                ...this.state.data, 
                tags: value.split(',')
            } 
        }, () => {
            if (!create) {
                const { data: current } = this.state;
                if ((task.tags.toString() !== current.tags.toString())  && !changes.tags) {
                    this.setState({
                        changes: {
                            ...this.state.changes,
                            tags: true
                        }
                    })
                } else if ((task.tags.toString() === current.tags.toString()) && changes.tags) {
                    // 
                    delete changes.tags.toString();
                    this.setState({
                        changes
                    })
                }
            }
        })
    }

    removeTag = (i) => {
        const { create, data, changes } = this.state;
        const { task } = this.props;

        data.tags.splice(i, 1)
        this.setState({
            data: {
                ...this.state.data,
                tags: [...data.tags]
            }
        }, () => {
            if (!create) {
                if (task.tags.toString() !== data.tags.toString()) {
                    this.setState({
                        changes: {
                            ...this.state.changes,
                            tags: true
                        }
                    })
                } else if ((task.tags.toString() === data.tags.toString()) && changes.tags) {
                    // 
                    delete changes.tags.toString();
                    this.setState({
                        changes
                    })
                }
            }
        })
    }

    validateAttachmentSize = (files) => {
        let err = '';

        Array.from(files).forEach(file => {
            if (file.size > 5000000) {
                err += `${file.name}, `
            }
        })

        return err
    }

    addAttachment = (e) => {
        const { create, createId, data } = this.state; 
        const { team, project } = this.props;
        let files = e.target.files;
        let maxSizeErr = this.validateAttachmentSize(files)

        if (maxSizeErr) {
            this.setState({ 
                errors: { ...this.state.errors, general:  `The following attachment(s)[${maxSizeErr}] size(s) exceed 5MB` }
            })

        } else {
            this.setState({  uploading: true } , () => {
                addAttachment(files, create, createId, data, team, project)
                .then(res => {
                    this.setState({ uploading: false })
                })
                .catch((err) => {
                    this.setState({ uploading: false, errors: { ...this.state.errors, general:  err.message }})
                })
                
                Array.from(files).forEach(file => {
                    analytics.logEvent("add_attachment", {
                        type: file.type,
                        size: file.size
                    })
                })
            })
        }
    }

    removeAttachment = (selected, i) => {
        const { create, data, createId } = this.state;
        const { team, project } = this.props;

        removeAttachment(selected, create, createId, data, team, project)
        .then(res => {
            analytics.logEvent("remove_attachment")
        })
        .catch(err =>  {
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }

    addTeamMember = (data) => {
        const { create, changes } = this.state;
        const { task, access } = this.props;

        if (access) {
            this.setState({ 
                data: { 
                    ...this.state.data, 
                    teamIds: data.value
                } 
            }, () => {
                if (!create) {
                    const { data: current } = this.state;
                    // console.log('old: ', task.teamIds.toString());
                    // console.log('new: ', current.teamIds.toString());
                    if ((task.teamIds.toString() !== current.teamIds.toString()) && !changes.teamIds) {
                        this.setState({
                            changes: {
                                ...this.state.changes,
                                teamIds: true
                            }
                        })
                    } else if ((task.teamIds.toString() === current.teamIds.toString()) && changes.teamIds) {
                        delete changes.teamIds.toString();
                        this.setState({
                            changes
                        })
                    }
                }
            })
        } else {
            this.setState({ errors: { ...this.state.errors, general: "You are not authorized!!" }})
        }
    }

    changeEdit = (name) => this.setState({
        edit: {
            ...this.state.edit,
            [name]: !this.state.edit[name]
        }
    })

    changeOpenings = (data) => this.setState({
        openings: {
            ...this.state.openings,
            [data.name]: !this.state.openings[data.name]
        }
    })

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index
    
        this.setState({ activeIndex: newIndex })
    }


    validate = (title, status, teamIds) => {
        let err = {};

        if (!title) err.title = 'Title is required to make a project';

        if (status !== 'backlog' && teamIds.length === 0) err.general = 'One or more team members are required for tasks that are not backlog'
        return err
    }
    
    sanitize = (data) => {
        const { teams } = this.state;
        // tags

        let newTags = []
        data.tags.forEach((tag, i) => {
            if (tag.trim()) {
                newTags.push(tag.toLowerCase().trim())
            } 
        })
        data.tags = newTags

        // teamRef
        data.teamRef.forEach((team, index) => {
            // console.log('teamRef ', data.teamIds);
            // console.log('teamRef includes: ', data.teamIds.includes(team.userId));
            // remove old team
            if (!data.teamIds.includes(team.userId)) {
                // console.log('del ', data.teamRef[index]);
                // data.teamRef.splice(index, 1);
            }
        })
        if(teams.length !== 0) {
            //assign new team
            if (data.teamIds[0]) {
                let team = teams.find(x => x.value === data.teamIds[0])
    
                if (team) {
                    data.teamRef[0] = { name: team.text, photoUrl: team.image.src, userId: team.value };
                }
            }
    
            if (data.teamIds[1]) {
                let team = teams.find(x => x.value === data.teamIds[1])
    
                if (team && data.teamRef[0]) {
                    data.teamRef[1] = { name: team.text, photoUrl: team.image.src, userId: team.value };
                } else if (team) {
                    data.teamRef[0] = { name: team.text, photoUrl: team.image.src, userId: team.value }; 
                }
            }
        }

        //remove scheduled task for removed team
        Object.keys(data.schedule).forEach((userId) => {
            if (!data.teamIds.includes(userId)) {
                delete data.schedule[userId];
            }
        })
        // console.log('sanitize: ', data);
        return data
    }

    send = () => {
        const { data, create, createId, changes } = this.state;
        const { project, team, close, task: oldTask } = this.props;
        
        let errors = this.validate(data.title, data.status, data.teamIds)
        if (Object.keys(errors).length === 0) {
            this.setState({ sending: true, errors: {}, createdTask: true }, () => {
                let task = this.sanitize(data)
                if (create) {
                    commitNewTask({ ...task, createdAt: serverTimestamp(), id: createId.id }, team, project)
                    .then(() => {
                        analytics.logEvent("create_task", {
                            source: "input"
                        })
                        analytics.logEvent("add_teams_to_task", {
                            size: task.teamIds.length
                        })
                        this.setState({ errors: {}, sending: false })
                        close()
                    })
                    .catch((err) => {
                        this.setState({sending: false, errors: { ...this.state.errors, general:  err.message }})  
                    })
                } else {
                    if (Object.keys(changes).length !== 0) {
                        commitTaskChanges(changes, task, oldTask, team, project)
                        .then(() => {
                            this.setState({ 
                                errors: {}, 
                                sending: false, 
                                changes: {},
                                allowEditAll: false,
                                edit: {
                                    title: false,
                                    description: false,
                                    teamIds: false,
                                    tags: false,
                                    checklist: false,
                                    teamLead: false,
                                    segment: false,
                                    attachment: false
                                }
                            })
                            analytics.logEvent("update_task", {
                                source: "input"
                            })
                            analytics.logEvent("add_task_team", {
                                size: task.teamIds.length
                            })
                        })
                        .catch((err) => {
                            this.setState({ sending: false, errors: { ...this.state.errors, general:  err.message }})
                        })
                    }
                }
            })
        } else {
            this.setState({ errors, sending: false,  })
        }
       
    }

    changeConfirm = (state, open) => this.setState({ confirmOpen: state }, () => {
        if (open) {
            this.deleteTask()
        }
    })

    discardChanges = () => {
        const { task } = this.props;

        this.setState({ 
            data: task ,
            edit: {
                title: false,
                description: false,
                teamIds: false,
                tags: false,
                checklist: false,
                teamLead: false,
                segment: false,
                attachment: false
            },
            changes: {},
            allowEditAll: false
        })
    }

    deleteTask = ( ) =>  {
        const { data } = this.state;
        const { team, close, project } = this.props;
        this.setState({ loading: { ...this.state.loading, deleteTask: true } }, () => {
            commitTaskDelete(data, team, project)
            .then(() => {
                close()
            })
            .catch(err => {
                this.setState({loading: false, errors: { ...this.state.errors, general:  err.message }})
            }) 
        })        
    }

    chooseTab = (index) => {
        const {data} = this.state;
        if (data.id) {
            if (index === 0) {
               // this.getComment(data.id)
            } else if (index === 1) {
                this.getLogs(data.id)
            }
        }
    }

    downloadFile = url => {
          // This can be downloaded directly:
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function(event) {
           // var blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();
    }

    changeEditAll = val => {
        if (!!val) {
            this.setState({
                allowEditAll: val,
                edit: {
                    title: true,
                    description: true,
                    teamIds: true,
                    tags: true,
                    checklist: true,
                    teamLead: true,
                    segment: true,
                    attachment: true
                }
            })
        } else {
            this.setState({
                allowEditAll: val,
                edit: {
                    title: false,
                    description: false,
                    teamIds: false,
                    tags: false,
                    checklist: false,
                    teamLead: false,
                    segment: false,
                    attachment: false
                }
            })
        }
    }

    render() {
        const { data, sending, checklist, attachment, errors, changes, loading, create, edit, comments, logs,
             todo, todoIndex, activeIndex, uploading, openings, confirmOpen, teams, allowEditAll, latestComment, latestLog } = this.state;
        const { team, access } = this.props;
        const panes = [
            { menuItem: 'Comment', render: () => <Tab.Pane loading={!!loading.comment}> <CommentView latestComment={latestComment.comments} comments={comments} team={team} task={data} /></Tab.Pane> },
            { menuItem: 'History',  render: () => <Tab.Pane loading={!!loading.log}> <TaskLog latestLog={latestLog.logs} taskId={data.id} logs={logs}/></Tab.Pane> },
        ];

        return (
            <Segment loading={loading.deleteTask}>
                
                <div style={{ position: 'fixed', top: "0%", left: "0%", width: '80%' }}>
                {(!!errors.general) && ( 
                    <Message 
                        error 
                        content={errors.general} 
                        onDismiss={() => this.setState({ errors: { ...errors, general: "" }})}
                        compact
                        size="small"
                    />
                )}
                </div>

                
                <Form>  
                    <Confirm
                        open={confirmOpen}
                        content='Are you sure you want to delete this task'
                        onCancel={() => this.changeConfirm(false)}
                        onConfirm={() => this.changeConfirm(true, true)}
                    />
                    {(!create) && (<h1>{data.projectName} project</h1>)}
                    {(!create) && (
                        <p>
                           <Icon color={'yellow'} name={"warning"}/> During edit, changes to attachment and checklist are updated in realtime. Hence, they cannot be discarded
                        </p>
                    )}
                    {(!create) && (
                    <Button.Group floated="right" size="tiny">
                        {(Object.keys(changes).length !== 0) && (
                        <Button basic disabled={sending} loading={sending} color='green' onClick={this.send}>
                            Update Changes
                        </Button>)}
                        {(Object.keys(changes).length !== 0) && (
                        <Button basic color='yellow' disabled={sending} onClick={() => this.discardChanges()}>
                            Discard Changes
                        </Button>)}
                        {(access) && (<Button basic color="red" disabled={sending} onClick={() => this.changeConfirm(true)}>
                            Delete Task
                        </Button>)}
                    </Button.Group>)}

                    
                    {(!create) && (
                    <Button.Group floated="left" size="tiny">
                        <Button basic color={allowEditAll? 'red' : 'green'} onClick={() => this.changeEditAll(!allowEditAll)}>
                           <Icon color={allowEditAll? 'red' : 'green'} name={allowEditAll? "lock" : "lock open"} /> {allowEditAll? 'Close all input for edit' : "Open all input for edit"}
                        </Button>
                    </Button.Group>)}
                    <br/>
                    <br/>
                    <Form.Field>
                        <label>Title {(!create) && <Icon name={edit.title? 'cancel' : 'edit'} onClick={() => this.changeEdit('title')}/>}</label> 

                        {(!!create || edit.title) && (
                            <Form.Input loading={!!loading.title} defaultValue={data.title} error={!!errors.title} name='title' onChange={(e, data) => this.addData(data)} placeholder='Add task title' maxLength={120} />
                        )}

                        {(!create && !edit.title) && (
                            <p>{data.title}</p>
                        )}
                    </Form.Field>


                    <Form.Field>
                        <label>Description {(!create) && <Icon name={edit.description? 'cancel' : 'edit'} onClick={() => this.changeEdit('description')}/>}</label> 

                        {(!!create || edit.description) && (
                            <Form.TextArea loading={!!loading.description} defaultValue={data.description} error={!!errors.description} name='description' onChange={(e, data) => this.addData(data)} placeholder='Add title description' />
                        )}

                        {(!create && !edit.description) && (
                            <p>{data.description}</p>
                        )}
                    </Form.Field>

                    <Form.Field>
                        <label>Team members {(!create) && <Icon name={edit.teamIds? 'cancel' : 'edit'} onClick={() => this.changeEdit('teamIds')}/>}</label> 

                        <Dropdown
                            placeholder='Assign task to team members'
                            fluid
                            multiple
                            search
                            selection
                            loading={loading.teamIds}
                            options={teams}
                            value={data.teamIds}
                            disabled={(!create && !edit.teamIds)}
                            onChange={(e, data) => this.addTeamMember(data)}
                            onClick={() => this.getTeam()}
                        />

                        {(!create && !edit.teamIds) && (
                            <Label.Group>
                                {data.teamRef.map((team) => 
                                <Label key={team.userId} as='a' image>
                                    <img src={team.photoUrl} />
                                    {team.name}
                                </Label>
                                )}
                                {(data.teamIds[2]) && (
                                    <Label pointing="above">
                                        click to get remaining {data.teamIds.length - 2} team members
                                    </Label>
                                )}
                            </Label.Group>
                        )}
                    </Form.Field>
                    <Segment>
                        <div style={styles.betweenStart}>
                            {(!create) && (<label> Edit content below <Icon name={edit.segment? 'cancel' : 'edit'} onClick={() => this.changeEdit('segment')}/></label> )}
                        </div>

                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>Deadline</label>  
                                {(access) && (
                                <input 
                                    disabled={(!create && !edit.segment)} 
                                    type="date" 
                                    defaultValue={data.deadline} 
                                    min={new Date().toISOString().split("T")[0]} 
                                    name='deadline' 
                                    onChange={(e) => this.addData(e.target)} 
                                    placeholder='Add task deadline' 
                                />)} 
                                {(!access) && (
                                    <Popup
                                        trigger={
                                            <input type='date' value={data.deadline} />
                                        }
                                        content="You are not authorized!!"
                                    />
                                )}               
                            </Form.Field>

                            <Form.Field>
                                <label>Priority</label>
                                <Form.Select
                                    disabled={(!create && !edit.segment)}
                                    loading={!!loading.priority}
                                    value={data.priority}
                                    fluid
                                    name="priority"
                                    options={priorityList}
                                    placeholder='Priority'
                                    onChange={(e, data) => this.addData(data)}
                                />
                            </Form.Field>


                            <Form.Field>
                                <label>status</label>
                                <Form.Select
                                    disabled={(!create && !edit.segment)}
                                    loading={!!loading.status}
                                    value={data.status}
                                    fluid
                                    name="status"
                                    options={progressList}
                                    placeholder='Status'
                                    onChange={(e, data) => this.addData(data)}
                                />
                            </Form.Field>
                        </Form.Group>
                    </Segment> 

                    
                    <Accordion as={Menu} vertical>
                        <Menu.Item >
                            <Accordion.Title
                                active={activeIndex === 1}
                                content='Add resources to task'
                                index={1}
                                onClick={this.handleClick}
                            />
                            <Accordion.Content active={activeIndex === 1} >
                                <Form.Group grouped>
                                    <Form.Checkbox disabled={(attachment.length > 0)} label='attachment' name='attachment' type='radio' value={openings.attachment} onChange={(e, data) => this.changeOpenings(data)} />
                                    <Form.Checkbox disabled={(data.tags.length > 0)} label='tags' name='tags' type='radio' value={openings.tags} onChange={(e, data) => this.changeOpenings(data)} />
                                    <Form.Checkbox disabled={(checklist.length > 0)} label='checklist' name='checklist' type='radio' value={openings.checklist} onChange={(e, data) => this.changeOpenings(data)}/>
                                </Form.Group>
                            </Accordion.Content>
                        </Menu.Item>
                    </Accordion>

                    {((attachment.length > 0) || (openings.attachment)) && (
                    <Form.Field >
                        <label>Attachment {(!create) && <Icon name={edit.attachment? 'cancel' : 'edit'} onClick={() => this.changeEdit('attachment')}/>}</label> 

                        <Label.Group color='teal' >
                            {(!!create || edit.attachment) && (
                            <Label circular onClick={() => { this.attachmentInput.click()}}>
                                <Icon circular inverted color='teal' name='add' />
                            </Label> 
                            )}

                            {(uploading) && (<Label circular>
                                <Icon circular inverted color='teal' name='spinner' loading/>
                            </Label>)} 
                        </Label.Group> 
                        <Segment color="teal" style={{ display: "flex", flexDirection: "row", justifyContent: "center", maxHeight: 250, width: "100%", overflow: 'auto', padding: '3px', flexWrap: "wrap"}}>
                            {attachment.map((res, i) => (
                                <div key={i} style={{ width: '45%', height: '100%', margin: 3 }}>
                                    <Segment>
                                        <Label basic attached='top right'> 
                                            {res.name}
                                            {(!!create || edit.attachment) && (
                                                <Label.Detail>
                                                    <Icon color='red' name='delete' onClick={() => this.removeAttachment(res, i)} />         
                                                </Label.Detail>
                                            )} 
                                        </Label>
                                        <br />
                                        <br />
                                        {(res.type.includes("application/pdf")) && (
                                            <embed src={res.url} width="100%" height="auto" />
                                        )}
                                        {(res.type.includes('image')) && (
                                            <Image src={res.url} />
                                        )}
                                        {(res.type.includes('video')) && (
                                            <video width="100%" controls>
                                                <source src={res.url} type={res.type} />
                                                Your browser does not support HTML video.
                                            </video>
                                        )}
                                        <br />
                                         <br />
                                        <Label basic attached={"bottom left"}>
                                            <Popup 
                                                on="click"
                                                content={'To download, click the fullscreen button on the bottom right corner and use the appropriate option to save the attachment (depends on your browser)'}
                                                trigger={
                                                    <a onClick={() => {}}>Download</a>
                                                }
                                            />
                                            {/* <a rel="noopener noreferrer" target={"_blank"} href={res.url} download={res.name} > Download {res.type.split('/')[0] || ""} </a> */}
                                            {/* <a onClick={() => this.downloadFile(res.url)}>Download {res.type.split('/')[0] || ""}</a> */}
                                        </Label>

                                        <Label basic attached={"bottom right"}>
                                            <a rel="noopener noreferrer" target={"_blank"} href={res.url}>Fullscreen</a>
                                        </Label>
                                    </Segment>
                                </div>
                            ))}
                        </Segment>

                        <div style={{ height:'0px', overflow: 'hidden' }}>
                            <input ref={x => this.attachmentInput = x} type="file" multiple name="attachment" onChange={this.addAttachment} />
                        </div>
                          
                    </Form.Field>)}
                </Form>

                <Form>     
                    {((data.tags.length > 0) || (openings.tags)) && (
                    <Form.Field>
                        <label>Tags {(!create) && <Icon name={edit.tags? 'cancel' : 'edit'} onClick={() => this.changeEdit('tags')}/>}</label> 
                        <Icon color={'yellow'} name="info" /> seperate words with comma to create multiple tags
                        <Label.Group>
                            {data.tags.map((tag, i) => (
                                <Label basic key={i}>
                                    {tag}
                                    {(!!create || edit.tags) && (
                                        <Icon color='red' name='delete' onClick={() => this.removeTag(i)}/>         
                                    )} 
                                </Label>
                            ))}
                        </Label.Group>
                        {(!!create || edit.tags) && (
                            <Form.Input key={'tags'} loading={!!loading.tags} value={data.tags.toString()} onChange={(e, { value }) => this.addToTag(value)} placeholder='Add to tags' />                        
                        )}  
                    </Form.Field>)}
                </Form>

                <Form>
                {((checklist.length > 0) || openings.checklist) && (
                    <Form.Field>
                        <label>Checklist {(!create) && <Icon name={edit.checklist? 'cancel' : 'edit'} onClick={() => this.changeEdit('checklist')}/>}</label> 

                        <Progress attached="top" value={checklist.reduce((acc, cur) => acc + (cur.checked? 1 : 0), 0)} total={checklist.length} indicating size="small" />

                        <List divided>
                            {checklist.map((todoData, i) => ( 
                                <List.Item key={i}>
                                    <List.Content floated="right">
                                        {(!!create || edit.checklist) && (todoIndex === i) && (
                                            <Label basic as='a' color={'teal'} size='mini' onClick={() => this.setState({ todoIndex: -1, todo: '' })}>
                                                discard
                                            </Label>
                                        )}
                                        {(!!create || edit.checklist) && (
                                            <Icon color='red' name='delete' onClick={() => this.removeChecklist(todoData, i)}/>         
                                        )} 
                                    </List.Content>
                                    <List.Content floated={'left'}>
                                        <Checkbox value={todoData.checked} checked={todoData.checked} toggle disabled={(!create && !edit.checklist)} onChange={(e, data) => this.updateChecklistCheck(todoData, i)} />
                                    </List.Content>
                                    <List.Content as='a' onClick={() => (!!create || edit.checklist) ? this.setState({ todoIndex: i, todo: todoData.text }) : null}>
                                        {todoData.text}
                                    </List.Content>
                                </List.Item>
                            ))}
                        </List>

                        {(!!create || edit.checklist) && (
                            <div>
                                {(todoIndex === -1) && (
                                    <Form.Input error={!!errors.checklist} loading={!!loading.checklist} value={todo} onChange={(e, data) => this.setState({ todo: e.target.value })} placeholder='Add to checklist' action>  
                                    <input />
                                    <Button color={'teal'} onClick={() => this.addToChecklist()}><Icon name="add"/> Add </Button>
                                    </Form.Input>
                                )}
                                {(todoIndex !== -1) && (
                                    <Form.Input loading={!!loading.checklist} error={!!errors.checklist} value={todo} onChange={(e, data) => this.setState({ todo: e.target.value })} placeholder='update to checklist' action>  
                                        <input />
                                        <Button color={'teal'} onClick={() => this.updateChecklistText()}><Icon name="add"/> Update </Button>
                                    </Form.Input>
                                )}
                            </div>                      
                        )}    
                        {/* action={{color: 'teal', icon: 'add', content: 'add' }} */}
                    </Form.Field>)}
                </Form>
                <br />
                {(!!create) && (
                <Button basic disabled={sending} loading={sending} color='green' onClick={this.send}>
                    <Icon name="add"/> Create Task
                </Button>)}
                <br />
                {(!create) && (<Tab defaultActiveIndex={0} panes={panes} onTabChange={(e, { activeIndex }) => this.chooseTab(activeIndex)} />)}
            </Segment>
        )
    }
}

