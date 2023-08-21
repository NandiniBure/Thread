"use server";

import User from "../models/user.model";
import Thread from "../models/thread.model";
import { connectToDB } from "../mongoose"
import {revalidatePath} from 'next/cache'
import { FilterQuery, SortOrder } from "mongoose";
interface Params{
    userId:string,
    username:string,
    name:string,
    bio:string,
    image:string,
    path:string
}


export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path
    }:Params):Promise<void> {
   try{
    connectToDB();
    await User.findOneAndUpdate(
        {id:userId},
        {username:username.toLowerCase(),
            name,
            bio,
            image,
            onboarded:true
        },
        {upsert:true}
        )
    if(path==='/profile/edit'){
        revalidatePath(path)
    }
   }catch(error:any){
     throw new Error(`Failed to create/update user:${error.message}`)
   }
}

export async function fetchUser(userId:string){
    try{
 connectToDB()
 return await User.findOne({id:userId})
//  .populate({
//     path:'communities',
//     model:Community
//  })
    }catch(error:any){
   throw new Error(`Failed to fetch user : ${error.message}`)
    }
}

export async function fetchUserPosts(userId:string){
try{

const threads=await User.findOne({id:userId})
.populate({
    path:'threads',
    model:Thread,
    populate:{
        path:'children',
        model:Thread,
        populate:{
            path:'author',
            model:User,
            select:'name image id'
        }
    }

})
  return threads;
}catch(error:any){
    throw new Error(`Error in fetching post ${error.message}`)
}
}


export async function fetchUsers({
    userId,
    searchString="",
    pageNumber=1,
    PageSize=20,
    sortBy="desc"
}:{
    userId:string;
    searchString?:string;
    pageNumber?:number;
    PageSize?:number;
    sortBy?:SortOrder;
}){
    try{
 connectToDB()
const skipAmount=(pageNumber-1)*PageSize;
 const regex=new RegExp(searchString,"i")

 const query:FilterQuery<typeof User>={
    id: {$ne : userId}
 }

 if(searchString.trim()!== ''){
    query.$or=[
        {username:{$regex:regex}},
        {user:{$regex:regex}}
    ]
 }

 const sortOptions={createdAt:sortBy}

 const usersQuery=User.find(query).sort(sortOptions)
 .skip(skipAmount)
 .limit(PageSize)

  const totaluserCount= await User.countDocuments(query)

   const users=await usersQuery.exec();
   const isNext=totaluserCount > skipAmount + users.length;

   return{users,isNext};

    }catch(error:any){
   throw new Error(`Failed to fetch user : ${error.message}`)
    }
}

export async function getAvtivity(userId:string){
 try{
 connectToDB();
const userThreads=await Thread.find({author:userId});

const childthreadIds=userThreads.reduce((acc,userThread)=>{
    return acc.concat(userThread.children)
},[])

const replies=await Thread.find({
    _id:{$in : childthreadIds},
    author:{$ne:userId}
}).populate({
 path:'author',
 model:User,
 select:'name image _id'
})

return replies

 }catch(error:any){
    throw new Error(`Failed to fetch user : ${error.message}`)
 }
}