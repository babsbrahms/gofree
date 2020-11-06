import React, { Component } from 'react'
import { Card, Feed, Divider, Progress, Select, Rating, Dropdown, Icon } from 'semantic-ui-react';
import styles from '../../styles';

const options = [
    { key: 'af', value: 'self', text: 'Self' },
    { key: 'ax', value: 'myDepartment', text: 'My Department' },
    { key: 'al', value: 'allDepartment', text: 'All Department' }
]

const duration = [
    { key: 'week', value: 'weekly', text: 'Weekly' },
    { key: 'month', value: 'monthly', text: 'Monthly' },
    { key: 'quarter', value: 'quarterly', text: 'Quarterly' },
    { key: 'semi', value: 'semi-annually', text: 'Semi-annually' },
    { key: 'annual', value: 'annually', text: 'Annually' }

]

const countryOptions = [
    { key: 'af', value: 'af', text: 'Afghanistan' },
    { key: 'ax', value: 'ax', text: 'Aland Islands' },
    { key: 'al', value: 'al', text: 'Albania' },
    { key: 'dz', value: 'dz', text: 'Algeria' },
    { key: 'as', value: 'as', text: 'American Samoa' },
    { key: 'ad', value: 'ad', text: 'Andorra' },
    { key: 'ao', value: 'ao', text: 'Angola' },
    { key: 'ai', value: 'ai', text: 'Anguilla' },
    { key: 'ag', value: 'ag', text: 'Antigua' },
]

export default class Performance extends Component {
    render() {
        //performance: 'Current workload, 'Time Band', 'Satifactory level', 'Review',

        return (
            <div>
                <Card>
                    <Card.Content>
                        <div style={styles.between}>
                            <Card.Header as='h3'>Performance Evaluation</Card.Header>
                            <Icon bordered inverted color='teal' name='find' />
                        </div>
                    </Card.Content>
                    <Card.Content>
                        <Select fluid placeholder='Select perfomance duration' defaultValue={'weekly'} options={duration} />
                    </Card.Content>
                    <Card.Content>
                        <Select fluid placeholder='Select sector to evaluate' defaultValue={'self'} options={options} />
                    </Card.Content>
                    <Card.Content>
                    <div style={styles.limit}>
                        <Feed>
                            <Feed.Event>
                                <Feed.Content as="a">
                                    <Feed.Summary>Task Satifaction level</Feed.Summary>
                                    <Rating icon='star' rating={3} maxRating={5} />
                                </Feed.Content>
                            </Feed.Event>
                        </Feed>

                        <Feed>
                            <Feed.Event>
                                <Feed.Content as="a">
                                    <Feed.Summary>Task Time-band</Feed.Summary>
                                    <Progress size="small" color="teal" value='3' total='5' progress='ratio' >
                                        Tasks completed before deadline
                                    </Progress>
                                </Feed.Content>
                            </Feed.Event>
                        </Feed>

                        <Feed>
                            <Feed.Event>
                                <Feed.Content as="a">
                                    <Feed.Summary>Reviews</Feed.Summary>
                                </Feed.Content>
                            </Feed.Event>
                                <Feed.Event
                                   
                                    date='21/01/2020 1:20 pm'
                                    extraText="Add workspaceion"
                                    meta="Monthly sales report"
                               
                                />

                                <Divider />
                                
                                <Feed.Event
                                    date='21/01/2020 1:20 pm'
                                    extraText="Nice job"
                                    meta="Monthly marketing report"
                                />
                        
                        </Feed>
                    </div>
                    </Card.Content>
                    <Card.Content extra>
                        <Dropdown
                            placeholder='Select performance'
                            fluid
                            search
                            selection
                            options={countryOptions}
                            loading
                        />
                    </Card.Content>
                </Card>
            </div>
        )
    }
}
