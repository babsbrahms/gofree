import React, { useState, useEffect} from 'react';
import { Feed, Divider, Button, Message } from 'semantic-ui-react';
import { fetchNextTaskLogs} from "../fbase"

export const TaskLog = ({ logs, latestLog, taskId }) => {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);
    const [nextLogs, setNextLogs] = useState({ lastVal: {}, logs: [] })
    const [last, setLast] = useState(false)

    useEffect(() => {
        if (logs.lastVal === null) {
            setLast(true)
        } else {
            setLast(false)
        }
    }, [logs])

    const next = () => {
        let last = nextLogs.logs.length > 0 ? nextLogs.lastVal : logs.lastVal
        // console.log("last::: ", last);
        if (!!last) {
            setLoading(true)
            fetchNextTaskLogs(taskId, last, (res) => {
                // console.log("res: ", res);
                setLoading(false)
                setNextLogs({ lastVal: res.lastVal, logs: [...nextLogs.logs, ...res.logs] })
                if (res.lastVal === null) {
                    setLast(true)
                }
            }, (err) => {
                // console.log("err",err);
                setLoading(false)
                setError(err.message)
            })
        } else {
            setLast(true)
        }
    }

    return (
        <div>
            {(!!error) && (
            <Message 
                error 
                content={error} 
                onDismiss={() => setError('')}
                compact
                size="tiny"
            />)}

            <div style={{ maxHeight: 200, overflowY: 'auto', padding: '3px'}}>
                <Feed>
                    {latestLog.map((log, i) => (
                        <div key={`log-${i}`}>
                            <Feed.Event
                                date={log.createdAt ? new Date(log.createdAt.seconds * 1000 + log.createdAt.nanoseconds/1000000).toLocaleString() : ""}
                                summary={log.action}
                            />
                            <Divider />
                        </div>
                    ))}
                    {logs.logs.map((log, i) => (
                        <div key={`log-${i}`}>
                            <Feed.Event
                                date={log.createdAt ? new Date(log.createdAt.seconds * 1000 + log.createdAt.nanoseconds/1000000).toLocaleString() : ""}
                                summary={log.action}
                            />
                            <Divider />
                        </div>
                    ))}
                    {nextLogs.logs.map((log, i) => (
                        <div key={`log-${i}`}>
                            <Feed.Event
                                date={log.createdAt ? new Date(log.createdAt.seconds * 1000 + log.createdAt.nanoseconds/1000000).toLocaleString() : ""}
                                summary={log.action}
                            />
                            <Divider />
                        </div>
                    ))}
                    {(!last) && (<Button size="mini" disabled={loading} loading={loading} as="a" onClick={() => next()}>Get More Logs</Button>)}

                </Feed>
            </div>
        </div>
    )
}
