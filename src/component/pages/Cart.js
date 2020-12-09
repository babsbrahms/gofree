import React, { useState } from 'react'
import { Segment, Icon, Header, Button } from "semantic-ui-react";
import "../css/style.css"
import Quote from "../container/Quote";
import style from "../../styles"

const Cart = () => {
    let [showQuote, setShowQuote] = useState(false)

    return (
        <div id="gofree-bg">
            <Segment id="gofree-topbar">
                <h1>Cart</h1>
            </Segment>

            <div style={{ padding: 30 }}>
                <div style={style.center}>
                    <Header textAlign icon>
                        <Icon circular name="shopping cart" />
                        You cart is empty!
                    </Header>
                </div>

                <Segment color={showQuote? "blue" : "pink"} raised stacked style={{ paddingBottom: 30, backgroundColor: showQuote? "steelblue" : "#fff",borderRadius: 5, marginBottom: 50, padding: 10 }}>
                    <h2>GET QUOTE</h2>
                    {(!showQuote) && (<Button color="black" circular onClick={() => setShowQuote(true)}>Click Here To Get Qoute</Button>)}
                    {(showQuote) && (<div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                        <Icon circular inverted color="red" name="close" link onClick={() => setShowQuote(false)} />
                    </div>)}
                    {(showQuote) && (<Quote />)}
                </Segment>
            </div>
        </div>
    )
}

export default Cart
