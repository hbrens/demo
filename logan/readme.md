1.  phpmyadmin:
    image: phpmyadmin
 去掉指定版本


2. # FROM tomcat:7.0.61-jre8
FROM tomcat:8.5-jre8


3. 前端移除 node-sass 改用sass