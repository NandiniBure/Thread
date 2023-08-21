import React from 'react'
import {currentUser} from '@clerk/nextjs'
import{redirect} from 'next/navigation'
import { fetchUser, fetchUserPosts, fetchUsers } from '@/lib/actions/user.actions'
import UserCard from '@/components/cards/UserCard'
const page = async() => {

const user=await currentUser();
if(!user) return null;

const userInfo=await fetchUser(user.id)
if(!userInfo?.onboarded) redirect('/onboarding')

const results= await fetchUsers({
   userId:user.id,
   searchString:'',
   pageNumber:1,
   PageSize:25
})

  return (
    <section>
        <h1 className='head-text mb-10'>Search</h1>

        <div className='mt-14 flex flex-col gap-9'>
            {results.users.length===0 ? (
                <p className='no-result'>No User</p>
            ):(
                <>
                {results.users.map((person)=>(
                    <UserCard
                     key={person.id}
                     id={person.id}
                     name={person.name}
                     username={person.username}
                     imgUrl={person.image}
                     personType='User'/>
                ))}
                </>
            )}
        </div>
    </section>
  )
}

export default page