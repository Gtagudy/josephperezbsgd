import React from 'react';

export class CityErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // Log error to your error reporting service
    console.error('City Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <group>
          {/* Fallback city representation */}
          <mesh>
            <boxGeometry args={[100, 100, 100]} />
            <meshStandardMaterial color="red" />
          </mesh>
          {process.env.NODE_ENV === 'development' && (
            <group position={[0, 50, 0]}>
              <mesh>
                <boxGeometry args={[10, 10, 10]} />
                <meshStandardMaterial color="yellow" />
              </mesh>
            </group>
          )}
        </group>
      );
    }

    return this.props.children;
  }
} 