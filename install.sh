#!/bin/bash

# Set variables
# -----------------------------------
DREAMBOT_GITHUB_FOLDER_NAME="dreambot1.0.0"
DREAMBOT_GITHUB_FILE_NAME="dreambot-1.0.0"


# Set functions
# -----------------------------------
logMessage () {
  echo " $1"
  echo " ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
}


echo ""
echo " ============================================================"
echo "           Instalador TraderBot - DreamersTraders.com"
echo ""
echo "                Esto tomará algunos minutos"
echo ""
echo " ============================================================"
echo ""

logMessage "(1/6) Actualizando la Base del sistema"
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
apt-get -qq update > /dev/null 2>&1


logMessage "(2/6) Instalando nodejs 6.x"
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
curl -qsL https://deb.nodesource.com/setup_6.x | bash - > /dev/null 2>&1
apt-get -y -qq install nodejs > /dev/null 2>&1


logMessage "(3/6) Instalando Herramientas"
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
apt-get -y -qq install unzip > /dev/null 2>&1
npm install -g pm2 yo@1.8.5 generator-dreambot dreambot-monitor > /dev/null 2>&1


logMessage "(4/6) Instalando TraderBot"
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

wget -q https://github.com/DreamersTraders/dreambot/releases/download/dreambot1.0.0/dreambot-1.0.0.zip -P /opt/
unzip -o -qq /opt/${DREAMBOT_GITHUB_FILE_NAME}.zip -d /opt/unzip-tmp

# create folder for the current version.
sudo mkdir /opt/${DREAMBOT_GITHUB_FILE_NAME} -p

# Copy only the executables.
cp /opt/unzip-tmp/dreambot-* /opt/${DREAMBOT_GITHUB_FILE_NAME}

# creates a symbolic link to the DREAMBOT folder.
rm /opt/dreambot > /dev/null 2>&1
ln -s /opt/${DREAMBOT_GITHUB_FILE_NAME} /opt/dreambot

# Cleanup
sudo rm /opt/${DREAMBOT_GITHUB_FILE_NAME}.zip
sudo rm -R /opt/unzip-tmp

# Set rights
sudo chmod +x /opt/dreambot/dreambot-*



logMessage "(5/6) Agregando los comandos"
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
echo "" >> ~/.bashrc
echo "# dreambot ALIASES" >> ~/.bashrc
echo "alias gcd='cd /opt/dreambot'" >> ~/.bashrc
echo "alias ginit='gcd && yo dreambot init'" >> ~/.bashrc
echo "alias gadd='gcd && yo dreambot add'" >> ~/.bashrc
echo "alias gl='pm2 l'" >> ~/.bashrc
echo "alias glog='pm2 logs'" >> ~/.bashrc
echo "alias gstart='pm2 start'" >> ~/.bashrc
echo "alias gstop='pm2 stop'" >> ~/.bashrc



logMessage "(6/6) Generador de archivos"
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Create folder for yeoman.
sudo chmod g+rwx /root
sudo chmod g+rwx /opt/dreambot

# Yeoman write rights.
sudo mkdir /root/.config/configstore -p
cat > /root/.config/configstore/insight-yo.json << EOM
{
        "clientId": 1337,
        "optOut": true
}
EOM
sudo chmod g+rwx /root/.config
sudo chmod g+rwx /root/.config/configstore
sudo chmod g+rw /root/.config/configstore/*

# pm2 write rights.
sudo mkdir /root/.pm2 -p
echo "1337" > /root/.pm2/touch
sudo chmod g+rwx /root/.pm2
sudo chmod g+rw /root/.pm2/*


echo ""
echo " ============================================================"
echo "                   Configuración completa!"
echo ""
echo "         Por favor corra los siguientes comandos "
echo "                 para iniciar el TraderBot:"
echo "                           gcd"
echo "                           ginit"
echo ""
echo " ============================================================"
echo ""
