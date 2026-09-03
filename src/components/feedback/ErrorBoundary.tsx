import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error rendering the app:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5">Something went wrong</Typography>
          <Typography color="text.secondary">
            Try reloading the page. If this keeps happening, contact support.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}
