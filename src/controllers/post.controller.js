import mongoose, { isValidObjectId } from "mongoose"
import { Post } from '../models/post.model.js';
// import {User} from "../models/user.model.js"
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponce.js';
import { asyncHandler } from '../utils/asynHandler.js';

const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body

    if(!content) {
        throw new ApiError(400, "Post conent is required")
    }

    const createdPost = await Post.create({
        content,
        owner: req.user?._id
    })

    if(!createdPost) {
        throw new ApiError(500, "Something went wrong while creating post")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(201, createdPost, "Post is created successfully")
        )

})

const getUserPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id or missing user id")
    }

    const postPipeline = await Post.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, postPipeline, "Posts feteched successfully")
        )


})

const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params
    const { content } = req.body

    if(!postId || !isValidObjectId(postId)) {
        throw new ApiError(400, "Post is required and should be valid")
    }

    if(!content) {
        throw new ApiError(400, "content is required for updating with old content.")
    }

    const updatedPost = await Post.findByIdAndUpdate(
        new mongoose.Types.ObjectId(postId),
        {
            $set: {
                content,
            }
        },
        {
            new: true,
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPost, "Post updated successfully")
        )

})

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params

    if(!postId || !isValidObjectId(postId)) {
        throw new ApiError(400, "Post is required and should be valid")
    }

    await Post.findByIdAndDelete (new mongoose.Types.ObjectId(postId))

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Post deleted Successfully")
        )

})

export {
    createPost,
    getUserPosts,
    updatePost,
    deletePost,
}