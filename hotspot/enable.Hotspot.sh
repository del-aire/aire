#!/usr/bin/env bash

#
# Root:
if [[ "$EUID" -ne 0 ]]; then
    echo "Error! Run as \"sudo\". E.g. \"sudo ./enable.Hotspot.sh\"."

    exit
fi

#
# Copy Interfaces:
if [[ $(uname -m) -eq "armv7l" ]]; then
    sudo cp interface.Pi.3.conf /etc/network/interfaces
else
    sudo cp interface.Pi.Zero.conf /etc/network/interfaces
fi

#
# Enable & Start:
sudo systemctl enable hostapd
sudo systemctl enable dnsmasq

sudo systemctl start hostapd
sudo systemctl start dnsmasq

#
# Reboot:
sudo reboot now