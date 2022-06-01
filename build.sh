#!/bin/bash

# Update all submodules
git submodule update --init --recursive

# Download pwsh functionality
dotnet tool install --global PowerShell

############################
# Nine Chronicles Unity
#---------------------------
# https://docs.nine-chronicles.com/unity-guide


# Clone Unity project
git clone https://github.com/planetarium/NineChronicles.git

# Create hooks and clone submodules
git config core.hooksPath hooks && git submodule update --init --recursive


# Build Unity Project

C:\Program Files\Unity\Hub\Editor\2020.3.4f1\Editor\Unity -quit -batchmode -projectPath=/path/to/nekoyume/ -executeMethod Editor.Builder.BuildWindows

yarn run pack-all << break down this process



build-player.ps1

& "C:\Program Files\Unity\Hub\Editor\2020.3.4f1\Editor\Unity" -batchmode -nographics -logFile -projectPath NineChronicles\nekoyume -executeMethod "Editor.Builder.BuildWindows"


#Get-ChildItem -Path NineChronicles\nekoyume\Build\Windows -Recurse -File | Move-Item -Destination dist\
#Get-ChildItem -Path NineChronicles\nekoyume\Build\Windows -Recurse -Directory | Move-Item -Destination dist\