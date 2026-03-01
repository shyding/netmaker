import React from 'react'
import { useTranslation } from 'react-i18next'
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
    backgroundColor: theme.palette.grey[100],
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
  const { t } = useTranslation()
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
wget ${baseUrl}/downloads/netclient-linux-amd64
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
wget ${baseUrl}/downloads/netclient-linux-arm64
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
wget ${baseUrl}/downloads/netclient-linux-arm
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
curl -O ${baseUrl}/downloads/netclient-darwin-amd64
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
curl -O ${baseUrl}/downloads/netclient-darwin-arm64
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
fetch ${baseUrl}/downloads/netclient-freebsd-amd64
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
                  href={`/downloads/${download.filename}`}
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
