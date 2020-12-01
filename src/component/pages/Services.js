import React, { useState } from 'react'
import { Segment, Menu } from "semantic-ui-react";
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
                <div>
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
                </div>
                <br />
                <br />
                <br />
                <div>
                    <Menu attached='top' tabular>
                        <Menu.Item
                            name='air'
                            active={activeMeans === 'air'}
                            onClick={handleMeansClick}
                        />
                        <Menu.Item
                            name='road'
                            active={activeMeans === 'road'}
                            onClick={handleMeansClick}
                        />
                        <Menu.Item
                            name='ocean'
                            active={activeMeans === 'ocean'}
                            onClick={handleMeansClick}
                        />
                    </Menu>

                    <Segment attached='bottom'>
                        <img src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
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
