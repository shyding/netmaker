import React, { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Typography,
    Tabs,
    Tab,
    Box,
    Divider,
} from '@mui/material'
import { useHistory } from 'react-router-dom'

interface QuickStartModalProps {
    open: boolean
    onClose: () => void
}

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`guide-tabpanel-${index}`}
            aria-labelledby={`guide-tab-${index}`}
            {...other}
            style={{ paddingTop: '16px' }}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    )
}

function a11yProps(index: number) {
    return {
        id: `guide-tab-${index}`,
        'aria-controls': `guide-tabpanel-${index}`,
    }
}

export const QuickStartModal: React.FC<QuickStartModalProps> = ({
    open,
    onClose,
}) => {
    const [activeStep, setActiveStep] = useState(0)
    const [tabValue, setTabValue] = useState(0)
    const history = useHistory()

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    }

    const steps = [
        {
            label: '1. Create a Network | 创建网络',
            description: 'Start by defining your virtual network subnet. This is the foundation where all your devices will communicate. (第一步：划定你的虚拟局域网网段)',
            action: () => history.push('/networks'),
            actionText: 'Go to Networks',
        },
        {
            label: '2. Generate an Enrollment Key | 生成注册密钥',
            description: 'Keys are required to authorize new devices to join your network securely. You define how many times and for how long a key can be used. (第二步：生成密钥，用于设备安全授权接入)',
            action: () => history.push('/enrollment-keys'),
            actionText: 'Go to Keys',
        },
        {
            label: '3. Install Netclient on Nodes | 下载客户端并连网',
            description: 'Install the Netclient on your PCs or Servers. Run the register command with the key from Step 2. They will automatically form a mesh network. (第三步：在电脑或服务器上安装网客，输入密钥自动组网)',
            action: () => history.push('/downloads'),
            actionText: 'Go to Downloads',
        },
        {
            label: '4. Setup External Clients | 手机与外设接入',
            description: 'Use Case (使用场景): For mobile phones (Android/iOS) or routers that can only run standard WireGuard. How to use (使用方法): First, go to Nodes and make one Node an "Ingress Gateway". Then come here to generate a config file or QR code for your phone.',
            action: () => history.push('/ext-clients'),
            actionText: 'Go to Ext Clients',
        },
    ]

    const handleNext = () => setActiveStep((prev) => prev + 1)
    const handleBack = () => setActiveStep((prev) => prev - 1)
    const handleReset = () => setActiveStep(0)

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Netmaker Guides & Tutorials (系统指南与进阶教程)</DialogTitle>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="guide tabs" variant="scrollable" scrollButtons="auto">
                    <Tab label="1. Quick Start (新手起步)" {...a11yProps(0)} />
                    <Tab label="2. Core Concepts (核心概念)" {...a11yProps(1)} />
                    <Tab label="3. Scenarios (场景实战)" {...a11yProps(2)} />
                    <Tab label="4. Installation (安装与自启)" {...a11yProps(3)} />
                </Tabs>
            </Box>

            <DialogContent dividers sx={{ minHeight: '400px' }}>

                {/* TAB 1: QUICK START */}
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" gutterBottom>Quick Start Guide</Typography>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>{step.label}</StepLabel>
                                <StepContent>
                                    <Typography>{step.description}</Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Button variant="contained" onClick={() => { step.action(); onClose(); }} size="small" sx={{ mr: 1 }}>
                                            {step.actionText}
                                        </Button>
                                        <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>Back</Button>
                                        <Button variant="outlined" onClick={index === steps.length - 1 ? handleReset : handleNext} sx={{ mt: 1, mr: 1 }}>
                                            {index === steps.length - 1 ? 'Finish' : 'Next'}
                                        </Button>
                                    </Box>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </TabPanel>

                {/* TAB 2: CORE CONCEPTS */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" color="primary" gutterBottom>1. Node (节点 / 智能核心)</Typography>
                    <Typography variant="body2" paragraph>
                        <strong>What is it?</strong> A device (Linux/Win/Mac) that has the `netclient` software installed. <br />
                        <strong>工作原理与关联：</strong> Node 拥有"大脑"。它作为后台守护进程一直与 Netmaker 服务器保持长连接。当网络发生变化时（例如新增网段），服务器会自动指挥所有 Node 瞬间更新其本机的系统路由表（Routing Tables）和 WireGuard 配置，实现真正的**全自动化动态组网 (Dynamic Mesh)**。节点之间使用 UDP 打洞技术实现**点对点直连通讯 (P2P)**，延迟极低。
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" color="primary" gutterBottom>2. External Client (外部客户端 / 被动终端)</Typography>
                    <Typography variant="body2" paragraph>
                        <strong>What is it?</strong> A device (like a smartphone, iOS/Android, or old router) that CANNOT install `netclient`, but can run the standard WireGuard App. <br />
                        <strong>工作原理与区别：</strong> 外设只有"四肢"没有"大脑"。它只能扫一个死的二维码或导一个固定的 `.conf` 文件。因为不能自动更新路由，它**必须**连接到一个特定的 Node（也就是 Ingress Gateway 入口网关），通过这个跳板机去访问整个网络。它的拓扑结构是**星型 (Hub-and-Spoke)** 的被动转发模式。
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" color="primary" gutterBottom>3. Ingress & Egress Gateway (入口与出口网关)</Typography>
                    <Typography variant="body2" paragraph>
                        <strong>Ingress (入口网关)：</strong> 将某个 Node 变成一个“大门”，允许手机等 External Client 通过这扇大门进入 Netmaker 虚机局域网。<br />
                        <strong>Egress (出口网关)：</strong> 将某个 Node 变成一个“路由器”，允许 Netmaker 网内的所有虚拟设备，通过这个 Node 去访问其背后的物理局域网（比如办公室里的打印机 192.168.1.100）。这就实现了真正的 **Site-to-Site (异地组网)**。
                    </Typography>
                </TabPanel>

                {/* TAB 3: SCENARIOS */}
                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" color="secondary" gutterBottom>Scenario 1: P2P Communication (点对点直连打通)</Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 3, pl: 2, borderLeft: '4px solid #1976d2' }}>
                        <strong>Goal:</strong> Securely connect your PC at home directly to your Server in AWS.<br />
                        <strong>Steps:</strong>
                        <ol>
                            <li>Create a Network (e.g., `10.101.0.0/16`).</li>
                            <li>Generate an Enrollment Key.</li>
                            <li>Install `netclient` on BOTH your PC and the AWS Server using that key.</li>
                            <li><strong>Result:</strong> They both become <strong>Nodes</strong>. They can immediately `ping` each other using their 10.101.x.x IPs over an encrypted P2P tunnel, bypassing NAT.</li>
                        </ol>
                    </Typography>

                    <Typography variant="h6" color="secondary" gutterBottom>Scenario 2: Site-to-Site VPN (异地局域网互联)</Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 3, pl: 2, borderLeft: '4px solid #9c27b0' }}>
                        <strong>Goal:</strong> Connect your Home LAN (`192.168.1.0/24`) to your Office LAN (`10.0.60.0/24`) so all devices can talk without installing VPN clients everywhere.<br />
                        <strong>Steps:</strong>
                        <ol>
                            <li>Put a Linux machine (e.g., Raspberry Pi) in Home LAN and another in Office LAN. Install `netclient` on both.</li>
                            <li>In the UI Dashboard, go to Nodes. Set the Office Node as an <strong>Egress Gateway</strong> for `10.0.60.0/24`.</li>
                            <li>Set the Home Node as an <strong>Egress Gateway</strong> for `192.168.1.0/24`.</li>
                            <li><strong>Result:</strong> Netmaker automatically pushes Linux static routes to both Nodes. Your Home PC can now ping Office printers directly. <strong style={{ color: 'red' }}>WARNING: The subnets cannot overlap! (网段绝对不能冲突和重叠)</strong></li>
                        </ol>
                    </Typography>

                    <Typography variant="h6" color="secondary" gutterBottom>Scenario 3: Global Proxy / VPN (科学上网与流量接管)</Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2, borderLeft: '4px solid #ed6c02' }}>
                        <strong>Goal:</strong> Route ALL internet traffic from your phone securely through an overseas Server.<br />
                        <strong>Steps:</strong>
                        <ol>
                            <li>Install `netclient` on your overseas Server to make it a Node.</li>
                            <li>In Nodes UI, make this Server an <strong>Ingress Gateway</strong> (so phones can connect).</li>
                            <li>Also make this Server an <strong>Egress Gateway</strong> for the network `0.0.0.0/0` (which means "everything outside").</li>
                            <li>Go to Ext Clients UI, generate a WireGuard Config/QR code for your phone. Scan it on the WireGuard App.</li>
                            <li><strong>Result:</strong> Phone connects to the Ingress, and the Egress rule forces all packets to exit via the overseas server.</li>
                        </ol>
                    </Typography>
                </TabPanel>

                {/* TAB 4: INSTALLATION */}
                <TabPanel value={tabValue} index={3}>
                    <Typography variant="h6" gutterBottom>Installation & Auto-Start Details (安装与开机自启机制)</Typography>
                    <Typography variant="body2" paragraph>
                        <strong>How `netclient` installs:</strong><br />
                        When you run the installation command (e.g., `curl -sL https://nm.example.com/install | sh...`), the script downloads the Netclient binary directly to `/usr/bin/netclient` or `/sbin/netclient`.
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <strong>Systemd Auto-Start (开机自启):</strong><br /><br />
                        The installer automatically creates a standard Linux <code>systemd</code> daemon service located at <code>/etc/systemd/system/netclient.service</code>.<br />
                        It runs <code>systemctl enable --now netclient</code> during installation.<br />
                        <strong>This means the VPN tunnel will automatically survive reboots and start up headless on boot. (完全无人值守，开机即自动组网)</strong>
                    </Typography>

                    <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                        <strong>Useful Commands for Troubleshooting (常用查错命令):</strong>
                    </Typography>
                    <ul>
                        <li><Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>sudo systemctl status netclient</Typography> - Check if the background daemon is running smoothly.</li>
                        <li><Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>sudo journalctl -u netclient -f</Typography> - Read the real-time logs (Very useful if a Node shows "Unavailable").</li>
                        <li><Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>sudo systemctl restart netclient</Typography> - Force the daemon to grab the latest routing tables from the server.</li>
                        <li><Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>sudo netclient pull</Typography> - Manually force a pull of the latest network topology configurations.</li>
                    </ul>
                </TabPanel>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">Got it / 明白啦</Button>
            </DialogActions>
        </Dialog>
    )
}
