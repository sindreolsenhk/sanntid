FROM nginxinc/nginx-unprivileged:alpine

COPY src/. /usr/share/nginx/html
COPY conf/. /etc/nginx/conf.d
