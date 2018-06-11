#!/bin/bash
echo "--=== Incoming Paramters (This script hould be reusable) ===--"
echo "[P1] Version Number is :$1 "
echo "[P2] Target Server is :$2 "
echo "[P3] Target Folder is :$3 "

echo "-------------------------------------------"

echo "----==== Identify the taret server =====---"
ssh -p 22 $2 "sudo /home/ubuntu/role.sh"
ssh -p 22 $2 "sudo whoami"
echo "-------------------------------------------"

echo "---=== Run local Tests on Deployment ===---"
echo "No tests yet Defined"
echo "-------------------------------------------"

echo "--=== Modify Version Information ===--"
echo "Version $1" > version.info
ls  -l
echo "-------------------------------------------"

echo "--=== Transfer files to remote Server ===--"
echo "rsync -avzhe ssh  --rsync-path="""rsync""" ./server/*  jenkins@$2:$3"""
rsync -avzhe ssh  --rsync-path="rsync" ./server/* jenkins@$2:$3

echo "--=== Start up the services and install dependancies ===--"
ssh -p 22 $2 "npm init -f"
ssh -p 22 $2 "npm install"
ssh -p 22 $2 "npm init -f"


echo "----====== Verify Deployments-List from Remote ======----"
ssh -p 22 $2 "ls -al $3"
ssh -p 22 $2 "ls -al $3/eth"
echo "---------------------------------------------------------"

echo "--=== Version Deployed is [$1] The folowing output from version.info ===--"
ssh -p 22 $2 "cat $3/version.info"
echo "------------The-End-------------------------------------------------------"
