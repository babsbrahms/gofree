import React, { useState } from 'react'
import { Segment, Card, Button, Image, Form, Tab, Input, Step, Breadcrumb, Icon, List, Label } from "semantic-ui-react";
import { Link } from "react-router-dom";
import wallpaper from "../../utils/images/wallpaper.svg"
import air from "../../utils/images/air-freight-transport-2.jpg"
import truck from "../../utils/images/cargo-gofree-truck.jpg"
import road from "../../utils/images/road-trucking_2.jpg"
import sea from "../../utils/images/sea-freight-transport-2.jpg";
import dhl from "../../utils/images/dhl.svg";
import dpd from "../../utils/images/dpd.svg";
import parcelforce from "../../utils/images/parcelforce.svg";
import ups from "../../utils/images/ups.svg";
import fedex from "../../utils/images/fedex.svg";

const deliveryOptions = [
    { key: 'Nigeria', text: 'Nigeria', value: 'Nigeria' },
    { key: 'UK', text: 'UK', value: 'UK' },
    { key: 'Australia', text: 'Australia', value: 'Australia' },
  ]
const Home = (props) => {
    const [packages, SetPackages] = useState([{ weight: "", height: "", length: "", width: "" }])

    const addPackage = () => SetPackages([...packages, { weight: "", height: "", length: "", width: "" }])

    const removePackage = (index) => {
        packages.splice(index, 1);
        SetPackages([ ...packages ])
    }
    const panes = [
        { menuItem: 'Parcel', render: () => <Tab.Pane>
            <Form>
                <Form.Field>
                    <Form.Dropdown
                        label="Collect From"
                        fluid
                        search
                        selection
                        options={deliveryOptions}
                        placeholder="Collect From"
                    />
                </Form.Field>
                <Form.Field>
                    <Form.Dropdown
                        label="Deliver To"
                        fluid
                        search
                        selection
                        options={deliveryOptions}
                        placeholder="Deliver To"
                    />
                </Form.Field>
                <Form.Field>
                    <label>Quantity</label>
                    <input placeholder={"quantity"} type="number" />
                </Form.Field>
                <Form.Field>
                    <label>Weight</label>
                    <Input
                        label={{ basic: true, content: 'kg' }}
                        labelPosition='right'
                        placeholder='Enter weight...'
                    />
                </Form.Field>

                <Button color="black" type='submit'>GET QUOTE</Button>
            </Form>
        </Tab.Pane> },
        { menuItem: 'Package', render: () => <Tab.Pane>
            <Form>
                <Form.Field>
                    <Form.Dropdown
                        label="Collect From"
                        fluid
                        search
                        selection
                        options={deliveryOptions}
                        placeholder="Collect From"
                    />
                </Form.Field>
                <Form.Field>
                    <Form.Dropdown
                        label="Deliver To"
                        fluid
                        search
                        selection
                        options={deliveryOptions}
                        placeholder="Deliver To"
                    />
                </Form.Field>

                <List divided relaxed>
                    {packages.map((pack, index) => (
                    <List.Item key={`package-${index}`}>
                        <List.Icon name="remove circle" onClick={() => removePackage(index)} color="red" size='large' verticalAlign='middle' />
                        <List.Content>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <label>Weight</label>
                                    <Input
                                        label={{ basic: true, content: 'kg' }}
                                        labelPosition='right'
                                        placeholder='Enter weight...'
                                        
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Length</label>
                                    <Input
                                        label={{ basic: true, content: 'cm' }}
                                        labelPosition='right'
                                        placeholder='Enter Length...'
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Width</label>
                                    <Input
                                        label={{ basic: true, content: 'cm' }}
                                        labelPosition='right'
                                        placeholder='Enter Width...'
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Height</label>
                                    <Input
                                        label={{ basic: true, content: 'cm' }}
                                        labelPosition='right'
                                        placeholder='Enter Height...'
                                    />
                                </Form.Field>
                            </Form.Group>
                        </List.Content>
                    </List.Item>))}


                    <List.Item>
                        <Label onClick={() => addPackage()} color="green" as="a" ><Icon name="add circle" /> Add Package</Label>
                        {/* <List.Icon onClick={() => addPackage()} name="add circle" color="green" size='large' verticalAlign='middle' />
                        <List.Content>
                        </List.Content> */}
                    </List.Item>
                </List>

                <Button color="black" type='submit'>GET QUOTE</Button>
            </Form>
        </Tab.Pane> },
      ]
    return (
        <div>
            <Segment style={{ backgroundColor: "#111"}}>
                <img width="100%" height="auto" src={wallpaper} style={{backgroundColor: "#fff", borderRadius: 5, marginBottom: 12, borderBottomWidth: 5, borderBottomColor: "#f03c96", borderBottomStyle: "solid" }} />
                <div style={{ position: "absolute", top: "3%", left: "2%"}}>
                    <h2 style={{ marginTop: 10, color: "black", opacity: 0.8, padding: 5, borderRadius: 5 }}>
                        Get Your Parcel Delivered
                    </h2>
                    <h2 style={{ marginTop: 10, color: "black", opacity: 0.8, padding: 5, borderRadius: 5 }}>
                        With A trusted International Courier Service.
                    </h2>

                </div>
                <Segment raised stacked style={{ paddingBottom: 20, backgroundColor: "#fff",borderRadius: 5, marginBottom: 10, padding: 10 }}>
                    <h2>GET QUOTE</h2>
                    <Tab panes={panes} />
                </Segment>
                <div style={{ paddingBottom: 30 }}>
                    <h2>SERVICES</h2>

                    <Card.Group stackable itemsPerRow="3">
                        <Card link color="pink">
                            <Image src={air} wrapped ui={false} />
                            <Card.Content>
                                <Card.Header>Air Freighting</Card.Header>
                                <Card.Meta>
                                    <span className='date'>We connect the world. We deliver value</span>
                                </Card.Meta>
                                <Card.Description>
                                We serve a multicultural clients around the world. Meeting client's request cannot be any simpler. Whereever you are, we will connect you.
                                </Card.Description>
                            </Card.Content>
                        </Card>

                        <Card link color="pink">
                            <Image src={road} wrapped ui={false} />
                            <Card.Content>
                                <Card.Header>Road Trucking</Card.Header>
                                <Card.Meta>
                                    <span className='date'>Prompt Delivery. Even in tough terrains</span>
                                </Card.Meta>
                                <Card.Description>
                                Our range of trucking services takes worries off your mind. We deliver anywhere around the world. No matter how tough the terrain.
                                </Card.Description>
                            </Card.Content>
                        </Card>

                        <Card link color="pink">
                            <Image src={sea} wrapped ui={false} />
                            <Card.Content>
                                <Card.Header>Ocean Freighting</Card.Header>
                                <Card.Meta>
                                    <span className='date'>We connect the world. We deliver value</span>
                                </Card.Meta>
                                <Card.Description>
                                    We serve a multicultural clients around the world. Meeting client's request cannot be any simpler. Whereever you are, we will connect you.
                                </Card.Description>
                            </Card.Content>
                        </Card>
                    </Card.Group>
                    <br />
                    <Button color="black" as={Link} to="/services" circular> 
                        Learn More
                    </Button>
                </div>
                <div style={{ paddingBottom: 30 }}>
                    <h2>STEPS</h2>
                    <Step.Group>
                        <Step>
                        <Icon name='shopping cart' />
                        <Step.Content>
                            <Step.Title>Order</Step.Title>
                            <Step.Description>Enter your package information</Step.Description>
                        </Step.Content>
                        </Step>

                        <Step>
                        <Icon name='payment' />
                        <Step.Content>
                            <Step.Title>Payment</Step.Title>
                            <Step.Description>Pay for the package(s)</Step.Description>
                        </Step.Content>
                        </Step>

                        <Step>
                        <Icon name='truck' />
                        <Step.Content>
                            <Step.Title>Delivery</Step.Title>
                            <Step.Description>We deliver your package</Step.Description>
                        </Step.Content>
                        </Step>
                    </Step.Group>
                </div>
                <div style={{ paddingBottom: 30 }}>
                    <h2>COURIERS</h2>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap"}}>
                       <Image.Group size="medium">
                            <Image src={dhl} alt="dhl" />
                            <Image src={dpd} alt="dpd" />
                            <Image src={parcelforce} alt={"parcelforce"} />
                            <Image src={ups} alt="ups" />
                            <Image src={fedex} alt="fedex" />
                       </Image.Group>
                    </div>

                </div>
                <div style={{ backgroundImage:`url(${truck})`, width: "100%", height: '60vh', backgroundPosition: "top left", backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",  borderRadius: 5, marginBottom: 30}}>
                    <div style={{ backgroundColor: "#fff", opacity: 0.9, width: "50%", padding: 8, borderRadius: 5}}>
                        <h2>WHY US?</h2>
                        <Breadcrumb>
                            <Breadcrumb.Section active>Accurate Research.</Breadcrumb.Section>
                            <Breadcrumb.Divider>/</Breadcrumb.Divider>
                            <Breadcrumb.Section active>Safe delivery</Breadcrumb.Section>
                        </Breadcrumb>
                        <p>
                        For many years in operations, we consistently take burdens off our clients. We source for their needs world over. Accurate results drives us to go beyond borders.                        </p>
                        <Button color="black" as={Link} to="/about" circular> 
                            Learn More
                        </Button>
                    </div>
                </div>
                <div>
                    <h2>TESTIMONIALS</h2>

                    <Card.Group itemsPerRow="3" stackable>
                        <Card link color="pink">
                            <Card.Content>
                                <Image
                                floated='right'
                                size='mini'
                                src='https://react.semantic-ui.com/images/avatar/large/steve.jpg'
                                />
                                <Card.Header>Steve Sanders</Card.Header>
                                <Card.Meta>Manager</Card.Meta>
                                <Card.Description>
                                Quickest, most efficient courier I have used. Hugely impressed!!
                                </Card.Description>
                            </Card.Content>
                        </Card>
                        <Card link color="pink">
                            <Card.Content>
                                <Image
                                floated='right'
                                size='mini'
                                src='https://react.semantic-ui.com/images/avatar/large/molly.png'
                                />
                                <Card.Header>Molly Thomas</Card.Header>
                                <Card.Meta>Sally Dental Group</Card.Meta>
                                <Card.Description>
                                I was really impressed with your brilliant service. Everything was arranged in record time, and you kept me informed throughout. Thank you so much.
                                </Card.Description>
                            </Card.Content>
                        </Card>
                        <Card link color="pink">
                            <Card.Content>
                                <Image
                                floated='right'
                                size='mini'
                                src='https://react.semantic-ui.com/images/avatar/large/jenny.jpg'
                                />
                                <Card.Header>Jenny Lawrence</Card.Header>
                                <Card.Meta>London</Card.Meta>
                                <Card.Description>
                                I have been using gofree for all my courier needs since 2012, they have never let me down and have been consistently brilliant. Their customer service is excellent always giving that extra touch and I would recommend them to anyone.
                                </Card.Description>
                            </Card.Content>
                        </Card>
                    </Card.Group>
                </div>
                
            </Segment>
        </div>
    )
}

export default Home