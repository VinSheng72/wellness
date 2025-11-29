#!/bin/bash

docker system prune -a -f 
docker stop wellness-frontend wellness-backend
docker rm wellness-frontend wellness-backend
docker compose pull frontend backend
docker compose up -d frontend
