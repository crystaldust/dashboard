FROM nginx:stable
ADD dist/ /project
ADD dashboard.nginx.conf /etc/nginx/conf.d/

