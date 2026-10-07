#!/bin/bash
URL=$(docker logs strike-arena-tunnel 2>&1 | grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' | tail -n 1)
if [ -n "$URL" ]; then
    echo "$URL" > /srv/samba/privado/strike-arena-tunnel-url.txt
fi
