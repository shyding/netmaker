import React, { useState, useEffect } from 'react'
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
} from '@mui/material'
import { useHistory } from 'react-router-dom'

interface QuickStartModalProps {
    open: boolean
    onClose: () => void
}

export const QuickStartModal: React.FC<QuickStartModalProps> = ({
    open,
    onClose,
}) => {
    const [activeStep, setActiveStep] = useState(0)
    const history = useHistory()

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
            description: 'Use Case (使用场景): For mobile phones (Android/iOS) or routers that can only run standard WireGuard. How to use (使用方法): First, go to Nodes and make one Node an "Ingress Gateway". Then come here to generate a standard WireGuard config file or QR code for your phone to scan and join the network.',
            action: () => history.push('/ext-clients'),
            actionText: 'Go to Ext Clients',
        },
    ]

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const handleReset = () => {
        setActiveStep(0)
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Quick Start Guide</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                            <StepContent>
                                <Typography>{step.description}</Typography>
                                <div style={{ marginTop: '1rem' }}>
                                    <Button
                                        variant="contained"
                                        onClick={step.action}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        {step.actionText}
                                    </Button>
                                    <Button
                                        disabled={index === 0}
                                        onClick={handleBack}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={index === steps.length - 1 ? onClose : handleNext}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        {index === steps.length - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length && (
                    <div style={{ marginTop: '1rem' }}>
                        <Typography>All steps completed - you&apos;re ready to go!</Typography>
                        <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                            Reset
                        </Button>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}
