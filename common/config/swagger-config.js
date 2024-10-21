import SwaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        info: {
            title: 'YourManitto API',
            version: '1.0.0',
            description: 'YourManitoo API with Express by iOS 개발자'
        },
        host: 'localhost:3000',
        basepath: '../'
    },
    apis: ['./src/router/*.js', './swagger/*']
};

export const specs = SwaggerJSDoc(options);