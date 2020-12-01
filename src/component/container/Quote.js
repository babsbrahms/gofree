import React, { useState } from 'react';
import { Button, Form, Input, Icon, List, Label, Segment, Radio } from "semantic-ui-react";

const fromOption = [
    { key: 'UK', text: 'UK', value: 'uk' },
]

const deliveryOptions = [
    { key: 'Nigeria', text: 'Nigeria', value: 'nigeria' },
]

const typeOptions = [
    { key: 'parcel', text: 'Parcel', value: 'parcel' },
    { key: 'package', text: 'Package', value: 'package' },
]

const Quote = () => {
    const [data, setData] = useState({
        type: "",
        from: "",
        to: "",
        where: "lagos",
        email: ""
    })
    const [packages, SetPackages] = useState([{ weight: "", height: "", length: "", width: "" }])

    const addPackage = () => SetPackages([...packages, { weight: "", height: "", length: "", width: "" }]);

    const removePackage = (index) => {
        packages.splice(index, 1);
        SetPackages([ ...packages ])
    }

    const addData = ({ name, value}) => setData({ ...data, [name]: value })

    return (
        <Segment style={{ padding: 20 }}>
            <Form>
                <Form.Field>
                    <Form.Dropdown
                        label="Type"
                        fluid
                        search
                        selection
                        options={typeOptions}
                        placeholder="Collect From"
                        defaultValue={data.type}
                        name="type"
                        onChange={(e, data) => addData(data)}
                        placeholder={"Parcel or package"}
                    />
                </Form.Field>
                <Form.Field>
                    <Form.Dropdown
                        label="Collect From"
                        fluid
                        search
                        selection
                        options={fromOption}
                        placeholder="Collect From"
                        defaultValue={data.from}
                        name="from"
                        onChange={(e, data) => addData(data)}
                        placeholder={"Add pakage or parcel pick up location"}
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
                        defaultValue={data.to}
                        name="to"
                        onChange={(e, data) => addData(data)}
                        placeholder={"Add pakage or parcel destination"}
                    />
                </Form.Field>
                {(data.to === 'nigeria') && (
                <Form.Group inline>
                    <label>Where In Nigeria</label>
                    <Form.Field
                        control={Radio}
                        label='Abuja'
                        value='abuja'
                        checked={data.where === 'abuja'}
                        name="where"
                        onChange={(e, data) => addData(data)}
                    />
                    <Form.Field
                        control={Radio}
                        label='Lagos'
                        value='lagos'
                        checked={data.where === '2'}
                        checked={data.where === 'lagos'}
                        name="where"
                        onChange={(e, data) => addData(data)}
                    />
                    <Form.Field
                        control={Radio}
                        label='Others'
                        value='others'
                        checked={data.where === '3'}
                        checked={data.where === 'others'}
                        name="where"
                        onChange={(e, data) => addData(data)}
                    />
                </Form.Group>)}
                <Form.Field>
                    <Form.Input 
                        label="Email"
                        fluid
                        defaultValue={data.email}
                        name="email"
                        onChange={(e, data) => addData(data)}
                        placeholder={"Add your email address"}
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
        </Segment>
    )
}

export default Quote
