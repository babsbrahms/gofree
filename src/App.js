import React from 'react';
import { Switch, Route } from "react-router-dom";

import Header from "./component/nav/Header";
import Footer from "./component/nav/Footer"

import Account from './component/pages/Account';
import Auth from './component/pages/Auth';
import Home from './component/pages/Home';
import About from './component/pages/About';
import Admin from "./component/pages/Admin"
import Error from './component/pages/Erorr';
import Privacy from "./component/pages/Privacy";
import Terms from './component/pages/Terms';
import Cart from "./component/pages/Cart";
import Checkout from "./component/pages/Checkout";
import Contact from "./component/pages/Contact"
import Services from "./component/pages/Services"


import UserRoute from './component/route/UserRoute';
import GuestRoute from './component/route/GuestRoute';

function App({ location }) {
  return (
    <div>
        <Header />
        <Switch>
            <Route component={Account} exact path={'/account'} />
            <Route component={Admin} exact path={'/admin'} />
            <GuestRoute component={Auth} exact path={'/auth'}  />
            <Route exact component={Home} path={"/"} />
            <Route exact component={About} path={"/about"} />
            <Route exact component={Privacy} path={'/privacy'} />
            <Route exact component={Terms} path={'/terms'} />
            <Route exact component={Cart} path={'/cart'}/>
            <Route exact component={Checkout} path={'/checkout'}/>
            <Route exact component={Contact} path={'/contact'}/>
            <Route exact component={Services} path={'/services'}/>
            <Route component={Error} exact path={'/*'}  />
        </Switch>
        <Footer />

    </div>
  );
}

export default App;
