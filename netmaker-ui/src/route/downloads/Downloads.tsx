import React from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  Link,
  Divider,
  Alert,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Apple as AppleIcon,
  Computer as WindowsIcon,
  Terminal as LinuxIcon,
} from '@mui/icons-material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  header: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  cardContent: {
    flexGrow: 1,
  },
  platformIcon: {
    fontSize: 64,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  downloadButton: {
    marginTop: theme.spacing(2),
  },
  codeBlock: {
    backgroundColor: (theme.palette.mode === 'dark' || theme.palette.type === 'dark') ? '#1e1e1e' : theme.palette.grey[100],
    color: (theme.palette.mode === 'dark' || theme.palette.type === 'dark') ? '#d4d4d4' : 'inherit',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflowX: 'auto',
    marginTop: theme.spacing(2),
  },
  versionChip: {
    marginLeft: theme.spacing(1),
  },
}))

interface DownloadOption {
  platform: string
  arch: string
  filename: string
  icon: React.ReactNode
  installCommand?: string
  description: string
}

export const Downloads: React.FC = () => {
  const classes = useStyles()
  const version = 'v1.5.0'
  const baseUrl = window.location.origin

  const downloads: DownloadOption[] = [
    {
      platform: 'Linux',
      arch: 'AMD64',
      filename: 'netclient-linux-amd64',
      icon: <LinuxIcon className={classes.platformIcon} />,
      description: 'For most Linux distributions (Ubuntu, Debian, CentOS, etc.)',
      installCommand: `# Download
wget ${baseUrl}/dl/netclient-linux-amd64
chmod +x netclient-linux-amd64
sudo mv netclient-linux-amd64 /usr/local/bin/netclient

# Register with your network
sudo netclient register -t YOUR_ENROLLMENT_TOKEN`,
    },
    {
      platform: 'Linux',
      arch: 'ARM64',
      filename: 'netclient-linux-arm64',
      icon: <LinuxIcon className={classes.platformIcon} />,
      description: 'For ARM64 devices (Raspberry Pi 4, AWS Graviton, etc.)',
      installCommand: `# Download
wget ${baseUrl}/dl/netclient-linux-arm64
chmod +x netclient-linux-arm64
sudo mv netclient-linux-arm64 /usr/local/bin/netclient

# Register with your network
sudo netclient register -t YOUR_ENROLLMENT_TOKEN`,
    },
    {
      platform: 'Linux',
      arch: 'ARM',
      filename: 'netclient-linux-arm',
      icon: <LinuxIcon className={classes.platformIcon} />,
      description: 'For 32-bit ARM devices (Raspberry Pi 3 and older)',
      installCommand: `# Download
wget ${baseUrl}/dl/netclient-linux-arm
chmod +x netclient-linux-arm
sudo mv netclient-linux-arm /usr/local/bin/netclient

# Register with your network
sudo netclient register -t YOUR_ENROLLMENT_TOKEN`,
    },
    {
      platform: 'Windows',
      arch: 'AMD64',
      filename: 'netclient-windows-amd64.exe',
      icon: <WindowsIcon className={classes.platformIcon} />,
      description: 'For Windows 10/11 (64-bit)',
      installCommand: `# Download and run as Administrator
# Then register with your network:
netclient.exe register -t YOUR_ENROLLMENT_TOKEN`,
    },
    {
      platform: 'macOS',
      arch: 'Intel',
      filename: 'netclient-darwin-amd64',
      icon: <AppleIcon className={classes.platformIcon} />,
      description: 'For Intel-based Macs',
      installCommand: `# Download
curl -O ${baseUrl}/dl/netclient-darwin-amd64
chmod +x netclient-darwin-amd64
sudo mv netclient-darwin-amd64 /usr/local/bin/netclient

# Register with your network
sudo netclient register -t YOUR_ENROLLMENT_TOKEN`,
    },
    {
      platform: 'macOS',
      arch: 'Apple Silicon',
      filename: 'netclient-darwin-arm64',
      icon: <AppleIcon className={classes.platformIcon} />,
      description: 'For M1/M2/M3 Macs',
      installCommand: `# Download
curl -O ${baseUrl}/dl/netclient-darwin-arm64
chmod +x netclient-darwin-arm64
sudo mv netclient-darwin-arm64 /usr/local/bin/netclient

# Register with your network
sudo netclient register -t YOUR_ENROLLMENT_TOKEN`,
    },
    {
      platform: 'FreeBSD',
      arch: 'AMD64',
      filename: 'netclient-freebsd-amd64',
      icon: <LinuxIcon className={classes.platformIcon} />,
      description: 'For FreeBSD systems',
      installCommand: `# Download
fetch ${baseUrl}/dl/netclient-freebsd-amd64
chmod +x netclient-freebsd-amd64
sudo mv netclient-freebsd-amd64 /usr/local/bin/netclient

# Register with your network
sudo netclient register -t YOUR_ENROLLMENT_TOKEN`,
    },
  ]

  return (
    <Container className={classes.root} maxWidth="lg">
      <Box className={classes.header}>
        <Typography variant="h3" component="h1" gutterBottom>
          Download Netclient
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Install the Netclient on your devices to join your Netmaker networks
          <Chip
            label={version}
            color="primary"
            size="small"
            className={classes.versionChip}
          />
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Quick Start:</strong> Download the client for your platform,
          then use an Enrollment Key from your network to register the device.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {downloads.map((download, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Box textAlign="center">{download.icon}</Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {download.platform}
                  <Chip
                    label={download.arch}
                    size="small"
                    sx={{ ml: 1 }}
                    variant="outlined"
                  />
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {download.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  className={classes.downloadButton}
                  href={`/dl/${download.filename}`}
                  download
                >
                  Download {download.filename}
                </Button>

                {download.installCommand && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 2, mb: 1 }}
                      color="textSecondary"
                    >
                      Installation:
                    </Typography>
                    <Box className={classes.codeBlock}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {download.installCommand}
                      </pre>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Mobile Devices (Android & iOS)
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          paragraph
          textAlign="center"
        >
          For mobile devices, use the official WireGuard app with Netmaker's
          Ingress Gateway
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardContent>
                <Box textAlign="center">
                  <AppleIcon className={classes.platformIcon} />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  iOS / iPadOS
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Download the official WireGuard app from the App Store
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  href="https://apps.apple.com/us/app/wireguard/id1441195209"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 2 }}
                >
                  Download from App Store
                </Button>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>How to connect:</strong>
                    <br />
                    1. Create an Ingress Gateway in your network
                    <br />
                    2. Generate an External Client config
                    <br />
                    3. Scan the QR code or import the config file
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardContent>
                <Box textAlign="center">
                  <LinuxIcon className={classes.platformIcon} />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Android
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Download the official WireGuard app from Google Play or
                  as a Direct APK
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    href="https://play.google.com/store/apps/details?id=com.wireguard.android"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Play
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    href="https://download.wireguard.com/android-client/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Direct APK
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>How to connect:</strong>
                    <br />
                    1. Create an Ingress Gateway in your network
                    <br />
                    2. Generate an External Client config
                    <br />
                    3. Scan the QR code or import the config file
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Alert severity="success">
            <Typography variant="body2">
              <strong>Why use WireGuard app instead of Netclient?</strong>
              <br />
              • No root access required
              <br />
              • Better battery optimization
              <br />
              • Native mobile experience
              <br />
              • Official support and updates
              <br />• Works seamlessly with Netmaker's Ingress Gateway
            </Typography>
          </Alert>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Note:</strong> Make sure WireGuard is installed on your
            system before running Netclient. Visit{' '}
            <Link
              href="https://www.wireguard.com/install/"
              target="_blank"
              rel="noopener"
            >
              wireguard.com/install
            </Link>{' '}
            for installation instructions.
          </Typography>
        </Alert>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Need help? Check out the{' '}
          <Link href="https://docs.netmaker.io" target="_blank" rel="noopener">
            documentation
          </Link>{' '}
          or join our{' '}
          <Link
            href="https://discord.gg/zRb9Vfhk8A"
            target="_blank"
            rel="noopener"
          >
            Discord community
          </Link>
          .
        </Typography>
      </Box>
    </Container>
  )
}
