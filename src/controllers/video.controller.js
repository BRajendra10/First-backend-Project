import mongoose, { isValidObjectId } from 'mongoose'
import { asyncHandler } from '../utils/asynHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponce.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Video } from '../models/video.model.js';

const getAllVideos = asyncHandler(async (req, res) => {
    const { page, limit, query, sortBy, sortType, userId } = req.query

    if (isNaN(page) || page < 1) {
        throw new ApiError(400, "Invalid 'page' value. It must be a positive number.");
    }

    if (isNaN(limit) || limit < 1 || limit > 50) {
        throw new ApiError(400, "Invalid 'limit' value. It must be between 1 and 50.");
    }

    if (!["asc", "desc"].includes(sortType)) {
        throw new ApiError(400, "Invalid 'sortType' value. Use 'asc' or 'desc'.");
    }

    if ([query, sortBy, userId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "query, sortBy and user Id are required")
    }

    const videos = Video.aggregate([
        {
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        },
        {
            $sort: { createdAt: sortType === 'desc' ? -1 : 1 }
        }
    ])

    const options = {
        page: 1,
        limit: 10,
    };

    const result = await Video.aggregatePaginate(videos, options);

    if (!result) {
        throw new ApiError(404, "videos data does not exist.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Videos data fetched successfully"))

})

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(400, "Video file is required, error while uploading on cloudinary.")
    }

    const videoData = await Video.create({
        title,
        description,
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url || "",
        owner: req.user?._id,
        duration: videoFile?.duration
    })

    if (!videoData) {
        throw new ApiError(500, "Something went arong while uploading video on database")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, videoData, "Video added successfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "video id is required and should be valid. !!")
    }

    const video = await Video.findById(new mongoose.Types.ObjectId(videoId))

    if (!video) {
        throw new ApiError(400, "Video does not exist !!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully")
        )

})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "video id is required and should be valid. !!")
    }

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "title and description are required !!")
    }

    const video = await Video.findByIdAndUpdate(
        new mongoose.Types.ObjectId(videoId),
        {
            $set: {
                title,
                description
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!video) {
        throw new ApiError(500, "Something went wrong while updating video credentials !!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video details is updated successfully")
        )
})

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.body
    const thumbnailLocalPath = req.file?.path

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "video id is required and should be valid. !!")
    }

    if (thumbnailLocalPath) {
        throw new ApiError(400, "thumnail is required are required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading thumnail on cloudinary")
    }

    const video = await Video.findByIdAndUpdate(
        new mongoose.Types.ObjectId(videoId),
        {
            $set: {
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video thumbnail updated succesfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "video id is required and should be valid. !!")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Video is deleted succefully")
    )
})

export { getAllVideos, publishVideo, deleteVideo, updateVideoDetails, updateVideoThumbnail, getVideoById }