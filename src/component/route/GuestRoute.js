import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Loader, Segment, Dimmer } from 'semantic-ui-react'
import firebase from '../firebaseConfig';

let unsubscribe;


class GuestRoute extends Component {
    state= {
        loading: true,
        isAuthenticated: false,
        user: {}
    }

    componentDidMount () {
        this.auth()
    }

    componentWillUnmount()  {
        unsubscribe()
    }

    auth = ()=> {
        unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
               this.setState({ loading: false, isAuthenticated: true})
            } else {
                this.setState({ loading: false, isAuthenticated: false })
            }
          });
    }

    render( ) {
        const {token, component: Component, ...rest} = this.props;
        const {loading, isAuthenticated} = this.state;

        // console.log('guestRoute==', 'token: ', token, 'isAuthenticated: ',isAuthenticated, 'loading: ', loading);
        return (
            <div>
                {loading && (<Segment>
                    <Dimmer active>
                        <br/>
                        <Loader>Loading</Loader>
                        <br/>
                    </Dimmer>
                </Segment>)}
                

                {!loading && !isAuthenticated && (<Route {...rest} render={(props)=> <Component  {...props}/>} />)}
                {!loading && isAuthenticated && (<Redirect to="/dashboard" />)}
            </div>
        )
    }
}

// GuestRoute.propTypes={
// isAuthenticated: PropTypes.bool.isRequired,
// component: PropTypes.func.isRequired

// } 

export default GuestRoute;