import React from 'react'
import {currentUser} from '@clerk/nextjs'
import{redirect} from 'next/navigation'
import { fetchUser, fetchUserPosts, fetchUsers } from '@/lib/actions/user.actions'
import CommunityCard from '@/components/cards/CommunityCard'
import { fetchCommunities } from '@/lib/actions/communtiy.actions'
import Pagination from '@/components/shared/Pagination'
import Searchbar from '@/components/shared/Searchbar'
async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {

const user=await currentUser();
if(!user) return null;

const userInfo=await fetchUser(user.id)
if(!userInfo?.onboarded) redirect('/onboarding')

const results= await fetchCommunities({
   searchString:'',
   pageNumber:1,
  pageSize:25
})

  return (
    <section>
        <h1 className='head-text mb-10'>Communities</h1>

        <div className='mt-5'>
        <Searchbar routeType='communities' />
      </div>
    
        <div className='mt-14 flex flex-col gap-9'>
            {results.communities.length===0 ? (
                <p className='no-result'>No User</p>
            ):(
                <>
                {results.communities.map((communities)=>(
                    <CommunityCard
                     key={communities.id}
                     id={communities.id}
                     name={communities.name}
                     username={communities.username}
                     imgUrl={communities.image}
                    bio={communities.bio} 
                    members={communities.members}
                    />
                ))}
                </>
            )}
        </div>

        <Pagination
        path='communities'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={results.isNext}
      />

    </section>
  )
}

export default Page