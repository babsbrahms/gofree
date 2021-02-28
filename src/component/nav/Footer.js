import React from 'react';
import { Segment, List } from 'semantic-ui-react';
import { Link } from "react-router-dom"

const Footer = () => {
    return (
        <Segment attached='bottom' style={{ backgroundColor: "#111"}} color="pink">
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
            <List inverted >
                <List.Item>
                    <List.Icon name='marker' />
                    <List.Content>
                        <a>No: 724, Green Lane Dagenham, Essex.</a>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='text telephone' />
                    <List.Content>
                        <a href={"tel:02085861814"}>02085861814</a>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='phone' />
                    <List.Content>
                        <a href={"tel:07940491560"}>07940491560</a>
                    </List.Content>
                </List.Item>

                <List.Item>
                    <List.Icon name='mail' />
                    <List.Content>
                        <a href='mailto:info@gofreeltd.com'>info@gofreeltd.com</a>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name="copyright" />
                    <List.Content>
                        <a>Company Reg-06472864</a>
                    </List.Content>
                </List.Item>
            </List>


            <List inverted>
                <List.Item>
                    <List.Icon name='linkify' />
                    <List.Content>
                        <Link to="/about" >About Us </Link>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='linkify' />
                    <List.Content>
                        <Link to="/contact" >Contact Us</Link>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='linkify' />
                    <List.Content>
                        <Link to="/services" >Services</Link>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='linkify' />
                    <List.Content>
                        <Link to="/privacy" >Privacy Policy </Link>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='linkify' />
                    <List.Content>
                        <Link to="/terms" >Terms and Conditions</Link>
                    </List.Content>
                </List.Item>
            </List>
            </div>

        </Segment>
    )
}

export default Footer
