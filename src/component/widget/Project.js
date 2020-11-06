import React, { Component, createRef } from 'react'
import { Card, Icon, Search, Segment, Header, Divider, Feed, Modal, Button,  Sidebar, Label, Dimmer, Popup, Portal, Loader, Image, Dropdown, Form, Confirm, Message } from 'semantic-ui-react';
import styles from '../../styles';
import TaskCard from '../container/TaskCard'
import ProjectView  from '../container/ProjectView'
import TaskView from "../container/TaskView";
import { KanbanCard, KanbanColumn } from "../container/Kanban";
import TagView from "../container/TagView";
import AssignTeam from "../container/AssignTeam";
import ScheduleTask from '../container/ScheduleTask';
import { serverTimestamp, getADoc, fetchSomeprojectLogs, fetchAllproject, fetchDeptproject, fetchAllTasks, commitNewTask, commitTaskDelete, commitTaskStatus, deleteproject, analytics } from '../fbase'
import { widgetDescription } from "../../utils/resources";

export default class Project extends Component {
    constructor (props) {
        super(props);

        this.state = {
            portalOpen: false,
            openConfirm: false,
            suggestedStatus: "",
            openModal: false,
            modalType: '',
            visible: false,
            fetchingproject: false,
            fetchingLog: false,
            fetchingTasks: false,
            fetchingLogTask: false,
            idea: '',
            selectedproject: {},
            projects: [],
            tasks: [],
            logs: [],
            data: {},
            selectedLogIds: [], // projectids to fetch logs
            logCouter: 0,
            errors: {},
            tagData: {
                open: false,
                status: "",
                tag: ""
            },
            search: {
                loading: false,
                results: [],
                value: '',       
            },
            columns: {

            }
        }
        this.kanbanDiv = createRef(null)
    }

    
    componentDidUpdate(prevProps) {
        if (prevProps.rolePermission.control !== this.props.rolePermission.control) {
            if (this.unsubscribe) {
                this.unsubscribe() 
            }
            this.getproject()
        }
    }
    
    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe() 
        }

        if (this.unlog) {
            this.unlog() 
        }

        if (this.unTask) {
            this.unTask()
        }
    }
    
    decideFetch = () => {
        if (!this.unsubscribe) {
            this.setState({ fetchingproject: true }, () => {
                this.getproject()
            })
        }
    }

    fetchLog = (ids) => {
        if (ids.length > 10) {
            this.setState({ errors: { ...this.state.errors, general: 'You cannot watch more than 10 projects at a time'  }})
        } else if (ids.length === 0) {
            if (this.unlog) {
                this.unlog()
            }
                
            this.setState({ selectedLogIds: ids, logs: [] })
        } else { 
            if (this.unlog) { 
                this.unlog()
            }
            this.setState({ selectedLogIds: ids }, () => {
                this.unlog = fetchSomeprojectLogs(ids, (res) => {
                    const { logCouter, logs } = this.state;
                    let counter = 0;
                    if (logs.length === 0) {
                        counter = 0;
                    } else {
                        counter = logCouter > 20? logCouter : (logCouter + 1)
                    }
                    this.setState({ fetchingLog: false, logs: res, logCouter: counter  })
                }, (err) => {
                    // console.log(err);
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            })
        }
    }

    getproject = () => {
        const { team, rolePermission } = this.props;
        if (rolePermission.control === 'multiple') {
            this.unsubscribe = fetchAllproject(team.workspaceId, (res) => {
                this.setState({ fetchingproject: false, projects: res }, () => {
                    this.watchproject()
                })
            }, (err) => {
                this.setState({ errors: { ...this.state.errors, general:  err.message }})
            })
        } else {
            this.unsubscribe = fetchDeptproject(team.workspaceId, team.departmentId, (res) => {
                this.setState({ fetchingproject: false, projects: res }, () => {
                    this.watchproject()
                })
            }, (err) => {
                // console.log(err);
                this.setState({ errors: { ...this.state.errors, general:  err.message }})
            })
        }
    }

    fetchTasks = () => {
        const { selectedproject } = this.state;
        if (this.unTask) {
            this.unTask()
        }
        this.setState({ fetchingTasks: true }, () => {
            this.unTask = fetchAllTasks(selectedproject.id, (res) => {
                let columns = {
                    "backlog": {
                        name: "Backlog",
                        items: []
                    },
                    "todo": {
                        name: "Todo",
                        items: []
                    },
                    "inProgress": {
                        name: "In Progress",
                        items: []
                    },
                    "done": {
                        name: "Done",
                        items: []
                    }
                };
            
                res.filter(task => {
                    columns[task.status].items.push(task)
                    return task
                })

                this.setState({ fetchingTasks: false, tasks: res, columns })
            }, (err) => {
                // console.log(err);
                this.setState({ errors: { ...this.state.errors, general:  err.message }})
            })
        }) 
    }

    watchproject = () => {
        const { projects, selectedproject } = this.state;
        let project = projects.find(x => x.id === selectedproject.id)

        if (project) {
            this.setState({ selectedproject: project })
        } else {
            this.setState({ selectedproject: {}, data: {} })
        }
    }

    selectproject = value => {
        const { projects } = this.state;
        let project = projects.find(x => x.id === value)
        // console.log({ project });
        if (project) {
            this.setState({ selectedproject: project, tasks: [] }, () => {
                this.fetchTasks()
            })
        }
    }

    selectStatus = (status) => this.setState({ status })
    
    setOpenModal = (open, type, data) => this.setState({ openModal: open, modalType: type || '', data: data || {} })

    setPortalOpen = (open, status, data) => this.setState({ portalOpen: open, suggestedStatus: status || '', data: data || {} })

    setVisible = val => this.setState({ visible: val, logCouter: 0 })

    addToBacklist = () => {
        const { team } = this.props;
        const { selectedproject, idea } = this.state;

        if (idea) {
            this.setState({  
                idea: '',
                errors: {}
            }, () => {
                commitNewTask({ 
                    title: idea, 
                    priority: 1, 
                    status: "backlog", 
                    createdAt: serverTimestamp(),
                    projectId: selectedproject.id,
                    projectName: selectedproject.name,
                    projectDeptIds: selectedproject.departmentIds,
                    createdBy: team.userId,
                    workspaceId: team.workspaceId,
                    tags: [],
                    teamIds: [],
                    teamRef: [],
                    deadline: "",
                    description: "",
                    teamLead: "",
                    schedule: {}

                }, team, selectedproject)
                .then(() => {
                    analytics.logEvent("create_task", {
                        source: "input"
                    })
                }).catch(err => {
                    this.setState({ errors: { ...this.state.errors, general: err.message }})
                })
                if (this.kanbanDiv.current) {
                    this.kanbanDiv.current.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "smooth"
                    })
                }
            })
        } else {
            this.setState({ errors: { ...this.state.errors, taskInput:  "Add Task Title" }})
        }
    }


    changeTaskStatus = (task, status) =>  {
        const { team } = this.props;
        const { selectedproject } = this.state;

        if ((status !== 'backlog') && task.teamIds.length === 0) {
            this.setPortalOpen(true, status, task)
        } else {
            if (task.status !== status) {
                commitTaskStatus(task, team, selectedproject, status)
            }
        }

    }

    openConfirmation = (data) => this.setState({ openConfirm: !!data.id? true : false, data: data || {} })

    closeConfirmation = (approve) => this.setState({ openConfirm: false }, () => {
        if (approve) {
            if (this.state.data.title) {
                this.deleteTask(this.state.data)  
            } else {
                this.deleteproject(this.state.data)
            }
            
        }
    })

    deleteTask = (task) => {
        const { team } = this.props;
        const { selectedproject } = this.state;

        commitTaskDelete(task, team, selectedproject)
        .then(() => {
            
        })
        .catch(err => {
            this.setState({ errors: { ...this.state.errors, general: err.message }})
        }) 
    }

    deleteproject = (project) => {
        deleteproject(project.id)
        .then(() => {
            this.setState({ selectproject: {}, data: {} })
        })
        .catch(err => {
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }

    handleSearchChange = (value) => {
        const { tasks } = this.state;
        this.setState({ search: { ...this.state.search, value, loading: true, results: [] } })
        let results = tasks.filter(x => x.title.toLowerCase().includes(value.toLowerCase())).map(d => ({ id: d.id, title: d.title, description: d.description }))
        // console.log({ value, results });
        this.setState({ search: { ...this.state.search, value, loading: false, results } })
    }

    selectSearchResult = (data) => {
        const { tasks } = this.state;
        let task = tasks.find(x => x.id === data.result.id);
        if (task) {
            this.setOpenModal(true, 'taskView', task)
        }
    }

    moveToCol = (id, status) => {
        const { tasks } = this.state;
        let task = tasks.find(x => x.id === id);
            
        if (task) {
            this.changeTaskStatus(task, status)  
        }   
    }

    selectTaskLog = (id) => {
        const { tasks } = this.state;
        this.setState({ fetchingLogTask: true }, () => {
            let task = tasks.find(x => x.id === id)
            if (task) {
                this.setState({ fetchingLogTask: false })
                this.setOpenModal(true, 'taskView', task)
            } else {
                getADoc('task', id, (res) => {
                    if (res !== null) {
                        this.setState({ fetchingLogTask: false }, () => {
                            this.setOpenModal(true, 'taskView', res) 
                        })
                        
                    } else {
                        this.setState({ 
                            errors: { ...this.state.errors, general: 'Task not found!!!' },
                            fetchingLogTask: false
                        })
                    }
                }, (err) => {
                    this.setState({ 
                        errors: { ...this.state.errors, general: err.message },
                        fetchingLogTask: false
                    })
                })
            }
        })

    }

    render() {
        const { selectedLogIds , openConfirm, openModal, visible, fetchingproject, fetchingLog, fetchingTasks, projects, logs, 
            tasks, data, selectedproject, modalType, search, errors, tagData, idea, columns, portalOpen, suggestedStatus, logCouter, fetchingLogTask } = this.state;
        const { team, rolePermission } = this.props;

        return (
            <div>
            <Confirm
                open={openConfirm}
                content={`Are you sure you want to delete this ${data.title? 'task' : 'project'}`}
                onCancel={() => this.closeConfirmation(false)}
                onConfirm={() => this.closeConfirmation(true)}
            />
            <Segment>
                <Header as='h3'>
                    <Header.Content>
                        Project 
                        <Popup trigger={<Icon link name='key' />}>
                            <Popup.Header>Permission</Popup.Header>
                            <Popup.Content>
                                {(rolePermission.control === 'single') && (
                                    <p>You can manage project(s) for your department.</p>
                                )}

                                {(rolePermission.control === 'multiple') && (
                                    <p>You can manage project(s) for multiple departments.</p>
                                )}
                            </Popup.Content>
                        </Popup>
                    </Header.Content>
                    
                    <Header.Subheader>
                        {widgetDescription.project}
                    </Header.Subheader>
                </Header>

                <div style={styles.betweenStart}>
                    <Dropdown
                        placeholder='Select project'
                        search
                        selection
                        button
                        value=""
                        options={projects.map(x => ({ key: x.id, value: x.id, text: x.name }))}
                        loading={fetchingproject}
                        onClick={() => this.decideFetch()}
                        onChange={(e, { value }) => this.selectproject(value)}
                    />
                    <Button.Group size='mini' color='teal'>
                        <Button onClick={() => this.setOpenModal(true, 'projectView')}><Icon inverted name='add'/></Button>
                        <Dropdown
                        className='button icon'
                        floating
                        disabled={!selectedproject.id}
                        >
                            <Dropdown.Menu>
                                <Dropdown.Item icon="edit" onClick={() => this.setOpenModal(true, 'projectView', selectedproject)}>Edit project</Dropdown.Item>
                                <Dropdown.Item icon="delete" onClick={() => this.openConfirmation(selectedproject)}>Delete project</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Button.Group>
                </div>
                
                {(!selectedproject.id) && (
                <Header as='h5' textAlign="center">
                    Select or create a new project
                </Header>)}
                {(!!errors.general) && (
                <Message 
                    error 
                    content={errors.general} 
                    onDismiss={() => this.setState({ errors: { ...errors, general: "" }})}
                    compact
                    size="small"
                />)}
                <Divider />
                <Card.Group itemsPerRow="2">
                <Sidebar.Pushable as={Segment}>
                    <Sidebar
                        as={Card}
                        animation='overlay'
                        icon='labeled'
                        // inverted
                        onHide={() => this.setVisible(false)}
                        // vertical
                        visible={visible}
                        width='wide'
                    >   
                     <div style={{ height: '100%', width: '100%', overflowY: 'hidden'}}>
                        <div style={styles.cardHead}>
                            <div style={styles.betweenStart}>
                                <Card.Header as='h3'>Project History</Card.Header>
                                <Icon name="window close" size="large" color="red" onClick={() => this.setVisible(false)} />
                            </div>
                            <Dropdown
                                // icon="settings"
                                placeholder='Select project(s) to watch'
                                fluid
                                multiple
                                search
                                selection
                                value={selectedLogIds}
                                onChange={(e, data) => this.fetchLog(data.value)}
                                options={projects.map(x => ({ key: x.id, value: x.id, text: x.name }))}
                                loading={fetchingproject}
                                onClick={() => this.decideFetch()}
                            />
                            {(fetchingLog || fetchingLogTask) && (
                                <Segment>
                                    <Dimmer active inverted>
                                        <Loader inverted />
                                    </Dimmer>
    
                                    <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                                </Segment>
                            )}
                        </div>
                        <Divider />
                        <div style={{ overflowY: 'scroll', height: '80%', padding: '3px' }}>
                            {(logs.length === 0) && (
                                <Card.Meta textAlign='center'>
                                    <b>no task history</b>
                                </Card.Meta>
                            )}
                            <Feed>
                                {logs.map((log) => (
                                    <div key={log.id}>
                                        <Feed.Event as="a" onClick={() => this.selectTaskLog(log.taskId)}
                                            date={log.createdAt ? new Date(log.createdAt.seconds * 1000 + log.createdAt.nanoseconds/1000000).toLocaleString() : ""}
                                            summary={log.taskTitle}
                                            extraText={log.action}
                                            meta={log.projectName}
                                        />
                                        <Divider />
                                    </div>
                                ))}
                            </Feed>
                        </div>
                        
                    </div>
                    </Sidebar>

                    <Sidebar.Pusher dimmed={visible}>
                        {(fetchingTasks) && (
                        <Segment>
                            <Dimmer active inverted>
                                <Loader inverted />
                            </Dimmer>

                            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                        </Segment>)}
                        
                        {(selectedproject.id) && (<div>
                            <div style={styles.between}>
                                <Header>
                                    <Header.Content>{selectedproject.name} <Icon name='add' color='teal' onClick={() => this.setOpenModal(true, 'taskView')}/></Header.Content>
                                    {(selectedproject.description) &&(
                                    <Header.Subheader>
                                        {selectedproject.description.slice(0,50)}
                                        {selectedproject.description.length > 50? 
                                            <Popup 
                                                trigger={
                                                    <Label basic size="tiny">
                                                        ...
                                                    </Label>
                                                }
                                                content={selectedproject.description}
                                            /> 
                                            : 
                                            ""}
                                    </Header.Subheader>)}
                                </Header>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
                                    <Search
                                        loading={search.loading}
                                        onResultSelect={(e, data) => this.selectSearchResult(data)}
                                        onSearchChange={(e, { value }) => this.handleSearchChange(value)}
                                        results={search.results}
                                        value={search.value}
                                    /> 
                                    
                                    <Label image as='a' color='teal' onClick={() => this.setVisible(true)}>
                                        <Icon inverted name='angle double right' />
                                            project history
                                            <Label.Detail>
                                                {logCouter}{logCouter > 20 ? "+": ""}
                                            </Label.Detail>
                                    </Label>
                                </div>
                            </div>
                            <Divider />
                                <Label color="grey">
                                    <p>
                                        <Icon inverted color="teal" name="info" />
                                        Create tasks with input at the bottom of this widget (fast) or use add icon next to this project name (Detailed)
                                    </p>

                                    {(tasks.length > 0) && (
                                        <p>
                                            <Icon inverted color="teal" name="info" />
                                            Move the tasks below to the appropriate progress level by dragging and dropping. On mobile, use the status dropdown on the task
                                        </p>
                                    )}
                                </Label>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: '100%', height: '100%' }}>
                                <div ref={this.kanbanDiv} style={{ display: "flex", justifyContent: "flex-start", width: "100%", overflowX: 'auto' }}>
                                    
                                    {Object.entries(columns).map(([columnId, column]) => ( 
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center"
                                            }}
                                            key={columnId}
                                        >
                                            <h2>{column.name}</h2>
                                            <div style={{ margin: 8 }}>
                                                <KanbanColumn changeCol={(id) => this.moveToCol(id, columnId)}>
                                                    {column.items.map((task, index) => 
                                                        <KanbanCard id={task.id} key={task.id}>
                                                            <TaskCard
                                                                key={task.id} 
                                                                data={task}
                                                                userId={team.userId}
                                                                access
                                                                changeStatus={(data, status) => this.changeTaskStatus(data, status)} 
                                                                open={data => this.setOpenModal(true, 'taskView', data)}
                                                                openTag={(tag, status) => this.setState({ tagData: { open: true, status: status, tag: tag } })}
                                                                deleteTask={(task) => this.deleteTask(task)} 
                                                                userScheduleTask={(data) => this.setOpenModal(true, 'schedule', data)}
                                                            />
                                                        </KanbanCard>
                                                    )}
                                                </KanbanColumn>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Form>
                                    <Form.Input value={idea} error={!!errors.taskInput} onChange={(e, data) => this.setState({ idea: e.target.value })} placeholder='Add task to project'  maxLength={120} action>  
                                        <input />
                                        <Button color={'teal'} onClick={() => this.addToBacklist()}><Icon name="add"/> Add</Button>
                                    </Form.Input> 
                                </Form>
                            </div>
                        </div>)}



                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </Card.Group>
            </Segment>

            <Modal
                onClose={() => this.setOpenModal(false)}
                open={openModal}
                closeIcon
                dimmer="inverted"
                // size="fullscreen" 
            >
                <Modal.Header> {data.id? '' : "Create" } {modalType === 'projectView'? "Project" : 'Task'} </Modal.Header>
                <Modal.Content scrolling>
                    {(modalType === 'projectView') && 
                    <ProjectView 
                        pickProject={(id) => this.selectproject(id)}
                        selectedproject={data} 
                        team={team} 
                        permission={rolePermission.control}
                        close={() => this.setOpenModal(false)} 
                    /> }

                    {(modalType === 'taskView') && 
                    <TaskView
                        access 
                        task={data} 
                        team={team} 
                        project={selectedproject} 
                        close={() => this.setOpenModal(false)}
                    />}

                    {(modalType === 'schedule') && (
                        <ScheduleTask data={data} team={team} close={() => this.setOpenModal(false)}/>
                    )}
                </Modal.Content>
            </Modal>
            <Portal onClose={() => this.setPortalOpen(false)} open={portalOpen}>
                <Segment
                style={{
                    left: '5%',
                    position: 'fixed',
                    top: '20%',
                    width: "90%",
                    zIndex: 1000,
                }}
                >
                    <Header>
                        One or more team members are required for tasks that are not in backlog
                    </Header>
                    <AssignTeam 
                        task={data}
                        close={() => this.setPortalOpen(false)}
                        status={suggestedStatus}
                        project={selectedproject}
                        team={team}
                    />
                </Segment>
            </Portal>

            <TagView 
                close={() => this.setState({ tagData: { open: false, status: '', tag: '' }})}
                tagData={tagData}
                title={`${tagData.tag} tag`}
            >
                {tasks.filter(x => x.tags.includes(tagData.tag.toLowerCase().trim())).map(task => (
                    <TaskCard
                        key={task.id} 
                        data={task}
                        userId={team.userId}
                        access
                        changeStatus={(data, status) => this.changeTaskStatus(data, status)} 
                        open={data => this.setOpenModal(true, 'taskView', data)}
                        openTag={(tag, status) => this.setState({ tagData: { open: true, status: status, tag: tag } })}
                        deleteTask={(task) => this.deleteTask(task)} 
                        userScheduleTask={(data) => this.setOpenModal(true, 'schedule', data)}
                    />
                ))}
            </TagView>
            </div>
        )
    }
}
