"use server"

import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache";
interface Params{
    text:string,
    author:string,
    communityId:string | null,
    path:string
}

export async function creteThread({text,author,communityId,path}:Params) {
   try{ 
    connectToDB();
    const createthread=await Thread.create({
        text,
        author,
        community:null
    });

  //update user model
  await User.findByIdAndUpdate(author,{
    $push:{threads:createthread._id}
  })
   revalidatePath(path);
}catch(error:any){
    throw new Error(`Error creating thread ${error.message}`)
}
}

export async function fetchPosts(pageNumber=1,pageSize=20) {
   connectToDB();
   const skipAmount=(pageNumber-1)*pageSize;
   const PostQuery=Thread.find({parentId:{$in:[null,undefined]}})
   .sort({createdAt:'desc'})
   .skip(skipAmount)
   .limit(pageSize)
   .populate({path:'author',model:User})
   .populate({
    path:'children',
    populate:{
   path:'author',
   model:User,
   select:'_id name parentId image'
   }})

   const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

   const posts=await PostQuery.exec();
    
   const isNext=totalPostsCount >skipAmount+posts.length
  
   return {posts,isNext};
}

export async function fetchThreadById(id:string) {
     connectToDB();

     try{
     const thread=await Thread.findById(id)
     .populate({
        path:'author',
        model:User,
        select:"_id id name image"
     })
     .populate({
        path:'children',
        populate:[
            {
                path:'author',
                model:User,
                select:"_id id name parentId image"
            },
            {
                path:'children',
                model:Thread,
                populate:{
                    path:'author',
                    model:User,
                    select:"_id id name parentId image"
                }
            }
        ]

     }).exec()

     return thread;
     }catch(error:any){
        throw new Error(`Error fetching thread ${error.message}`)
     }
}

export async function AddcommentToThread(
threadId:string,
commentText:string,
userId:string,
path:string
){
    connectToDB();

    try{
        const originalthread=await Thread.findById(threadId)
        if(!originalthread){
            throw new Error("Thread not found")
        }

        const commentThread=new Thread({
            text:commentText,
            author:userId,
            parentId:threadId
        })

   const savedCommentThread=await commentThread.save();
 
   originalthread.children.push(savedCommentThread._id);

   await originalthread.save();
   revalidatePath(path)

    }catch(error:any){
      throw new Error(`Error adding comment to thred ${error.message}`)
    }

}