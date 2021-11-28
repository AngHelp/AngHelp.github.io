#!/bin/bash
# Skrypt który pozwala na generowanie strony na Vercel

# Instalowanie komendy `wget`
yum install wget -y &&

# Instalowanie najnowszej wersji Go za pomocą https://github.com/canha/golang-tools-install-script
{ wget -q -O - https://git.io/vQhTU | bash } &&
source /vercel/.bashrc &&

# Uruchamianie generatora
go run generator.go