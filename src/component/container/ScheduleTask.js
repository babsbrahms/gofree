import React, { useState, useEffect } from 'react';
import { Form, Message } from "semantic-ui-react";
import { addTaskSchedule, analytics } from "../fbase";

const ScheduleTask = ({ data, team, close}) => {
    const [ready, setReady] = useState(false)
    const [error, setError] = useState('')
    const [schedule, setSchedule] = useState({
        date: '',
        loading: false
    })
    
    useEffect(() => {
        setupTaskSchedule()
    }, [])

    const setupTaskSchedule = () => {
        if (data.schedule && data.schedule[team.userId]) {
            setSchedule({...schedule, date: data.schedule[team.userId] })
            setReady(true)
        } else {
            setReady(true)
        }
    }
    
    const addSchedule = () => {
        setSchedule({...schedule, loading: true })
        addTaskSchedule(data.id, `schedule.${team.userId}`, schedule.date)
        .then(() => {
            analytics.logEvent("add_schedule")
            setError('')
            setSchedule({...schedule, loading: false, date: "" })
            close()
        })
        .catch(err => {
            setError(err.message)
            setSchedule({...schedule, loading: false })
        })
        
    }
    return (
        <div>
            {(ready) && (
            <Form>
                <Form.Field>
                    <label>Schedule task</label>
                    <input type="date" min={new Date().toISOString().split("T")[0]} name='deadline' defaultValue={schedule.date} onChange={(e) => setSchedule({ ...schedule, date: e.target.value })} placeholder='Add schedule task' />
                </Form.Field>
                <Form.Button color='teal' disabled={!schedule.date || schedule.loading} loading={schedule.loading} onClick={() => addSchedule()}>
                    Add to schedule
                </Form.Button>
                {(!!error) && (
                <Message 
                    error 
                    content={error} 
                    onDismiss={() => setError('')}
                    compact
                    size="small"
                />)}
            </Form>)}
        </div>
    )
}

export default ScheduleTask;
