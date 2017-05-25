#!/usr/bin/env bash

#
# Root:
if [[ "$EUID" -ne 0 ]]; then
    echo "Error! Run as \"sudo\". E.g. \"sudo ./install.Hotspot.sh\"."

    exit
fi

#
# Hostapd & Udhcpd:
sudo apt-get install -y --force-yes hostapd
sudo apt-get install -y --force-yes dnsmasq

sudo systemctl disable hostapd
sudo systemctl disable dnsmasq

#
# Config Hostapd:
sudo echo "DAEMON_CONF=\"/etc/hostapd/hostapd.conf\"" > /etc/default/hostapd

sudo cp hostapd.conf /etc/hostapd/hostapd.conf
#
# Random Number:
RandomNr=$(( RANDOM % (9999 - 1000 + 1 ) + 1000 ))

sudo sed -i.old "s/{randomNr}/${RandomNr}/" /etc/hostapd/hostapd.conf

#
# Config Dnsmasq:
sudo cp dnsmasq.conf /etc/dnsmasq.conf