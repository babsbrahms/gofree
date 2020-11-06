import React, {useState} from 'react';
import { Header, Icon, Statistic, Message, List, Button, Step, Popup } from 'semantic-ui-react'
import RoleView from "./RoleView";

const Onboarding = ({ close, role }) => {
    const [index, setIndex] = useState(0)
    return (
        <div>
            <Popup
                trigger={
                    <Button basic inverted color="red" size="small" floated="right">
                        <Icon name="close" /> exit
                    </Button>
                }
                on="click"
                position="bottom right"
            >
                <Popup.Content>
                    You can revisit this introductory page with the button at the bottom of your dashboard.
                </Popup.Content>
                <Popup.Content>
                    <Button fluid onClick={close}>
                        EXIT
                    </Button>
                </Popup.Content>
            </Popup>

            <Step.Group widths={4}>
                <Step active={index === 0} disabled={false}>
                    <Step.Content>
                        <Step.Title>INTRO</Step.Title>
                    </Step.Content>
                </Step>

                <Step active={index === 1} disabled={index < 1}>
                    <Step.Content>
                        <Step.Title>TASK</Step.Title>
                    </Step.Content>
                </Step>

                <Step active={index === 2} disabled={index < 2}>
                    <Step.Content>
                        <Step.Title>ROLE</Step.Title>
                    </Step.Content>
                </Step>

                
                <Step active={index === 3} disabled={index < 3}>
                    <Step.Content>
                        <Step.Title>HINTS</Step.Title>
                    </Step.Content>
                </Step>
            </Step.Group>
            {(index === 0) && (
            <div >
                <Header inverted icon textAlign="center">
                    <Icon size="tiny" name='trophy' />
                    Welcome to  a new workspace
                    <Header.Subheader>
                        Tietoon uses widgets to share information between team members. 
                        The table below summaries your role's widgets and their permissions.                    
                    </Header.Subheader>
                </Header>

                <RoleView role={role}/>
            </div> )} 

            {(index === 1) && (<div>
                <Header textAlign="center" inverted>
                    <Header.Content>
                        You will use the kanban approach to manage tasks: It involves moving a task from the backlog status to the done status.
                    </Header.Content>
                </Header>
                
                <Statistic.Group inverted widths="7">
                    <Statistic label='' value='BACKLOG' text />
                    <Statistic>
                        <Statistic.Value>
                            <Icon name='arrow right' />
                        </Statistic.Value>
                    </Statistic>
                    <Statistic label='' value='TODO' text />
                    <Statistic>
                        <Statistic.Value>
                            <Icon name='arrow right' />
                        </Statistic.Value>
                    </Statistic>
                    <Statistic label='' value='IN PROGRESS' text />

                    <Statistic>
                        <Statistic.Value>
                            <Icon name='arrow right' />
                        </Statistic.Value>
                    </Statistic>

                    <Statistic label='' value='DONE' text />
                </Statistic.Group>
            </div>)}   

            {(index === 2) && (<div>
                <Header textAlign="center" inverted>
                    A role has a title and a group of widgets with configurable permissions.
                </Header>
                <Header textAlign="center" inverted>
                    The administration widget can be used to assign widgets to a team member's role. Widget's permission can further be configured to highlight or complement the role.                
                </Header>
                <Message warning>
                    <Icon name="exclamation" color="yellow" /> The same widget might have different functions because of the user's permission for the widget which is defined in his/her role. i.e. you might be able to review suggestions while other team members cannot. Also, if a widget is not assigned you, it will not appear on your dashboard. It all depends on the user's role.
                </Message>
                {/* <Message info>
                    <Icon name="exclamation triangle" />
                    For workspace owners: In case you remove your administrative widget or reduce your permission. You can reset it with admin mode. It will appear at the top of the screen when needed.                
                </Message> */}
            </div>)}

            {(index === 3) && (<div>
                <List size="big" celled>
                    <List.Content>
                        <List.Icon name="key" />
                        <List.Description>
                            This icon reveals your permission for a widget
                        </List.Description>
                    </List.Content>

                    <List.Content>
                        <List.Icon name="info" />
                        <List.Description>
                            This icon describes how to use a widget
                        </List.Description>
                    </List.Content>


                    <List.Content>
                        <List.Icon name="angle double right" />
                        <List.Description>
                        This icon reveals the tasks history
                        </List.Description>
                    </List.Content>
                </List>

                <Header textAlign="center" inverted>
                    You are good to go. Hope you enjoy the experience!!!
                    <Header.Subheader>
                        You can revisit this introductory page with the button at the bottom of your dashboard.
                    </Header.Subheader>
                </Header>
            </div>)}

            <br />
            <br />
            <Button.Group fluid color="green">
                {(index !== 0) && (<Button content='Previous' icon='left arrow' disabled={index === 0} labelPosition='left' onClick={() => setIndex(index - 1)} />)}
                {(index !== 3) && (<Button content='Next' icon='right arrow' labelPosition='right' disabled={index === 3} onClick={() => setIndex(index + 1)} />)}
                {(index === 3) &&(<Button content='Got It' icon='thumbs up' labelPosition='right' onClick={() => close()} />)}
            </Button.Group>
        </div>
    )
}

export default Onboarding
