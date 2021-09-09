#!/bin/bash

function clean() {
    rm -rf ./deb

    rm -rf ./pack

    rm -rf ./dist

    rm -rf ./NineChronicles/nekoyume/Build

    rm -rf ./Library

    rm -rf ./ProjectSettings

    rm -rf ./UserSettings

    rm -rf ./Temp
}

function cleanAll() {
    clean

    rm -rf ./NineChronicles

    rm -rf ./NineChronicles.Headless
}

case $1 in

  --clean)
    clean
    exit 0
    ;;

  --clean-all)
    cleanAll
    exit 0
    ;;

esac