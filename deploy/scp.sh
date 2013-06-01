#!/usr/bin/env bash

if [ "$#" -eq 3 ]
then
    user="ubuntu"
    node=$1
    path_src=$2
    path_dest=$3
    echo "defaulting to user $user"
elif [ "$#" -eq 4 ]
then
    user=$1
    node=$2
    path_src=$3
    path_dest=$4
else
    echo "Description:"
    echo "   scp's a file to an EC2 instance"
    echo ""
    echo "Usage:"
    echo "   $0 node-name path-src path-dest OR $0 user node-name path-src path-dest"
    exit 1
fi

echo "user: $user"
echo "node: $node"
echo "src:  $path_src"
echo "dest: $path_dest"

dns=`python node_to_dns.py $node`
echo "dns:  $dns"

scp -i ~/.ssh/fisch.pem $path_src $user@$dns:$path_dest

