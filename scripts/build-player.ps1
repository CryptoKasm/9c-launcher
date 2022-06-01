& "C:\Program Files\Unity\Hub\Editor\2020.3.4f1\Editor\Unity" -batchmode -nographics -logFile -projectPath NineChronicles\nekoyume -executeMethod "Editor.Builder.BuildLinux"


#Get-ChildItem -Path NineChronicles\nekoyume\Build\Windows -Recurse -File | Move-Item -Destination dist\
#Get-ChildItem -Path NineChronicles\nekoyume\Build\Windows -Recurse -Directory | Move-Item -Destination dist\