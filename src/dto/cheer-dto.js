import Joi from 'joi';

export const CheerProperty = {
    // cheerType: 문자열, 필수
    cheerType: Joi.string()
        .required()
        .messages({
            'any.required': 'cheerType이 비어있습니다.',
        })
}

export const CheerSchema = {
    getCheerMessageDto: Joi.object({
        cheerType: CheerProperty.cheerType
    })
}