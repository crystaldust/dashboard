#!/bin/bash
npm build
docker build -t dashboard:test ./
docker-compose -f docker-compose.yaml down
docker-compose -f docker-compose.yaml up -d
