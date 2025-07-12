
# 🔗 [Simple URL Shortener](https://github.com/anggaprasetya-fs/url-shortener)

A simple and fast URL shortener service built with Bun, Prisma, and JWT authentication. This project allows users to register, log in, and create short URLs that redirect to original links. It features secure user authentication, API endpoints for managing URLs, and OpenAPI (Swagger) documentation for easy integration and testing. Designed for performance and ease of deployment, this service is ideal for personal or small team use.


## 🚀 Fitur

- 🔐 Register & Login (JWT Auth)
- ✂️ Shorten URL from original long URL
- 📋 Get all URL based on user id
- ❌ Delete short URL
- 📈 Redirect and tracking click statistics
- 📜 OpenAPI documentation (`/docs`)
- 🧪 Unit Test (`bun:test`)
- 🧾 Logging request using Logtape

## 🛠️ Tech Stack

| Category        | Tech Stak                                                                 |
|-----------------|---------------------------------------------------------------------------|
| Backend         | ![Bun](https://img.shields.io/badge/Bun-%23000000?style=flat&logo=bun&logoColor=white) |
| Database        | ![MSSQL](https://img.shields.io/badge/SQL_Server-%23CC2927?style=flat&logo=microsoftsqlserver&logoColor=white) |
| ORM             | ![Prisma](https://img.shields.io/badge/Prisma-%23000000?style=flat&logo=prisma&logoColor=white) |
| Authentication  | ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=jsonwebtokens) |
| Documentation   | ![Swagger](https://img.shields.io/badge/Swagger-%2385EA2D?style=flat&logo=swagger&logoColor=white) |
| Logger          | ![Log](https://img.shields.io/badge/Logtape-gray?style=flat&logo=data&logoColor=white) |
| Testing         | ![Bun Test](https://img.shields.io/badge/Test-bun--test-blue?style=flat) |

## 💡 API Reference

#### Get system status

```http
  GET /api/system/status
```
#### User authentication

```http
  POST /api/auth/login
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `username`      | `string` | **Required** user e-mail |
| `password`      | `string` | **Required** user password |

#### Get all shorted URL

```http
  POST /api/get/url
```


#### Add URL to be shorten

```http
  POST /api/add/url
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token`      | `string` | **Required** JWT Token passed from header |
| `url`      | `string` | **Required** Original URL to be shorten |

#### Delete shorted and original URL

```http
  POST /api/delete/url
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token`      | `string` | **Required** JWT Token passed from header |
| `url_id`      | `uuid` | **Required** URL ID to be deleted |




## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL` **Example** : "sqlserver://localhost:1433;database=url_shortener;user=root;password=;trustServerCertificate=true;"

`BUN_PORT` **Example** : 3030

`BUN_HOST` **Example** : "localhost"

`LOCAL_TIMEZONE` **Example** : "Asia/Jakarta"

`JWT_SECRET` **Example** :  "here-your-jwt-secret"

`JWT_EXPIRE` **Example** : "1d"

`APP_URL` **Example** : "http://localhost/"


## 📟 Installation

Install url-shortener with [Bun](https://bun.sh)

```bash
  git clone https://github.com/username/url-shortener.git
  cd url-shortener
  bun install
  bun run index.js
```
    
## 📒 Documentation

Visit this url:

```bash
  http://your-app-host:your-app-port/docs
```
