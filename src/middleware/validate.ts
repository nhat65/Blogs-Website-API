import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'

interface Login{
    username: string,
    password: string
}

interface Register{
    email: string,
    username: string,
    password: string,
    confirmPassword: string
}

const loginSchema = Joi.object<Login>({
    username: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.base': 'Username must be a string.',
      'string.empty': 'Username is required.',
      'string.min': 'Username must be at least 6 characters.',
      'string.max': 'Username must be at most 20 characters.',
      'any.required': 'Username is required.'
    }),
  password: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    })
});

const registerSchema = Joi.object<Register>({
  email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .trim()
        .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } })
        .messages({
            'string.min': 'Email must be at least 6 characters long',
            'string.max': 'Email must not exceed 60 characters',
            'string.email': 'Please provide a valid email address (e.g., user@example.com)',
            'string.empty': 'Email is required',
            'any.required': 'Email is required',
        }),
  username: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.base': 'Username must be a string.',
      'string.empty': 'Username is required.',
      'string.min': 'Username must be at least 6 characters.',
      'string.max': 'Username must be at most 20 characters.',
      'any.required': 'Username is required.'
    }),
  password: Joi.string()
    .optional()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),
    confirmPassword: Joi.string()
        .min(7)
        .optional()
        .trim()
        .valid(Joi.ref('password'))
        .messages({
            'string.empty': 'Confirm password is required',
            'string.min': 'Confirm password must be at least 7 characters long',
            'any.only': 'Confirm password must match password',
        }),
})

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const {error} = registerSchema.validate(req.body);
    if(error){
        return res.status(400).json({status: false, message: error.details[0].message})
    }
    next()
}

export const validateLogin = (req: Request, res: Response, next: NextFunction) =>{
    const {error} = loginSchema.validate(req.body);
    if(error){
        return res.status(400).json({status: false, message: error.details[0].message})
    }
    next()
}

