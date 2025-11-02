import { asyncHandler } from '../utils/asynHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponce.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Video } from '../models/video.model.js';
import mongoose from 'mongoose'


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

    const videos = await Video.aggregate([
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
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ])

    if (!videos) {
        throw new ApiError(404, "videos data does not exist.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos data fetched successfully"))

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

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;
    //TODO: update video details like title, description, thumbnail

    if ([title, description, videoId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "title, description and videoId are required")
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
        throw new ApiError(500, "Something went wrong while updating video credentials")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video details is updated successfully")
        )
})

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const { ID } = req.body
    const thumbnailLocalPath = req.file?.path

    if ([ID, thumbnailLocalPath].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading thumnail on cloudinary")
    }

    const video = await Video.findByIdAndUpdate(
        new mongoose.Types.ObjectId(ID),
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
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Video is deleted succefully")
    )
})

export { getAllVideos, publishVideo, deleteVideo, updateVideoDetails, updateVideoThumbnail }