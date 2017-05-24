#!/usr/bin/env bash

#
# Root:
if [[ "$EUID" -ne 0 ]]; then
    echo "Error! Run as \"sudo\". E.g. \"sudo ./install.Service.sh\"."

    exit
fi

#
# Copy the Service File:
cp aire.service /lib/systemd/system/aire.service