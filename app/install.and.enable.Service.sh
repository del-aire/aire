#!/usr/bin/env bash

#
# Root:
if [[ "$EUID" -ne 0 ]]; then
    echo "Error! Run as \"sudo\". E.g. \"sudo ./install.and.enable.Service.sh\"."

    exit
fi

#
# Copy the Service File:
cp aire-app.service /lib/systemd/system/aire-app.service

#
# Enable & Start:
sudo systemctl enable aire-app
sudo systemctl restart aire-app