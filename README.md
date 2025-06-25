# 考试系统-后端服务

## 技术栈

后端服务 Nest + Prisma，会拆分多个微服务，之间用 TCP 通信。

数据库 mysql + redis，mysql 做持久化存储，redis 做缓存以及临时数据的存储。

用 minio 做 OSS 对象存储服务，存储上传的文件。

用 nacos 来做注册中心、配置中心，统一管理所有的配置、服务的地址注册。

rabbitmq 做消息队列，用于微服务之间的异步通信。

文档用 swagger 生成，部署用 docker compose。
