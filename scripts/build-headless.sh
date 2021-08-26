#!/usr/bin/env bash

if [[ "$#" != "1" ]]; then
  {
    echo "error: too few arguments"
    echo "usage: $0 BUILD-TARGET"
  } > /dev/stderr
  exit 1
fi

build_target="$1"

if [ "$build_target" == "--mac" ]; then
  build_target="osx-x64"
elif [ "$build_target" == "--linux" ]; then
  build_target="linux-x64"
fi

dotnet publish NineChronicles.Headless/NineChronicles.Headless.Executable/NineChronicles.Headless.Executable.csproj \
  -c Release \
  -r $build_target \
  -o dist/publish \
  --self-contained \
  --version-suffix "$(git -C NineChronicles.Headless rev-parse HEAD)"
