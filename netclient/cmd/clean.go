/*
Copyright © 2022 Netmaker Team <info@netmaker.io>
*/
package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"

	"github.com/spf13/cobra"
)

// cleanCmd represents the clean command
var cleanCmd = &cobra.Command{
	Use:   "clean",
	Short: "clean windows netclient installation",
	Long:  `forcefully stop services, kill processes, and delete installation directory (Windows only)`,

	Run: func(cmd *cobra.Command, args []string) {
		if runtime.GOOS != "windows" {
			fmt.Println("clean command is strictly for Windows users.")
			return
		}

		fmt.Println("Running Windows Cleanup routine...")

		// Ignore errors as the service or process might not exist
		exec.Command("sc", "stop", "netclient").Run()
		exec.Command("sc", "delete", "netclient").Run()
		exec.Command("taskkill", "/F", "/IM", "netclient.exe", "/T").Run()
		exec.Command("taskkill", "/F", "/IM", "netclient-windows-amd64.exe", "/T").Run()

		err := os.RemoveAll("C:\\Program Files (x86)\\Netclient")
		if err != nil {
			fmt.Printf("Error deleting directory: %v\n", err)
		} else {
			fmt.Println("Successfully removed C:\\Program Files (x86)\\Netclient directory.")
		}

		fmt.Println("Cleanup complete. Node is ready for a fresh join.")
	},
}

func init() {
	rootCmd.AddCommand(cleanCmd)
}
