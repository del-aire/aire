#!/usr/bin/env bash

#
# Temporary Directory:
TmpDirectory=/root/tmpNode

#
# Node.js Binary:
Binary="https://nodejs.org/dist/v7.10.0/node-v7.10.0-linux-{armVersion}.tar.gz"

#
# Different Architecture for the Pi 3 & Pi Zero:
ArmVersion=$(uname -m)

#
# Root:
if [[ "$EUID" -ne 0 ]]; then
    echo "Error! Run as \"sudo\". E.g. \"sudo ./install.Node.sh\"."

    exit
fi

#
# Installation of Node.js:
DownloadUri=$(echo ${Binary} | sed -e "s/{armVersion}/${ArmVersion}/g")

#
# Similar to "node-v7.10.0-linux-armv7l.tar.gz":
NodePackageName=${DownloadUri##*/}
#
# The Location of the Un-Tarred Binary:
NodeTmpInstallDir=$(echo ${NodePackageName} | sed "s/.tar.gz/\//")

# Go to the Temporary Location & Start to Download:
mkdir ${TmpDirectory} && cd ${TmpDirectory} && wget ${DownloadUri}
# Un-Tar & Cleanup:
tar -xzf ${NodePackageName} && rm ${NodePackageName}

#
# Removal of Old Version:
rm -R -f /opt/nodejs

#
# Cleanup "ln":
rm /usr/bin/node /usr/sbin/node /sbin/node /sbin/node /usr/local/bin/node /usr/bin/npm /usr/sbin/npm /sbin/npm /usr/local/bin/npm

#
# Copy Node:
mv ${NodeTmpInstallDir} /opt/nodejs

#
# Link Node:
sudo ln -s /opt/nodejs/bin/node /usr/bin/node
sudo ln -s /opt/nodejs/bin/node /usr/sbin/node
sudo ln -s /opt/nodejs/bin/node /sbin/node
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node

#
# Link Npm:
sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
sudo ln -s /opt/nodejs/bin/npm /usr/sbin/npm
sudo ln -s /opt/nodejs/bin/npm /sbin/npm
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm

rm -R -f ${TmpDirectory}

#
# Output the Node.js Version:
echo "Successfully Installed Node.js $(node -v) & Npm!"