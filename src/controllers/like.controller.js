import mongoose, { isValidObjectId } from 'mongoose';
import { Like } from '../models/like.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponce.js';
import { asyncHandler } from '../utils/asynHandler.js';

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "video id is required and should be valid")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Video unliked")
            )
    }


    const createdLike = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    if (!createdLike) {
        throw new ApiError(500, "Somethign went wrong while creating like instence/data")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdLike, "Video liked")
        )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id is required and should be valid")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Comment unliked")
            )
    }

    const createdLike = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (!createdLike) {
        throw new ApiError(500, "Somethign went wrong while creating like instence/data")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdLike, "Comment liked")
        )


})

const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params

    if(!postId || !isValidObjectId(postId)){
        throw new ApiError(400, "Invalid id or missing post id")
    }

    const existingLikedPost = await Like.findOne({
        post: new mongoose.Types.ObjectId(postId),
        likedBy: req.user?._id
    })

    if(existingLikedPost) {
        await Like.findByIdAndDelete(existingLikedPost._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Post unliked")
            )
    }

    const createLikedPost = await Like.create({
        post: new mongoose.Types.ObjectId(postId),
        likedBy: req.user?._id
    })

    if(!createLikedPost) {
        throw new ApiError(500, "Something went wrong while creating like instence for posts")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(201, createLikedPost, "Post liked")
        )

})

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideoAggregate = await Like.aggregate([
        {
            $match: {
                likedBy: req.user?._id,
                video: { $exists: true, $ne: null }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video'
            }
        },
        {
            $unwind: '$video'
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideoAggregate, "Liked videos fetched successfully")
        )

})

export {
    toggleCommentLike,
    togglePostLike,
    toggleVideoLike,
    getLikedVideos
}