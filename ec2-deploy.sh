#!/bin/bash
# ============================================================
# EC2 PE YEH SCRIPT RUN KARO (AWS Console > EC2 > Connect > Session Manager)
# Ya SSH se: ssh -i kosmico-key.pem ec2-user@3.7.180.215
# Phir: bash <(curl -s https://raw.githubusercontent.com/...) 
# ============================================================

echo "=== Kosmico Backend Deploy ==="

# App directory find karo
if [ -d "/home/ec2-user/app" ]; then
  APP="/home/ec2-user/app"
elif [ -d "/home/ec2-user/backend" ]; then
  APP="/home/ec2-user/backend"
elif [ -d "/var/www/app" ]; then
  APP="/var/www/app"
else
  echo "App directory nahi mili!"
  ls /home/ec2-user/
  exit 1
fi

echo "App found at: $APP"

# Git pull karo
cd "$APP"
git pull origin main

# PM2 restart
if command -v pm2 &>/dev/null; then
  pm2 restart all
  pm2 list
else
  echo "PM2 nahi hai, manually restart karo"
fi

echo "=== Done! ==="
