import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponce.js';
import { asyncHandler } from '../utils/asynHandler.js';
import { Subscription } from '../models/subscription.model.js';
import mongoose from 'mongoose';

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    // FIRST SENARIO (creation of subscription data)
    // inside re.user we have our current user so it's _id
    // and we are getting channelId from params
    // so with both information we will find that single subscription model that was create by current user with subscirbing channel

    // NO WE HAVE THAT ONE SUBSCRIPTION DATA

    // if we have subscription data means we subscribe to that channel
    // so we will delete this subscription data with it's _id

    // WHY? because we try remove subscriber Id we will have a subscription data with id, channelID, create at and updated at
    // we are doing some work down here getting user channeld subscribers then our this subscription data will go there inspite of not subscribed to that channel why it will get because we matching it with channel
    // so only logical option that seems to me is to delete that subscription data 

    // what if it doesn't exist that means we are subscribing to that channel then we will just create a subscription data

    if(!channelId) {
        throw new ApiError(400, "Channel Id is required")
    }

    console.log(req.user, channelId);

    const existingSub = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });


    if(existingSub){
        await Subscription.findByIdAndDelete(existingSub._id)


        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Channel Unsubscribed successfully")
            );
    }


    const createdSubscriptionData = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })

    if(!createdSubscriptionData){
        throw new ApiError(500, "Something went wrong while creating subscription instence/data")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdSubscriptionData, "Channel subscribbed successfully")
        )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "ChannelId is required")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriberDetails._id",
                username: "$subscriberDetails.username",
                email: "$subscriberDetails.email",
                avatar: "$subscriberDetails.avatar",
                subscribedAt: "$createdAt"
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Subscribers fetched successfully")
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "subscriber Id is required")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                _id: 0,
                channelId: "$channelDetails._id",
                username: "$channelDetails.username",
                email: "$channelDetails.email",
                avatar: "$channelDetails.avatar",
                subscribedAt: "$createdAt"
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
        )
})

export { getUserChannelSubscribers, getSubscribedChannels, toggleSubscription }