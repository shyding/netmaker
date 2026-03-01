import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Link,
  Chip,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { makeStyles } from '@mui/styles'
import { copy } from '~util/fields'

const useStyles = makeStyles((theme: any) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  codeBlock: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflowX: 'auto',
    position: 'relative',
  },
  copyButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  stepContent: {
    marginTop: theme.spacing(2),
  },
}))

interface GetStartedGuideProps {
  networkName: string
  enrollmentToken?: string
}

export const GetStartedGuide: React.FC<GetStartedGuideProps> = ({
  networkName,
  enrollmentToken,
}) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const [activeStep, setActiveStep] = useState(0)
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({})

  const handleCopy = (text: string, key: string) => {
    copy(text)
    setCopied({ ...copied, [key]: true })
    setTimeout(() => {
      setCopied({ ...copied, [key]: false })
    }, 2000)
  }

  const steps = [
    {
      label: 'Create Enrollment Key',
      description: 'Generate a token to allow devices to join your network',
      content: (
        <Box className={classes.stepContent}>
          {enrollmentToken ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Enrollment Token:</strong>
                </Typography>
                <Box sx={{ mt: 1, position: 'relative' }}>
                  <TextField
                    fullWidth
                    value={enrollmentToken}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Tooltip
                          title={copied['token'] ? 'Copied!' : 'Copy token'}
                        >
                          <IconButton
                            onClick={() =>
                              handleCopy(enrollmentToken, 'token')
                            }
                            size="small"
                          >
                            {copied['token'] ? <CheckIcon /> : <CopyIcon />}
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </Box>
              </Alert>
            </>
          ) : (
            <>
              <Typography variant="body2" paragraph>
                1. Click on <strong>"Enrollment Keys"</strong> tab
              </Typography>
              <Typography variant="body2" paragraph>
                2. Click <strong>"Create Enrollment Key"</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                3. Set the number of uses (e.g., 1 for single device, 0 for
                unlimited)
              </Typography>
              <Typography variant="body2" paragraph>
                4. Copy the generated token
              </Typography>
            </>
          )}
        </Box>
      ),
    },
    {
      label: 'Download Netclient',
      description: 'Get the client for your operating system',
      content: (
        <Box className={classes.stepContent}>
          <Typography variant="body2" paragraph>
            Download the Netclient for your platform:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label="Linux"
              component="a"
              href="/downloads"
              clickable
              color="primary"
              variant="outlined"
            />
            <Chip
              label="Windows"
              component="a"
              href="/downloads"
              clickable
              color="primary"
              variant="outlined"
            />
            <Chip
              label="macOS"
              component="a"
              href="/downloads"
              clickable
              color="primary"
              variant="outlined"
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            href="/downloads"
            fullWidth
          >
            Go to Downloads Page
          </Button>
        </Box>
      ),
    },
    {
      label: 'Install Netclient',
      description: 'Install and configure the client on your device',
      content: (
        <Box className={classes.stepContent}>
          <Typography variant="subtitle2" gutterBottom>
            Linux / macOS:
          </Typography>
          <Box className={classes.codeBlock}>
            <IconButton
              className={classes.copyButton}
              size="small"
              onClick={() =>
                handleCopy(
                  `# Download (replace with your platform)\nwget ${window.location.origin}/downloads/netclient-linux-amd64\nchmod +x netclient-linux-amd64\nsudo mv netclient-linux-amd64 /usr/local/bin/netclient`,
                  'install-linux'
                )
              }
            >
              {copied['install-linux'] ? <CheckIcon /> : <CopyIcon />}
            </IconButton>
            <pre style={{ margin: 0 }}>
              {`# Download (replace with your platform)
wget ${window.location.origin}/downloads/netclient-linux-amd64
chmod +x netclient-linux-amd64
sudo mv netclient-linux-amd64 /usr/local/bin/netclient`}
            </pre>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Windows:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Download the .exe file and run it as Administrator
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Register Device',
      description: 'Connect your device to the network',
      content: (
        <Box className={classes.stepContent}>
          <Typography variant="body2" paragraph>
            Run the following command with your enrollment token:
          </Typography>
          <Box className={classes.codeBlock}>
            <IconButton
              className={classes.copyButton}
              size="small"
              onClick={() =>
                handleCopy(
                  `sudo netclient register -t ${enrollmentToken || 'YOUR_ENROLLMENT_TOKEN'}`,
                  'register'
                )
              }
            >
              {copied['register'] ? <CheckIcon /> : <CopyIcon />}
            </IconButton>
            <pre style={{ margin: 0 }}>
              {`sudo netclient register -t ${enrollmentToken || 'YOUR_ENROLLMENT_TOKEN'}`}
            </pre>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              The device will automatically connect to the network and receive
              an IP address from the range: <strong>{networkName}</strong>
            </Typography>
          </Alert>
        </Box>
      ),
    },
    {
      label: 'Verify Connection',
      description: 'Check that your device is connected',
      content: (
        <Box className={classes.stepContent}>
          <Typography variant="body2" paragraph>
            Verify the connection with these commands:
          </Typography>
          <Box className={classes.codeBlock}>
            <IconButton
              className={classes.copyButton}
              size="small"
              onClick={() =>
                handleCopy(
                  '# Check netclient status\nsudo netclient status\n\n# View WireGuard interface\nsudo wg show',
                  'verify'
                )
              }
            >
              {copied['verify'] ? <CheckIcon /> : <CopyIcon />}
            </IconButton>
            <pre style={{ margin: 0 }}>
              {`# Check netclient status
sudo netclient status

# View WireGuard interface
sudo wg show`}
            </pre>
          </Box>

          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            You should also see the device in the <strong>Hosts</strong> tab of
            your network.
          </Typography>

          <Alert severity="success">
            <Typography variant="body2">
              <strong>Success!</strong> Your device is now part of the network
              and can communicate with other nodes.
            </Typography>
          </Alert>
        </Box>
      ),
    },
  ]

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Getting Started with {networkName}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Follow these steps to add devices to your network
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  <Typography variant="caption">{step.description}</Typography>
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                {step.content}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(index + 1)}
                    sx={{ mr: 1 }}
                    disabled={index === steps.length - 1}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  {index > 0 && (
                    <Button onClick={() => setActiveStep(index - 1)}>
                      Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success">
              <Typography variant="body2">
                All steps completed! Your device should now be connected to the
                network.
              </Typography>
            </Alert>
            <Button onClick={() => setActiveStep(0)} sx={{ mt: 2 }}>
              Reset Guide
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Need help? Check the{' '}
            <Link
              href="https://docs.netmaker.io"
              target="_blank"
              rel="noopener"
            >
              documentation
            </Link>{' '}
            or visit the{' '}
            <Link href="/downloads" target="_blank">
              downloads page
            </Link>
            .
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
