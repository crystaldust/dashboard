FROM nginx:stable
ADD dist/ /dist
ADD dashboard.nginx.conf /etc/nginx/conf.d/

