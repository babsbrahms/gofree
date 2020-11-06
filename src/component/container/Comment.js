import React, { useState, useEffect } from 'react';
import { Form, Comment, Message, Icon, Button, Label } from 'semantic-ui-react';
import { serverTimestamp, addTaskComment, fetchNextTaskComment, analytics } from "../fbase"

export const CommentView = ({ comments, team, task, latestComment }) => {
    const [text, addText] = useState('');
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);
    const [nextComments, setNextComments] = useState({ lastVal: {}, comments: [] })
    const [last, setLast] = useState(false)

    useEffect(() => {
        // console.log(comments);
        if (comments.lastVal === null) {
            setLast(true)
        } else {
            setLast(false)
        }
    }, [comments])


    const addComment = () => {
        if (text) {

            const data = {
                "message": text,
                "taskId": task.id,
                "user": { name:  team.name, uid: team.userId, photoUrl: team.photoUrl },
                "projectId": task.projectId,
                "createdAt": serverTimestamp(),
                "workspaceId": team.workspaceId
            }
            setError('')
            addText('')
            analytics.logEvent("add_comment")
            addTaskComment(data, task, team)
            .then(() => {
                
            })
            .catch(err => {
                setError(err.message)
            })
        }
    }

    const next = () => {
        let last = nextComments.comments.length > 0 ? nextComments.lastVal : comments.lastVal
        // console.log("last::: ", last);
        if (!!last) {
            setLoading(true)
            fetchNextTaskComment(task.id, last, (res) => {
                // console.log("res: ", res);
                setLoading(false)
                setNextComments({ lastVal: res.lastVal, comments: [...nextComments.comments, ...res.comments] })
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
            <Label>
                <Icon name="info circle" />  Comments are realtime, hence they work like chat messaging
            </Label>
            <Form>
                <Form.Input value={text} onChange={(e, { value}) => addText(value)} placeholder='add comment' action>  
                    <input />
                    <Button color={'teal'} onClick={() => addComment()}><Icon name="add"/> Comment </Button>
                </Form.Input>
                {/* <Form.TextArea value={text} onChange={(e, { value}) => addText(value)}></Form.TextArea>
                <Form.Button type="submit" color='teal' basic onClick={() => addComment()}>
                    Add Comment
                </Form.Button> */}
            </Form>
            <div style={{ maxHeight: 200, overflowY: 'auto', padding: '3px'}}>
            <Comment.Group>
                {latestComment.map((comment, i) => (
                    <Comment key={`comment-${i}`}>
                        <Comment.Avatar src={comment.user.photoUrl} />
                        <Comment.Content>
                            <Comment.Author as='a'>{comment.user.name}</Comment.Author>
                            <Comment.Metadata>
                            <div>{comment.createdAt ? new Date(comment.createdAt.seconds * 1000 + comment.createdAt.nanoseconds/1000000).toLocaleString() : ""}</div>
                            </Comment.Metadata>
                            <Comment.Text>{comment.message}</Comment.Text>
                        </Comment.Content>
                        <Comment.Actions>
                            <Comment.Action></Comment.Action>
                        </Comment.Actions>
                    </Comment>
                ))} 
                {comments.comments.map((comment, i) => (
                    <Comment key={`comment-${i}`}>
                        <Comment.Avatar src={comment.user.photoUrl} />
                        <Comment.Content>
                            <Comment.Author as='a'>{comment.user.name}</Comment.Author>
                            <Comment.Metadata>
                            <div>{comment.createdAt ? new Date(comment.createdAt.seconds * 1000 + comment.createdAt.nanoseconds/1000000).toLocaleString() : ""}</div>
                            </Comment.Metadata>
                            <Comment.Text>{comment.message}</Comment.Text>
                        </Comment.Content>
                        <Comment.Actions>
                            <Comment.Action></Comment.Action>
                        </Comment.Actions>
                    </Comment>
                ))} 
                {nextComments.comments.map((comment, i) => (
                    <Comment key={`comment-${i}`}>
                        <Comment.Avatar src={comment.user.photoUrl} />
                        <Comment.Content>
                            <Comment.Author as='a'>{comment.user.name}</Comment.Author>
                            <Comment.Metadata>
                            <div>{comment.createdAt ? new Date(comment.createdAt.seconds * 1000 + comment.createdAt.nanoseconds/1000000).toLocaleString() : ""}</div>
                            </Comment.Metadata>
                            <Comment.Text>{comment.message}</Comment.Text>
                        </Comment.Content>
                        <Comment.Actions>
                            <Comment.Action></Comment.Action>
                        </Comment.Actions>
                    </Comment>
                ))} 
                {(!last) && (<Button size="mini" disabled={loading} loading={loading} as="a" onClick={() => next()}>Get More Comments</Button>)}
            </Comment.Group>
            </div>
        </div>
    )
}
