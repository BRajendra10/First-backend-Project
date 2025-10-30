import { asyncHandler } from '../utils/asynHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponce.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Video } from '../models/video.model.js';

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    //TODO: get all videos based on query, sort, pagination
    // 1. this is my video.controller.js file and i am getting all the videos and i have VideoSchema so Video.aggregate([proceed to add mongoose aggrigation pipeline]) 
    // 2. check if i am getting data or not if not throw new ApiErroe(my custom error class to throw errors) 
    // 3. return responce of 200 with my custom ApiResponce, i want to know am i right what do you think about this
    // {
    //     page: "2",
    //         limit: "5",
    //             query: "music",
    //                 sortBy: "createdAt",
    //                     sortType: "desc",
    //                         userId: "12345"
    // }

    // how my mind is thinking should a flow of aggrigation pipleine should be
    // match query then we get all videos 
    // based on that video we will set 
    // page = 1 and limit = 10, 1 to 10
    // page = 2 and limit = 10, 11 to 20
    // we have now videos with 10 limit
    // now what we will do is to sort them by acsending order by createAt field(when it's created)
    // and add some field for font-end developer ease
    // query: what query he has send he can improve he is messed up while sending query
    // totalvideocount: which is ten but we will send

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
        },
        {
            $addFields: {
                search: query
            }
        },
        {
            $project: {
                videos: 1,
                search: 1
            }
        }
    ])

    if (!videos.length) {
        throw new ApiError(404, "videos data does not exist.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos data fetched successfully"))

})


const publishVideo = asyncHandler(async (req, res) => {
    // TODO: 

    // get title, description,
    // check if title and description realy come or not
    // get video and thumbnail from public/temp folder localpath
    // check if localpath avilable
    // send them to cloudinary
    // check if cloudinary give path
    // create video data with video file, thunmbnail, title, description, duration (we can get that from cloudinar responce)
    // check if video data is created or not 
    // send responce

    const { title, description } = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    
    if(!videoFile) {
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

    if(!videoData){
        throw new ApiError(500, "Something went arong while uploading video on database")
    }

    return res.status(201).json(
        new ApiResponse(201, videoData, "Video added successfully")
    )
})

export { getAllVideos, publishVideo }