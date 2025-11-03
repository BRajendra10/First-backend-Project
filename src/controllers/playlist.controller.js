import mongoose, { isValidObjectId } from 'mongoose';
import { Playlist } from '../models/playlist.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/apiResponce.js';
import { asyncHandler } from '../utils/asynHandler.js';


const createPlaylist = asyncHandler(async (req, res) => {
    const { description, name } = req.body

    if (!name || !description) {
        throw new ApiError(400, "name and description fields is required")
    }

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!createdPlaylist) {
        throw new ApiError(400, "Somethign went wrong while creating playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdPlaylist, "Playlist created successfully")
        )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "User id is required")
    }

    const playlists = await Playlist.find({ owner: userId });

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "User playlists fetched successfully")
        )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const ID = new mongoose.Types.ObjectId(playlistId)

    if (!ID) {
        throw new ApiError(400, "Playlist id is required")
    }

    const playlistData = await Playlist.findById(ID)

    if (!playlistData) {
        throw new ApiError(400, "Something went wrong while fetching playlist. Playlist does not exist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlistData, "Playlist fetched successfully")
        )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
        throw new ApiError(400, "palylist and video id required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        new mongoose.Types.ObjectId(playlistId),
        {
            $push: { videos: videoId }
        },
        {
            new: true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(400, "Something went wrong while pushing videoId to playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Video id pushed successfully to playlist videos")
        )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
        throw new ApiError(400, "palylist and video id required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        new mongoose.Types.ObjectId(playlistId),
        {
            $pull: { videos: videoId }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Video id removed successfully from playlist videos")
        )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const ID = new mongoose.Types.ObjectId(playlistId)

    if (!ID) {
        throw new ApiError(400, "Playlist id is required")
    }

    await Playlist.findByIdAndDelete(ID)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Playlist delted successfully")
        )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    const ID = new mongoose.Types.ObjectId(playlistId)

    if (!ID) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!name || !description) {
        throw new ApiError(400, "name and description fields are required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        ID,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while updating playlist credentails")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
        )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}