import React from 'react';
import { Header } from "semantic-ui-react"


class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <Header>You are offline. Connect to the internet and refresh</Header>;
      }
  
      return this.props.children; 
    }
  }

export default ErrorBoundary