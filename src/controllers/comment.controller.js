import mongoose, { isValidObjectId } from 'mongoose'
import { Comment } from '../models/comment.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponce.js';
import { asyncHandler } from '../utils/asynHandler.js';

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "video id is required and should be valid. !!")
    }

    if (!page || !limit) {
        throw new ApiError(400, "page and limit is required")
    }


    const allComments = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    const options = {
        page: 1,
        limit: 10,
    };

    const result = await Comment.aggregatePaginate(allComments, options)

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "All comments for video fetched successfully")
        )

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { comment } = req.body

    if (!videoId || !isValidObjectId(videoId) || !comment) {
        throw new ApiError(400, "Video id and comment are required")
    }

    const createdComment = await Comment.create({
        content: comment,
        video: videoId,
        owner: req.user?._id
    })

    if (!createdComment) {
        throw new ApiError(400, "Something went wrong while creating comment")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdComment, "Comment added successfully")
        )

})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { comment } = req.body

    if (!isValidObjectId(commentId) || !comment) {
        throw new ApiError(400, "comment id is required and should be valid")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        new mongoose.Types.ObjectId(commentId),
        {
            $set: {
                content: comment
            }
        },
        {
            new: true
        }
    )

    if (!updatedComment) {
        throw new ApiError(500, "Something went wrong while updating comment")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "comment Id is required and should be valid")
    }

    await Comment.findByIdAndDelete(new mongoose.Types.ObjectId(commentId))

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Comment deleted successfully")
        )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}