#!/bin/bash

python elasticsearch-index.py -H localhost -P 9200 -i blogs -t article -cc _config.yml -f .es-last-index-time -e .es-exclude-articles
echo
