#!/bin/sh

#curl -XPOST http://localhost:9200/blogs -d @blogs-index.txt
curl -XPOST http://localhost:3000/create/blogs -d @blogs-index.txt
echo
