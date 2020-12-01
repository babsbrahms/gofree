import React, {useState} from 'react'
import { Menu, Dropdown, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";


const Header = () => {
    let part = '';

    if (window.location.pathname === '/') {
        part = 'home'
    } else {
        part = window.location.pathname.slice(1)
    }
    const [activeItem, setActiveItem] = useState(part)
    // console.log(window.location.origin);
    return (
        <Menu id="gofree-menu" color="blue" pointing secondary>
            <Menu.Item
                name='home'
                active={activeItem === 'home'}
                onClick={() => setActiveItem('home')}
                as={Link} 
                to={'/'}
            />


            <Dropdown item text='Navigation' pointing onClick={() => setActiveItem('')}>
                <Dropdown.Menu>
                    <Dropdown.Header>Navigate to:</Dropdown.Header>
                    <Dropdown.Item as={Link} to="/about">About Us</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/contact">Contact Us</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/services">Services</Dropdown.Item>    
                    <Dropdown.Item as={Link} to="/privacy">Privacy Policy</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/terms">Terms and Condition</Dropdown.Item> 
                </Dropdown.Menu>
            </Dropdown>

            <Menu.Item/>
        

            <Menu.Menu position='right'>
                <Menu.Item
                    name='account'
                    active={activeItem === 'account'}
                    onClick={() => setActiveItem('account')}
                    as={Link} 
                    to={'/account'}
                />
                
                <Menu.Item
                    name='cart'
                    active={activeItem === 'cart'}
                    onClick={() => setActiveItem('cart')}
                    as={Link} 
                    to={'/cart'}
                />
            </Menu.Menu>

        </Menu>
    )
}

export default Header
