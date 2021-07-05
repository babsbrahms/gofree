import React, { useState     } from 'react'
import { Segment, Input, List, Form, Button, Modal } from "semantic-ui-react";
import axios from "axios";
import styles from "../../styles"

export const AddressFromZipcode = ({ addAddress }) => {
    const [postcode, setpostcode] = useState("");
    const [lists, setLists] = useState([]);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = React.useState(false)

    const getAddress = () => {
        setLoading(true);
        axios.get(`https://ws.postcoder.com/${process.env.REACT_APP_POSTCODER_API_KEY}/address/UK/${postcode}?format=json&lines=1`)
        .then(res => {
            setLoading(false)
            console.log(res.data);
            setLists(res.data)
        })
        .catch(err => {
            console.log(err.response.data);
            setLoading(false)
            // setError(err.response.data.error_message)
        })
    }

    const pick = (list) => {
        addAddress({
            address: list.summaryline,
            town: list.posttown,
            county: list.county,
            postcode: list.postcode
        });

        setOpen(false);
    }
    return (
        <Modal
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        trigger={<Button color={"teal"}>Get address from postal code</Button>}
      >
        <Modal.Header textAlign={"center"}>
            <Form >
                <div style={styles.center}>
                <Input
                    action={{
                        color: 'teal',
                        labelPosition: 'right',
                        icon: 'search',
                        content: 'Get address',
                        onClick: () => getAddress()
                    }}
                    defaultValue={postcode}
                    onChange={(e, data) => setpostcode(data.value)}
                    placeholder={"Enter postcode"}
                    disabled={loading}
                />
                <p style={{ backgroundColor: "red"}}>{error}</p>
                </div>
            </Form>
        </Modal.Header>
        <Modal.Content scrolling>
  
          <Modal.Description>
          <Segment textAlign="center" loading={loading}>
                <List divided relaxed>
                    {lists.map((list, index) => (
                    <List.Item key={index.toString()}>
                        <List.Content floated='right'>
                        <Button color={"teal"} onClick={() => pick(list)}>Select</Button>
                        </List.Content>
                        <List.Header>{list.summaryline}</List.Header>
                    </List.Item>
                    ))}
                </List>
                </Segment>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color={"red"} onClick={() => setOpen(false)} primary>
                Close
          </Button>
        </Modal.Actions>
      </Modal>
    )
}
