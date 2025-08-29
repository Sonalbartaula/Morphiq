"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import Image from "../database/models/image.model";
import User from "../database/models/user.model";
import { redirect } from "next/navigation";
import {v2 as cloudinary} from "cloudinary";

const populateUser = (query: any) => query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId"
})

//ADD IMAGE
export async function addImage({image, userId, path }:
    AddImageParams) {
        try{
            await connectToDatabase();

            const author = await User.findById(userId);

            if (!author){
                throw new Error("User not found");
            }

            const newImage = await Image.create({
                ...image,
                author: author._id,

            })
            revalidatePath(path);
            return JSON.parse(JSON.stringify(newImage));

        }catch (error){
            handleError(error)
        }
    
}

//UPDATE IMAGE
export async function updateImage({image, userId, path }:
    UpdateImageParams) {
        try{
            await connectToDatabase();
            
            const imageToUpdate= await Image.findById(image._id);

            if (!imageToUpdate || imageToUpdate.author.
                toHexString()! == userId){
                throw new Error("Unauthorized or Image not found");
            }

            const updatedImage = await Image.findByIdAndUpdate(
                imageToUpdate._id,
                image,
                { new: true}

            )
            revalidatePath(path);
            return JSON.parse(JSON.stringify(updatedImage));

        }catch (error){
            handleError(error)
        }
    
}

//DELETE IMAGE
export async function deleteImage(imageId:string){
        try{
            await connectToDatabase();
            await Image.findByIdAndDelete(imageId);

        }catch (error){
            handleError(error)
        }finally{
            redirect("/")
        }
    
}

//GET IMAGE
export async function getImageById(imageId: string) {
        try{
            await connectToDatabase();

            const image = await populateUser(Image.findById
                (imageId));
            
            if(!image) throw new Error("Image not found");

            return JSON.parse(JSON.stringify(image));

        }catch (error){
            handleError(error)
        }
    
}

//GET IMAGES
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    // Build MongoDB query
    let query: any = {};
    if (searchQuery) {
      // Search by title (case-insensitive)
      query.title = { $regex: searchQuery, $options: "i" };
    }

    const skipAmount = (Number(page) - 1) * limit;

    // Fetch paginated images
    const images = await populateUser(
      Image.find(query).sort({ updatedAt: -1 }).skip(skipAmount).limit(limit)
    );

    // Total images matching search
    const totalImages = await Image.find(query).countDocuments();

    // Total images saved in DB (all-time)
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}