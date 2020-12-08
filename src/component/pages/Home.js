import React, { useState, useEffect, useRef } from 'react'
import { Segment, Card, Button, Image, Step, Breadcrumb, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import Quote from "../container/Quote"
import air from "../../utils/images/air-freight-transport-2.jpg"
import truck from "../../utils/images/cargo-gofree-truck.jpg"
import road from "../../utils/images/road-trucking_2.jpg"
import sea from "../../utils/images/sea-freight-transport-2.jpg";
import dhl from "../../utils/images/dhl.svg";
import dpd from "../../utils/images/dpd.svg";
import parcelforce from "../../utils/images/parcelforce.svg";
import ups from "../../utils/images/ups.svg";
import fedex from "../../utils/images/fedex.svg";
import "../css/style.css"

const adsWords = [
    {
        lead: "Get Your Parcel Delivered",
        small: "With A trusted International Courier Service."
    },
    {
        lead: "We connect the world with ease",
        small: "add small word"
    },
    {
        lead: "add lead word 2",
        small: "add small word"
    },
    {
        lead: "add lead word 3",
        small: "add small word"
    }
]


const Home = () => {
    const [current, setCurrent] = useState(0);
    let timer = useRef(null)
    let [showQuote, setShowQuote] = useState(false)

    useEffect(() => {
        timer.current = setInterval(() => {
            console.log(current);
            if (current === (adsWords.length - 1)) {
                setCurrent(0)
            } else {
                setCurrent(current + 1)
            }
        }, 5000);

        return() => {
            clearInterval(timer.current)
            
        }
    })

    return (
        <div>
            <Segment id="gofree-bg">
                {/* <img width="100%" height="auto" src={wallpaper} style={{backgroundColor: "#fff", borderRadius: 5, marginBottom: 12, borderBottomWidth: 5, borderBottomColor: "#f03c96", borderBottomStyle: "solid" }} /> */}
                <Segment id="gofree-home-showcase">
                    {(!!adsWords[current].lead) && (<h2 style={{ marginTop: 10, color: "black", opacity: 0.8, padding: 5, borderRadius: 5 }}>
                        {adsWords[current].lead}
                    </h2>)}
                    {(!!adsWords[current].small) && (<h2 style={{ marginTop: 10, color: "black", opacity: 0.8, padding: 5, borderRadius: 5 }}>
                        {adsWords[current].small}
                    </h2>)}

                </Segment>
                <Segment color="pink" raised stacked style={{ paddingBottom: 30, backgroundColor: "#fff",borderRadius: 5, marginBottom: 50, padding: 10 }}>
                    <h2>GET QUOTE</h2>
                    {(!showQuote) && (<Button color="black" circular onClick={() => setShowQuote(true)}>Click Here To Get Qoute</Button>)}
                    {(showQuote) && (<div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                        <Icon circular inverted color="red" name="close" link onClick={() => setShowQuote(false)} />
                    </div>)}
                    {(showQuote) && (<Quote />)}
                </Segment>
                <div style={{ paddingBottom: 40 }}>
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
                <div style={{ paddingBottom: 40, width: '100%' }}>
                    <h2>STEPS</h2>
                    <p>Get your parcel or package delivered in 5 easy steps.</p>
                    <Step.Group size="small" stackable>
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
                        <Icon name="dolly" />
                        <Step.Content>
                            <Step.Title>Collection</Step.Title>
                            <Step.Description>We collect the package(s)</Step.Description>
                        </Step.Content>
                        </Step>

                        <Step>
                        <Icon name="plane" />
                        <Step.Content>
                            <Step.Title>Shipping</Step.Title>
                            <Step.Description>We transport the package(s)</Step.Description>
                        </Step.Content>
                        </Step>


                        <Step>
                        <Icon name='truck' />
                        <Step.Content>
                            <Step.Title>Delivery</Step.Title>
                            <Step.Description>We deliver your package(s)</Step.Description>
                        </Step.Content>
                        </Step>
                    </Step.Group>
                </div>
                <div style={{ paddingBottom: 40 }}>
                    <h2>COURIERS</h2>
                    <p>We use the services of the courier companies listed below. We are not their official agent.</p>
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
                <div style={{ backgroundImage:`url(${truck})`, width: "100%", height: '60vh', backgroundPosition: "top left", backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",  borderRadius: 5, marginBottom: 40}}>
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