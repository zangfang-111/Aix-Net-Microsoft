#!/bin/sh
# generated with Postman
curl -X POST \
  http://localhost:9200/winston/_delete_by_query \
  -H 'authorization: Basic ZWxhc3RpYzpjaGFuZ2VtZQ==' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'postman-token: 28f370d6-6d7f-0434-73eb-a687898649a7' \
  -d '{
    "query" : {
        "match_all" : {}
    }
}'