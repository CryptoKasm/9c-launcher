#!/bin/bash

date=$(date -R)
latestApvNumber="$(npm run --silent latest-apv-no)"

#-----------------------------------------
# Tasks
#   - Create package name
#   - Check if package exists and clean
#   - Create directory structure
#   - Generate control file
#   - Copy package to deb
#   - Build .deb
#-----------------------------

# General
name="nine-chronicles"
description="Nine Chronicles, a fully decentralized idle MMORPG powered by the community!"
maintainer="CryptoKasm <hello@cryptokasm.io>"
tag="${latestApvNumber:0:1}.${latestApvNumber:4:2}" #pull current tag
revision="0"
version="$tag-$revision"
architecture="amd64"
dependencies="libc6-dev"
#, libasound2 (>= 1.0.16), libatk-bridge2.0-0 (>= 2.5.3), libatk1.0-0 (>= 2.2.0), libatspi2.0-0 (>= 2.9.90), libc6 (>= 2.16), libcairo2 (>= 1.6.0), libcups2 (>= 1.7.0), libdbus-1-3 (>= 1.9.14), libdrm2 (>= 2.4.38), libexpat1 (>= 2.0.1), libgbm1 (>= 17.1.0~rc2), libgcc-s1 (>= 3.0), libgdk-pixbuf2.0-0 (>= 2.22.0), libglib2.0-0 (>= 2.39.4), libgtk-3-0 (>= 3.19.12), libnspr4 (>= 2:4.9-2~), libnss3 (>= 2:3.22), libpango-1.0-0 (>= 1.14.0), libpangocairo-1.0-0 (>= 1.14.0), libx11-6 (>= 2:1.4.99.1), libx11-xcb1 (>= 2:1.6.9), libxcb-dri3-0, libxcb1 (>= 1.6), libxcomposite1 (>= 1:0.4.5), libxcursor1 (>> 1.1.2), libxdamage1 (>= 1:1.1), libxext6, libxfixes3 (>= 1:5.0), libxi6 (>= 2:1.2.99.4), libxrandr2 (>= 2:1.2.99.3), libxrender1, libxss1, libxtst6"

# Package
packageName="${name}_${version}_${architecture}"
packageOutput="./deb"
packageWorkspace="$packageOutput/$packageName"
packageDeb="$packageOutput/$packageName.deb"
packageSrc="./pack/Nine Chronicles-linux-x64"
packageInstall="$packageWorkspace/opt/planetarium/${name}"
packageShortcut="$packageWorkspace/usr/share/applications/${name}.desktop"
packageTemp=$packageOutput/.temp

# Generated Files
distribution="stable"
urgency="high"

# Misc
gameDir="$packageInstall/resources/app"

#-----------------------------

function prepareDir() {
    # Cleaning old files
    if [ -d $packageOutput ]; then
        rm -rf $packageOutput 
    fi

    # Creating new directories
    mkdir -p $packageTemp
    mkdir -p $packageWorkspace/DEBIAN
    mkdir -p $packageWorkspace/debian
    mkdir -p $packageInstall
    mkdir -p $packageWorkspace/usr/share/applications
    mkdir -p $gameDir
}

function copyToDeb() {
    # Copying package to deb 
    if [ -d "$packageSrc" ]; then
        cp -R "$packageSrc"/* $packageInstall
    else
        echo "Missing $packageSrc"
        exit 1
    fi

    # Copying logo icon to deb
    if [ -f ./src/main/resources/logo.png ]; then
        cp ./src/main/resources/logo.png $packageInstall/resources/logo.png
    fi
}

function fetchOfficialConfigs() {
    # Download official launcher config
    configUrl="https://download.nine-chronicles.com/9c-launcher-config.json"
    savePath="$gameDir/config.json"

    curl $configUrl -o $savePath
    echo
    cat $savePath
}

function createDesktopFile() {
    # Generate .desktop shortcut file
    cat <<EOF >>$packageShortcut
[Desktop Entry]
Name=Nine Chronicles
Comment=Nine Chronicles, a fully decentralized idle MMORPG powered by the community!
Version=$version
Type=Application
Terminal=false
StartupNotify=true
Exec=/opt/planetarium/nine-chronicles/"Nine Chronicles"
Icon=/opt/planetarium/nine-chronicles/resources/logo.png
Categories=Game;
EOF
}

function generateControl() {
    # Generating .deb control file
        # Section, Priority, Essential, Large Description, Binary, Files, Installed-Size
    cat <<EOF >>$packageWorkspace/DEBIAN/control
Package: $name
Description: $description
Maintainer: $maintainer
Version: $version
Architecture: $architecture
Depends: $dependencies
Homepage: https://nine-chronicles.com/
Website: https://nine-chronicles.com/
EOF
}

function generateRules() {
    # Generate .deb rules file
    cat <<EOF >>$packageWorkspace/debian/rules
#!/usr/bin/make -f

%:
        dh $@

EOF
}

function generateCopyright() {
    cp ./LICENSE $packageWorkspace/debian/copyright
}

function generateChangelog() {
    getDir=$(pwd)
    currentDir=$getDir
    launcherDir="./"
    gameDir="./NineChronicles"
    headlessDir="./NineChronicles.Headless"
    lib9cDir="./NineChronicles.Headless/Lib9c"
    libplanetDir="./NineChronicles.Headless/Lib9c/.Libplanet"
    mergedChangelog="$packageTemp/merged.changelog"

    # Pull git logs and clean up
    function fetchCommits() {
        goTo=$2
        goBack=$currentDir
        tempChangelog="$1.changelog"
        gitLogs=("git log --pretty=format:%s `git tag --sort=-committerdate | head -1`...`git tag --sort=-committerdate | head -2 | awk '{split($0, tags, "\n")} END {print tags[1]}'`")

        cd $goTo
        
        $gitLogs > $tempChangelog

        cd $goBack
    }

    function collectChangelog() {
        if [ -f $2/$1.changelog ]; then
            mv $2/$1.changelog $packageTemp/$1.changelog
        fi
    }

    function filterCommits() {
        if [ -f $packageTemp/$1.changelog ]; then
            sed -i '/Merge pull request/,/^/d' $packageTemp/$1.changelog
            sed -i '/Bump/,/^/d' $packageTemp/$1.changelog              
        fi    
    }

    function mergeChangelogs() {
        if [ -f $packageTemp/$1.changelog ]; then
            if [ -s $packageTemp/$1.changelog ]; then
                commitLines="$packageTemp/$1.changelog"

                while IFS='' read -r commit || [[ -n "${commit}" ]]; do
                    echo "   * ($1) $commit" >> $mergedChangelog
                done < $commitLines
            fi
        fi
    }

    function launcher() {
        fetchCommits launcher $launcherDir
        collectChangelog launcher $launcherDir
        filterCommits launcher
        mergeChangelogs launcher
    }

    function game() {
        fetchCommits game $gameDir
        collectChangelog game $gameDir
        filterCommits game
        mergeChangelogs game
    }

    function headless() {
        fetchCommits headless $headlessDir
        collectChangelog headless $headlessDir
        filterCommits headless
        mergeChangelogs headless
    }

    function lib9c() {
        fetchCommits lib9c $lib9cDir
        collectChangelog lib9c $lib9cDir
        filterCommits lib9c
        mergeChangelogs lib9c
    }

    function libplanet() {
        fetchCommits libplanet $libplanetDir
        collectChangelog libplanet $libplanetDir
        filterCommits libplanet
        mergeChangelogs libplanet
    }

    launcher
    game
    headless
    lib9c
    #libplanet

    function generateFile() {
        if [ -f $mergedChangelog ]; then
    
            cat <<EOF >>$packageWorkspace/debian/changelog
$name ($version) $distribution; urgency=$urgency

EOF

            cat $mergedChangelog >> $packageWorkspace/debian/changelog

            cat <<EOF >>$packageWorkspace/debian/changelog

-- $maintainer  $date
EOF

        fi
    }

    generateFile
}

function generatePreInst() {
    # Generate .deb rules file
    cat <<EOF >>$packageWorkspace/DEBIAN/preinst
# Check if nine-chronicles is running
if pgrep 'Nine Chronicles' > /dev/null; then
    pkill -15 'Nine Chronicles'
fi

if pgrep 'NineChronicles' > /dev/null; then
    pkill -15 'NineChronicles'
fi
EOF
}

function generatePostInst() {
    # Generate .deb rules file
    cat <<EOF >>$packageWorkspace/DEBIAN/postinst
# Set ownership to \$USER
if [ -d /opt/planetarium ]; then
    chown -R \$USER:\$USER /opt/planetarium
    sudo chmod -R 0777 /opt/planetarium
fi

# # Add binary to bin
# if [ ! -f /usr/local/bin/nine-chronicles ]; then
#     ln -s /opt/planetarium/nine-chronicles/'Nine Chronicles' /usr/local/bin/nine-chronicles
#     sudo chmod 0755 /usr/local/bin/nine-chronicles
#     sudo chmod +x /usr/local/bin/nine-chronicles
# fi
EOF
}

function generatePreRm() {
    # Generate .deb rules file
    cat <<EOF >>$packageWorkspace/DEBIAN/prerm
# Check if nine-chronicles is running
if pgrep 'Nine Chronicles' > /dev/null; then
    pkill -15 'Nine Chronicles'
fi

if pgrep 'NineChronicles' > /dev/null; then
    pkill -15 'NineChronicles'
fi
EOF
}

function generatePostRm() {
    # Generate .deb rules file
    cat <<EOF >>$packageWorkspace/DEBIAN/postrm
#Remove remaining files
sudo rm -rf /opt/planetarium
sudo rm -rf /home/\$USER/.local/share/planetarium
EOF
}

function setPermissions() {
    chmod 0755 $packageWorkspace/DEBIAN/*
}

function buildDeb() {
    # Building .deb package
    dpkg-deb --root-owner-group --build $packageWorkspace
}

function debugDeb() {
    buildScripts="$packageWorkspace/DEBIAN"
    echo
    echo ">> DEBUG DEB <<"
    echo
    echo "--| Version"
    echo $latestApvNumber
    echo $tag
    echo $version
    echo $packageName
    echo
    echo "--| Control"
    cat $buildScripts/control
    echo
    echo "--| Pre-Install"
    cat $buildScripts/preinst
    echo
    echo "--| Post-Install"
    cat $buildScripts/postinst
    echo
    echo "--| Pre-Remove"
    cat $buildScripts/prerm
    echo
    echo "--| Post-Remove"
    cat $buildScripts/postrm
    echo
    echo "--| Desktop Icon"
    cat $packageShortcut
    echo
}

#-----------------------------
prepareDir
copyToDeb
fetchOfficialConfigs
createDesktopFile
generateControl
#generateRules
generateCopyright
#generateChangelog
generatePreInst
generatePostInst
generatePreRm
generatePostRm
setPermissions
debugDeb
buildDeb
#-----------------------------------------