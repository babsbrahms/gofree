import React from 'react';
import { Segment, Icon, Header } from "semantic-ui-react"

const Error = () => {
    return (
        <div>
            <Segment>
                <Header as='h2' icon textAlign='center'>
                <Icon name='help' circular />
                <Header.Content>PAGE NOT FOUND</Header.Content>
                </Header>
            </Segment>
        </div>
    )
}

export default Error;