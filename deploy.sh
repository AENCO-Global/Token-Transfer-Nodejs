#!/bin/bash
echo "--=== Incoming Paramters (This script hould be reusable) ===--"
echo "[P1] Version Number is :$1 "
echo "[P2] Target Server is :$2 "
echo "[P3] Target Folder is :$3 "

echo "-------------------------------------------"

echo "----==== Identify the taret server =====---"
ssh -p 22 $2 " whoami"
echo "-------------------------------------------"

echo "---=== Run local Tests on Deployment ===---"
echo "No tests yet Defined"
echo "-------------------------------------------"

echo "--=== Modify Version Information ===--"
echo "Version $1" > ./server/version.info
ls  -l
echo "-------------------------------------------"

echo "--=== Create Target Folder ===--"
ssh -p 22 $2 "mkdir -p  $3"
echo "-------------------------------------------"

echo "--=== Transfer files to remote Server ===--"
echo "rsync -avzhe ssh  --rsync-path="""rsync""" ./server/*  jenkins@$2:$3"""
rsync -avzhe ssh  --rsync-path="rsync" ./server/* jenkins@$2:$3

echo "--=== Start up the services and install dependancies ===--"
echo "$3/npm install && echo 'post-receive: Building...' "
ssh -p 22 $2 "cd $3 ; npm install && echo 'post-receive: Building...' "

echo "-- Stop Start Forever ===--"
echo "$3/forever stop 0 && cd $3 ;forever start ./app.js && 'post-receive: -> Started.'"
ssh -p 22 $2 "cd $3 ; forever stop 0 && cd $3; forever start ./app.js && 'post-receive: -> Started.'"

echo "----====== Verify Deployments-List from Remote ======----"
ssh -p 22 $2 "ls -al $3"
echo "---------------------------------------------------------"

echo "--=== Version Deployed is [$1] The following output from version.info ===--"
ssh -p 22 $2 "cat $3/version.info"
ssh -p 22 $2 "cat $3/ehtereum-api.log"
ssh -p 22 $2 "cat /home/jenkins/.npm/_logs/2018-06-12T04_12_17_627Z-debug.log"
ssh -p 22 $2 "ls /home/apache/public_html/uat.aencoin.com/api/"

echo "------------The-End--------------------------------------------------------"