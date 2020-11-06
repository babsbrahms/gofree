import React, { Component } from 'react'
import { Card, Feed, Divider, Segment, Select, Sidebar, Icon, Dropdown, Label, Dimmer, Loader, Popup, Image, Modal, Message, Header  } from 'semantic-ui-react';
import styles from '../../styles';
import TaskCard  from '../container/TaskCard';
import TaskView from '../container/TaskView'
import TagView from '../container/TagView';
import { fetchMyStartedTasks, fetchMyAssignedTasks, getADoc, fetchMyLog, commitTaskStatus, fetchMyCompletedTasks, commitTaskDelete, analytics } from '../fbase'
import ScheduleTask from '../container/ScheduleTask';
import { widgetDescription } from "../../utils/resources";

// const options = [
//     { key: 'ad', value: 'past', text: 'Past' },
//     { key: 'af', value: 'today', text: 'Next 24 hours' },
//     { key: 'ax', value: 'week', text: 'Next 7 days' },
//     { key: 'al', value: 'month', text: 'Next 28 days' }
// ]

const filter = [
    { key: 'add', value: 'priority', text: 'Priority' },
    { key: 'adf', value: 'deadline', text: 'Deadline' },
    { key: 'aex', value: 'schedule', text: 'schedule' },
]
export default class MyTask extends Component {
    constructor(props){
        super(props)

        this.state = {
            visible: false,
            width: 0,
            fetchingStarted: true,
            fetchingAssigned: true,
            fetchingDone: false,
            fetchingLog: true,
            fetchingLogTask: false,
            constrain: 'priority',
            tasks: [],
            logs: [],
            displayList: [],
            inProgressTasks: [],
            doneTasks: [],
            logCouter: 0,
            openModal: "",
            modalType: "", 
            logType: "",
            data: {},
            errors: {},
            tagData: {
                open: false,
                status: "",
                tag: ""
            },
            pastDue: {
                deadline: 0,
                schedule: 0
            }
        }

    }

    componentDidMount() {
        this.getAssignedTask();
        this.getStartedTask()
        // this.fetchLog()
    }

    componentWillUnmount() {
        if (this.unAssign) {
            this.unAssign() 
        }
        if (this.unlog) {
            this.unlog() 
        }

        if (this.unstart) {
            this.unstart()
        }
            
        if (this.unDone) {
            this.unDone()
        }
    }

    setVisible = val => this.setState({ visible: val, logCouter: 0 }, () => {
        if (!this.unlog) {
            this.fetchLog()
        }
        if (val) {
            analytics.logEvent("open_task_log")
        }
    })
    
    getAssignedTask = () => {
        const { team } = this.props;
        this.unAssign = fetchMyAssignedTasks(team.workspaceId, team.userId, (res) => {
            this.setState({ fetchingAssigned: false, tasks: res }, () => {
                this.filterList();
                this.calcPastDue()
            
            })
        }, (err) => {
            // console.log(err);
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }


    getStartedTask = () => {
        const { team } = this.props;
        this.unstart = fetchMyStartedTasks(team.workspaceId, team.userId, (res) => {
            this.setState({ fetchingStarted: false, inProgressTasks: res })
        }, (err) => {
            // console.log(err);
            this.setState({ errors: { ...this.state.errors, general:  err.message }})
        })
    }

    getCompletedTask = () => {
        const { team } = this.props;
        if (!this.unDone) {
            this.setState({ fetchingDone: true }, () =>  {
                this.unDone = fetchMyCompletedTasks(team.workspaceId, team.userId, (res) => {
                    this.setState({ fetchingDone: false, doneTasks: res })
                }, (err) => {
                    // console.log(err);
                    this.setState({ errors: { ...this.state.errors, general:  err.message }})
                })
            })
        }
    }

    fetchLog = () => {
        const { team } = this.props;
        if (!this.unlog) {
            this.unlog = fetchMyLog(team.workspaceId, team.userId, (res) => {
                const { logCouter, logs } = this.state;
                let counter = 0;
                if (logs.length === 0) {
                    counter = 0;
                } else {
                    counter = logCouter > 20? logCouter : (logCouter + 1)
                }
                this.setState({ fetchingLog: false, logs: res, logCouter: counter })
            }, (err) => {
                // console.log(err);
                this.setState({ errors: { ...this.state.errors, general:  err.message }})
            })
        }
    }

    calcDuration = (time) => {
        if ((new Date(time).getTime() - new Date().getTime()) <= 0) {
            return 'past' 
        } else if (( (new Date(time).getTime() - new Date().getTime()) > 0 ) && ( (new Date(time).getTime() - new Date().getTime()) <= 86400000) ) {
            return 'today'  
        } else if (( (new Date(time).getTime() - new Date().getTime()) > 86400000 ) && ((new Date(time).getTime() - new Date().getTime()) <= 604800000) ) {
            return 'week'  
        } else if (( (new Date(time).getTime() - new Date().getTime()) > 604800000) && ((new Date(time).getTime() - new Date().getTime()) <= 2419200000) ) {
            return 'month'
        } else {
            return 'future'
        }
    }
        
    filterList = () => {
        const { constrain, tasks } = this.state;
        const { team } = this.props;
        let list = [
            {
                id: 'past',
                title: "Past",
                items: []
            },
            {
                id: 'today',
                title: "Next 24 hours",
                items: []
            },
            {
                id: 'week',
                title: 'Next 7 days',
                items: []
            },
            {
                id: 'month',
                title: 'Next 28 days',
                items: []
            },
            {
                id: 'future',
                title: "Future",
                items: []
            }
        ];

        if (constrain === 'deadline') {
            tasks.filter(task => {
                if (task.deadline) return task;
            }).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .filter(task => {
                let duration = this.calcDuration(task.deadline)
                let index = list.findIndex(x => x.id === duration)
                list[index].items.push(task)
                return task
            })

        } else if (constrain === 'schedule') {
            tasks.filter(task => {
                if (task.schedule && task.schedule[team.userId]) return task;
            }).sort((a,b) => new Date(a.schedule[team.userId]).getTime() - new Date(b.schedule[team.userId]).getTime())
            .filter(task => {
                let duration = this.calcDuration(task.schedule[team.userId])
                let index = list.findIndex(x => x.id === duration)
                list[index].items.push(task)
                return task
            })
            
    
        } else {
            list = [
                {
                    id: 2,
                    title: "High",
                    items: []
                },
                {
                    id: 1,
                    title: "Medium",
                    items: []
                },
                {
                    id: 0,
                    title: "Low",
                    items: []
                },
            ];

            tasks.filter(task => {
                let index = list.findIndex(x => x.id === task.priority)
                list[index].items.push(task)
                return task
            })
        }
        analytics.logEvent("filter_task", {
            filter
        })
        this.setState({ displayList: list })
    }

    calcPastDue = () => {
        const { tasks } = this.state;
        const { team } = this.props;

        let pastDue = {
            deadline: 0,
            schedule: 0
        };
        tasks.forEach(task => {
            if (task.deadline) {
                let duration = this.calcDuration(task.deadline);
                if (duration === 'past') {
                    pastDue.deadline += 1;
                }
            }
            if (task.schedule && task.schedule[team.userId]) {
                let duration = this.calcDuration(task.schedule[team.userId])

                if (duration === 'past') {
                    pastDue.schedule += 1
                }
            }
        })

        this.setState({ pastDue })

    }

    setOpenModal = (open, type, data) => this.setState({ openModal: open, modalType: type || '', data: data || {} })

    changeConstrain = (value) => {
        this.setState({ constrain: value }, () => {
            this.filterList() 
        })
    }

    changeTaskStatus = (task, status) =>  {
        const { team } = this.props;
        if (task.status !== status) {
            commitTaskStatus(task, team, { id: task.projectId || "", name: task.projectName, departmentIds: task.projectDeptIds , }, status)
        }
    }

    
    selectDoneTask = data => {
        const { doneTasks } = this.state;
        analytics.logEvent("select_done_task")
        let task = doneTasks.find(x => x.id === data.value)
        // console.log(task);
        if (task) {
            this.setOpenModal(true, 'taskView', task)
        }   
    }

    deleteTask = (task) => {
        const { team } = this.props;

        commitTaskDelete(task, team, { id: task.projectId, name: task.projectName, departmentIds: task.projectDeptIds || [] })
        .then(() => {
            
        })
        .catch(err => {
            this.setState({ errors: { ...this.state.errors, general: err.message }})
        }) 
    }


    selectTaskLog = (id) => {
        const { doneTasks, tasks, inProgressTasks } = this.state;
        analytics.logEvent("select_task_log")
        this.setState({ fetchingLogTask: true }, () => {
            let task = doneTasks.concat(tasks).concat(inProgressTasks).find(x => x.id === id)
            if (task) {
                this.setState({ fetchingLogTask: false }, () => {
                    this.setOpenModal(true, 'taskView', task)
                })
                
            } else {
                getADoc('task', id, (res) => {
                    if (res !== null) {
                        this.setState({ fetchingLogTask: false })
                        this.setOpenModal(true, 'taskView', res) 
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
    
    setLogType = (type) => this.setState({ logType: type })


    render() {
        const { visible, pastDue, tasks, fetchingAssigned, fetchingStarted, errors, tagData, logCouter, fetchingLogTask, logType,
             constrain, logs, fetchingLog, displayList, inProgressTasks, openModal, modalType, data, fetchingDone, doneTasks } = this.state;
        const { team, access } = this.props;
        
        return (
        <div>
            <Segment>
                <div style={styles.betweenStart}>
                    <div>
                        <Header>
                            <Header.Content>
                                My Task   
                                <Popup trigger={<Icon  link name='key' />}>
                                    <Popup.Header>Permission</Popup.Header>
                                    <Popup.Content>
                                        You have permission to manage tasks assigned to you {access? "fully" : "partially"}.
                                    </Popup.Content>
                                    <Popup.Content>
                                        My task widget permission depends on your role widgets having the project widget. Project widget grants users permission to manage tasks, hence, they can perform task operations like delete, assign, and change deadline.
                                    </Popup.Content>
                                </Popup>
                            </Header.Content>
                            <Header.Subheader>
                                {widgetDescription.task}
                            </Header.Subheader>
                        </Header>


                        <Label color="teal" as="a" onClick={() => this.setVisible(true)}>
                            <Icon name='angle double right' />
                            task history
                            <Label.Detail>
                                {logCouter}{logCouter > 20 ? "+": ""}
                            </Label.Detail>
                        </Label>
                    </div>

                        <Select
                            key={'done'}
                            text="Done Tasks"
                            search
                            selection
                            value=""
                            options={doneTasks.map(x => ({ key: x.id, value: x.id, text: x.title }))}
                            loading={fetchingDone}
                            onClick={() => this.getCompletedTask()}
                            onChange={(e, data) => this.selectDoneTask(data)}
                        />
                </div>
                <br />
                <Label color="grey">
                    <p>
                    <Icon inverted color="teal" name="info" />
                    {((tasks.length === 0) && (inProgressTasks.length === 0))?     
                        `You don't have any active task assigned to you. ${access? "You can assign tasks with the 'Project' widget" : "Task will be assigned to you with the 'Project' widget"}.`
                        :
                        "Move the tasks below to the appropriate progess level by changing the status dropdown on a task."
                    }
                    </p>

                    {((tasks.length > 0) && (
                        <p>
                            <Icon inverted color="teal" name="info" /> You can a schedule a task by pressing the  <Icon name="ellipsis vertical" /> icon on the task to reveal the option
                        </p>
                    ))}

                    {((tasks.length > 0) && (
                        <p>
                            <Icon inverted color="teal" name="info" /> Filtering todo task by priority will show all your todo tasks
                        </p>
                    ))}
                </Label>
                <br />
                {((pastDue.deadline > 0) || (pastDue.schedule > 0)) && (
                <Label>
                    {(pastDue.deadline > 0)? <b><Icon color={"red"} name="exclamation triangle"/> {pastDue.deadline} task(s) deadline is due. Filter todo tasks by deadline.</b> : "" }
                    <br />
                    {(pastDue.schedule > 0)? <b><Icon color={'yellow'} name="exclamation triangle"/> {pastDue.schedule} scheduled task(s) needs your attention. Filter todo tasks by schedule. </b> : "" }

                </Label>)}
                <Divider />
                {(!!errors.general) && (
                <Message 
                    error 
                    content={errors.general} 
                    onDismiss={() => this.setState({ errors: { ...errors, general: "" }})}
                    compact
                    size="small"
                />)}
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
                                <Card.Header as='h3'>Task History</Card.Header>
                                <Icon name="window close" size="large" color="red" onClick={() => this.setVisible(false)} />
                            </div>
                            <div style={styles.betweenStart}>
                                <Popup trigger={<Icon name="list" color={logType === ''? "teal" : "black"} onClick={() => this.setLogType("")} />} content={"all history"} />
                                
                                <Popup trigger={<Icon name="check circle" color={logType === "status"? "teal" : "black"} onClick={() => this.setLogType("status")} />} position="top center" content={"status"} />
                                
                                <Popup trigger={<Icon name="attach" color={logType === "attachment"? "teal" : "black"} onClick={() => this.setLogType("attachment")} />} position="top center" content={"attachment"} />
                                
                                <Popup trigger={<Icon name="clipboard check" color={logType === "checklist"? "teal" : "black"} onClick={() => this.setLogType("checklist")}/>} position="top center" content={"checklist"} />
                                
                                <Popup trigger={<Icon name="comments" color={logType === 'comment'? "teal" : "black"} onClick={() => this.setLogType('comment')}/>} position="top right" content={'comment'} />
                                
                            </div>
                        </div>
                        {(fetchingLog || fetchingLogTask) && (
                            <Segment>
                                <Dimmer active inverted>
                                    <Loader inverted />
                                </Dimmer>

                                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                            </Segment>
                        )}
                        <Divider />
                        <div style={{ overflowY: 'scroll', height: '80%', padding: '3px' }}>
                            {(logs.length === 0) && (
                                <Card.Meta textAlign='center'>
                                    <b>no task history</b>
                                </Card.Meta>
                            )}
                            <Feed>
                                {logs.filter(x => {
                                    if (logType === "") {
                                        return x
                                    } else if (["attachment", "comment"].includes(logType) && x.action.includes(logType)) {
                                        return x
                                    } else if (x.key && x.key.includes(logType)) {
                                        return x
                                    }
                                }).map((log) => (
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
                            <Card.Group itemsPerRow="2">
                                <div style={{ Width: '100%', padding: '3px' }}>
                                <Card >
                                    <div style={styles.cardHead}>
                                        <Card.Header as='h3'>Task(s) Todo</Card.Header>
                                    </div>
                                    {(tasks.length > 0) && (<Card.Content>
                                        <Header as='h4'>
                                            <Header.Content>
                                                Filter by {' '}
                                                <Dropdown
                                                    inline
                                                    header='Filter Todo Task By'
                                                    defaultValue={constrain} 
                                                    options={filter} 
                                                    loading={fetchingAssigned}
                                                    onChange={(e, { value }) => this.changeConstrain(value)}
                                                />
                                            </Header.Content>
                                        </Header>
                                    </Card.Content>)}
                                    <Card.Content>
                                        <div style={{ ...styles.limit, height: (styles.limit.height + 200) }}>
                                        {(!fetchingAssigned) && (tasks.length === 0) && (
                                            <Card.Meta textAlign='center'>
                                                <b>You don't have any task todo</b>
                                                
                                            </Card.Meta>
                                        )}
                                        {(tasks.length > 0) && displayList.map((val) => (
                                            <div key={val.title}>
                                                <div style={{ textAlign: "center", backgroundColor: "#FFFFFF", width: '100%', marginTop: 9, borderBottomWidth: 2, borderBottomColor: "#CCCCCC", borderBottomStyle: 'solid' }}>
                                                    <b>{val.title}</b>
                                                </div>
                                                {val.items.map(task => (
                                                    <TaskCard 
                                                        key={task.id} 
                                                        data={task} 
                                                        access={access}
                                                        userId={team.userId}
                                                        changeStatus={(data, status) => this.changeTaskStatus(data, status)} 
                                                        open={data => this.setOpenModal(true, 'taskView', data)}
                                                        openTag={(tag, status) => this.setState({ tagData: { open: true, status: status, tag: tag } })}
                                                        deleteTask={(task) => this.deleteTask(task)}
                                                        userScheduleTask={(data) => this.setOpenModal(true, 'schedule', data)}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                        </div>
                                    </Card.Content>
                                </Card>
                                </div>


                                <div style={{ Width: '100%', padding: '3px' }}>
                                <Card>
                                    <div style={styles.cardHead}>
                                        <Card.Header as='h3'>Task(s) In Progress</Card.Header>
                                    </div>
                                    <Card.Content>
                                        <div style={{ ...styles.limit, height: (styles.limit.height + 250) }}>
                                        {(fetchingStarted) && (
                                            <Segment>
                                                <Dimmer active inverted>
                                                    <Loader inverted />
                                                </Dimmer>
                                                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                                            </Segment>
                                        )}
                                        {(!fetchingStarted) && (inProgressTasks.length === 0) && (
                                            <Card.Meta textAlign='center'>
                                                <b>You don't have any task in progress</b>
                                            </Card.Meta>
                                        )}
                                        {inProgressTasks.map(task => (
                                            <TaskCard 
                                                key={task.id} 
                                                data={task} 
                                                access={access}
                                                userId={team.userId}
                                                changeStatus={(data, status) => this.changeTaskStatus(data, status)} 
                                                open={data => this.setOpenModal(true, 'taskView', data)}
                                                openTag={(tag, status) => this.setState({ tagData: { open: true, status: status, tag: tag } })}
                                                deleteTask={(task) => this.deleteTask(task)}
                                                userScheduleTask={(data) => this.setOpenModal(true, 'schedule', data)}
                                            />
                                        ))}
                                        </div>
                                    </Card.Content>
                                </Card>
                                </div>
                            </Card.Group>
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
                <Modal.Header> {data.id? '' : "Create" } {modalType === 'taskView' ? 'task' : 'task schedule'} </Modal.Header>
                <Modal.Content scrolling>
                    {(modalType === 'taskView') && 
                        <TaskView 
                            access={access} 
                            task={data} 
                            team={team} 
                            project={{ id: data.projectId || "", name: data.projectName, departmentIds: data.projectDeptIds || [] }} 
                            close={() => this.setOpenModal(false)}
                        />}
                    {(modalType === 'schedule') && (
                        <ScheduleTask data={data} team={team} close={() => this.setOpenModal(false)}/>
                    )}
                </Modal.Content>
            </Modal>
            <TagView 
                close={() => this.setState({ tagData: { open: false, status: '', tag: '' }})}
                tagData={tagData}
                title={`${tagData.tag} tag in ${tagData.status}`}
            >
                {tagData.status === 'todo' && (
                    tasks.filter(x => x.tags.includes(tagData.tag.toLowerCase().trim())).map(task => (
                        <TaskCard 
                            key={task.id} 
                            data={task} 
                            access={access}
                            userId={team.userId}
                            changeStatus={(data, status) => this.changeTaskStatus(data, status)} 
                            open={data => this.setOpenModal(true, 'taskView', data)}
                            openTag={(tag, status) => this.setState({ tagData: { open: true, status: status, tag: tag } })}
                            deleteTask={(task) => this.deleteTask(task)}
                            userScheduleTask={(data) => this.setOpenModal(true, 'schedule', data)} 
                        />
                    ))
                )}

                {tagData.status === 'inProgress' && (
                    inProgressTasks.filter(x => x.tags.includes(tagData.tag.toLowerCase().trim())).map(task => (
                        <TaskCard 
                            key={task.id} 
                            data={task} 
                            access={access}
                            userId={team.userId}
                            changeStatus={(data, status) => this.changeTaskStatus(data, status)} 
                            open={data => this.setOpenModal(true, 'taskView', data)}
                            openTag={(tag, status) => this.setState({ tagData: { open: true, status: status, tag: tag } })}
                            deleteTask={(task) => this.deleteTask(task)}
                            userScheduleTask={(data) => this.setOpenModal(true, 'schedule', data)}
                        />
                    ))
                )} 
            </TagView>
        </div>
        )
    }
}

