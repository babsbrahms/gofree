import React, { useState } from 'react'
import { Segment, Menu, Header } from "semantic-ui-react";
import "../css/style.css"

const Services = () => {
    const [activeType, setActiveType] = useState('package');
    const [activeMeans, setActiveMeans] = useState('air')

    const handleTypeClick = (e, { name }) => setActiveType(name)
    const handleMeansClick = (e, { name }) => setActiveMeans(name)

    return (
        <div id="gofree-bg">
            <Segment id="gofree-topbar">
                <h1>Services</h1>
            </Segment>
            <div style={{ padding: 30}}>
                {/* <div id="gofree-content">
                    <Menu attached='top' tabular>
                        <Menu.Item
                            name='courier'
                            active={activeType === 'courier'}
                            onClick={handleTypeClick}
                        />

                        <Menu.Item
                            name='package'
                            active={activeType === 'package'}
                            onClick={handleTypeClick}
                        />
                    </Menu>

                    <Segment attached='bottom'>
                        <img src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
                    </Segment>
                </div> */}
                <p style={{ fontSize: "22px" }}>
                We provide the best courier service in the United Kingdom and Nigeria. Our service includes both parcel and packages delivery from the United Kingdom to all anywhere in the world. Furthermore, we collect parcels and packages from the following locations: South Africa, United Kingdom, United Arab Emirates, China, and Nigeria. 
                </p>
                <p style={{ fontSize: "22px" }}>
                We serve multicultural clients around the world. Hence we use different means of transportation to meet our client's needs.
                </p>
                <br />
                <br />
                <br />
                <div id="gofree-content">
                    <Menu attached='top' size={"massive"} tabular>
                        <Menu.Item
                            name='air'
                            icon="plane"
                            active={activeMeans === 'air'}
                            onClick={handleMeansClick}
                        />
                        <Menu.Item
                            name='road'
                            icon="road"
                            active={activeMeans === 'road'}
                            onClick={handleMeansClick}
                        />
                        <Menu.Item
                            name='ocean'
                            icon="ship"
                            active={activeMeans === 'ocean'}
                            onClick={handleMeansClick}
                        />
                    </Menu>

                    <Segment attached='bottom'>
                        {(activeMeans === 'air') && (
                            <div>                            
                                <Header>
                                    <Header.Content>
                                        Air Freighting
                                    </Header.Content>
                                </Header>

                                <p style={{ fontSize: "16px" }}>
                                        Air freight parcel delivery is the transfer and shipment of goods via an air carrier, which may be charter or commercial. Such shipments travel out of commercial and passenger aviation gateways to anywhere planes can fly and land.
                                </p>
                                    <b style={{ fontSize: "16px" }}>
                                        The Advantages of Air Freight
                                    </b>
                                <p style={{ fontSize: "16px" }}>
                                    The express shipping options of air freight make it a valuable option for coordinating time sensitive shipments to almost anywhere in the world. This can be particularly advantageous for smaller and mid-sized companies as it allows them to participate in international trade in an expeditious and effective manner. Shipping by air also offers the advantage of a high level of security as airport controls over cargo are tightly managed.
                                </p>
                            </div>
                        )}

                        {(activeMeans === 'road') && (
                            <div>                            
                                <Header>
                                    <Header.Content>
                                        Road Trucking
                                    </Header.Content>
                                </Header>

                                <p style={{ fontSize: "16px" }}>
                                    Road freight parcel delivery is the transfer and shipment of goods via land transport. 
                                </p>
                                    <b style={{ fontSize: "16px" }}>
                                        The Advantages of Road Trucking
                                    </b>
                                <p style={{ fontSize: "16px" }}>
                                    Road transport provides a faster and less costly means of transporting goods over short distances. Other modes of transport like water, air or rail may incur delays in transit of goods with loading and reloading required in multiple locations.                                
                                </p>
                            </div>
                        )}


                        {(activeMeans === 'ocean') && (
                            <div>                            
                                <Header>
                                    <Header.Content>
                                        Ocean Freighting
                                    </Header.Content>
                                </Header>

                                <p style={{ fontSize: "16px" }}>
                                    Ocean freight parcel delivery is the transfer and shipment of goods via an sea contaiRoad. It is the most common form of transport for importers and exporters, accounting for 90% of goods transported globally.
                                </p>
                                    <b style={{ fontSize: "16px" }}>
                                        The Advantages of Ocean Freighting
                                    </b>
                                <p style={{ fontSize: "16px" }}>
                                    transporting containers of goods by ship is the one of the most cost effective forms of transport, which is important supply chain management and operations within a business and can help keep the price of goods competitive for the end customers
                                </p>
                                <p style={{ fontSize: "16px" }}>
                                    for items that are big or heavy, shipping might be the only way to get goods overseas, as airlines can restrict form of transport and shipping ports generally have large storage capabilities
                                </p>
                            </div>
                        )}
                    </Segment>
                </div>
                <br />
                <br />
                <br />
            </div>
        </div>
    )
}

export default Services
