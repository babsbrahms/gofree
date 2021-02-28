import React from 'react'
import { Segment, List, Card, Divider} from "semantic-ui-react";
import "../css/style.css"

const Contact = () => {
    return (
        <div id="gofree-bg">
            <Segment id="gofree-topbar">
                <h1>Contact Us</h1>
            </Segment>

            <div style={{ padding: 30 }}>
                <Card.Group stackable centered itemsPerRow="2">
                    <Card link raised color="pink">
                        <Card.Content>
                            <Card.Header>Gofree Limited</Card.Header>
                        </Card.Content>
                        <Card.Content>
                            <List relaxed>
                                <List.Item>
                                    <List.Content>
                                        <List.Content>
                                        No: 724, Green Lane
                                        </List.Content>
                                    </List.Content>
                                </List.Item>

                                <List.Item>
                                    <List.Content>
                                        <List.Content>
                                        Dagenham, Essex.
                                        </List.Content>
                                    </List.Content>
                                </List.Item>


                                <List.Item>
                                    <List.Content>
                                        <List.Content>
                                        Postcode/Zip: RM8 1YX
                                        </List.Content>
                                    </List.Content>
                                </List.Item>


                                <List.Item>
                                    <List.Content>
                                        <List.Content>
                                        Tel/Fax 02085861814.
                                        </List.Content>
                                    </List.Content>
                                </List.Item>

                                <List.Item>
                                    <List.Content>
                                        <List.Content>
                                        Mobile: 07940491560
                                        </List.Content>
                                    </List.Content>
                                </List.Item>


                                <List.Item>
                                    <List.Content>
                                        <List.Content>
                                        email: info@gofreeltd.com
                                        </List.Content>
                                    </List.Content>
                                </List.Item>

                                <List.Item>
                                    <List.Content>
                                        <List.Content>
                                        Vat no-115 4873 15.
                                        </List.Content>
                                    </List.Content>
                                </List.Item>

                                <List.Item>
                                    <List.Content>
                                        <List.Content>
                                        Company Reg-06472864
                                        </List.Content>
                                    </List.Content>
                                </List.Item>
                            </List>
                
                        </Card.Content>
                    </Card>




                    <Card link raised color="pink">
                        <Card.Content>
                            <Card.Header>
                                Business Opens
                            </Card.Header>
                            <Divider />
                            <Card.Description>
                                9:30AM TO 5PM Monday to Friday
                            </Card.Description>
                        </Card.Content>

                    </Card>
                </Card.Group>



            </div>
        </div>
    )
}

export default Contact
