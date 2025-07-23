import Joi from "joi";
import { NextFunction, Request, Response } from "express";
import { deleteImage } from "../utils/deleteImage";
import { AuthRequest } from "./identify";

interface Login {
  username: string;
  password: string;
}

interface Register {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface Post {
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  tagId: number;
}

interface User {
  fullName: string,
  bio?: string,
  imageUrl?: string,
  country: string,  
}

const loginSchema = Joi.object<Login>({
  username: Joi.string().min(6).max(20).required().messages({
    "string.base": "Username must be a string.",
    "string.empty": "Username is required.",
    "string.min": "Username must be at least 6 characters.",
    "string.max": "Username must be at most 20 characters.",
    "any.required": "Username is required.",
  }),
  password: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),
});

const registerSchema = Joi.object<Register>({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .trim()
    .email({ tlds: { allow: ["com", "net", "org", "edu", "gov"] } })
    .messages({
      "string.min": "Email must be at least 6 characters long",
      "string.max": "Email must not exceed 60 characters",
      "string.email":
        "Please provide a valid email address (e.g., user@example.com)",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
  username: Joi.string().min(6).max(20).required().messages({
    "string.base": "Username must be a string.",
    "string.empty": "Username is required.",
    "string.min": "Username must be at least 6 characters.",
    "string.max": "Username must be at most 20 characters.",
    "any.required": "Username is required.",
  }),
  password: Joi.string()
    .optional()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),
  confirmPassword: Joi.string()
    .min(7)
    .optional()
    .trim()
    .valid(Joi.ref("password"))
    .messages({
      "string.empty": "Confirm password is required",
      "string.min": "Confirm password must be at least 7 characters long",
      "any.only": "Confirm password must match password",
    }),
});

const postSchema = Joi.object<Post>({
  title: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Title is required",
  }),
  slug: Joi.string()
    .optional()
    .empty("")
    .trim()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .min(3)
    .max(255)
    .messages({
      "string.pattern.base":
        "Slug must be lowercase letters, numbers, and hyphens only",
    }),
  content: Joi.string().trim().min(10).required().messages({
    "string.empty": "Content is required",
    "string.min": "Content must be at least 10 characters",
  }),
  tagId: Joi.number().integer().min(1).required().messages({
    "number.base": "Tag is required",
  }),
  imageUrl: Joi.string().optional().messages({
    "string.uri": "Image URL must be a valid URI",
  }),
}).options({ abortEarly: true });

const userSchema = Joi.object<User>({
  fullName: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 3 characters",
    "string.max": "Full name should not exceed 50 characters",
  }),
  bio: Joi.string().allow('').min(5).max(250).optional().messages({
    "string.min": "Bio must be at least 5 characters",
    "string.max": "Bio should not exceed 250 characters",
  }),
  imageUrl: Joi.string().optional().messages({
    "string.uri": "Image URL must be a valid URI",
  }),
  country: Joi.string().required().messages({
    "string.empty": "Country is required",
  }),
});

export const validateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    deleteImage(req.body.imageUrl, req.user?.accountId)
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }
  next();
};

export const validatePost = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { error } = postSchema.validate(req.body);
  if (error) {
    deleteImage(req.body.imageUrl, req.user?.accountId)
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }
  next();
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }
  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }
  next();
};
