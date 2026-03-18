import React from 'react';
import ErrorPage from './ErrorPage.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          title="Application error"
          message="A client-side error occurred while rendering this page. Sensitive details are hidden for safety."
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
