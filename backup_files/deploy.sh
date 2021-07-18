#!/bin/bash
hexo generate ;
curl -i -X POST "https://soar.stco.tw/update" -F 'file=@db.json' -F 'index=blog' -F 'type=articles'
gulp ; hexo deploy
