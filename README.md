# YourManittoNodejs

비교적 간단한 3-layer, Controller, Service, Repository 구조로 작성했습니다.
router-controller-dto-service-dao의 흐름입니다.
100% JS를 사용이지만, Joi 라이브러리를 통해 dto 유효성 검증을 진행하여 API 요청값 검증을 진행했습니다.
또한 db요청, res응답처리, 에러처리 등 랩핑된 공통 함수를 통해 집중형으로 관리가능한 구조로 작성해보려 했습니다.
정말 많이 모자른 것 같습니다 ㅠㅠㅜㅠㅠㅠㅠㅠㅜ

- node: v20.16.0
- dotenv: ^16.4.5
- express: ^4.21.1
- express-async-handler": ^1.2.0
- http-status-codes: ^2.3.0
- joi: ^17.13.3
- mysql2: ^3.11.3

```
├── .env
├── .gcloudignore
├── .gitignore
├── ERD.sql
├── README.md
├── YourManitto.drawio
├── app.yaml
├── common
│   ├── base-error.js
│   ├── base-response.js
│   ├── code-generator.js
│   ├── config
│   │   ├── db-config.js
│   │   └── swagger-config.js
│   ├── db-helper.js
│   ├── index.js
│   ├── response-helper.js
│   ├── response-status.js
│   ├── utils.js
│   └── validator.js
├── index.js
├── package.json
├── src
│   ├── controller
│   │   ├── cheer-controller.js
│   │   ├── room-controller.js
│   │   └── user-controller.js
│   ├── dao
│   │   ├── cheer-dao.js
│   │   ├── room-dao.js
│   │   ├── user-dao.js
│   │   └── user-room-setting-dao.js
│   ├── dto
│   │   ├── cheer-dto.js
│   │   ├── room-dto.js
│   │   └── user-dto.js
│   ├── router
│   │   ├── cheer-router.js
│   │   ├── room-router.js
│   │   └── user-router.js
│   └── service
│       ├── cheer-service.js
│       ├── room-service.js
│       └── user-service.js
├── swagger
│   └── temp-swagger.yaml
└── yarn.lock
```
