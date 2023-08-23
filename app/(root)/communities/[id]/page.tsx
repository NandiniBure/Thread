import {currentUser} from '@clerk/nextjs'
import {redirect} from 'next/navigation'
import { fetchUser } from '@/lib/actions/user.actions';
import ProfileHeader from '@/components/shared/ProfileHeader';
import {Tabs,TabsList,TabsContent,TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image'
import { communityTabs } from '@/constants';
import ThreadsTab from '@/components/shared/ThreadsTabs';
import { fetchCommunityDetails } from '@/lib/actions/communtiy.actions';
import UserCard from '@/components/cards/UserCard';
async function Page({params}:{params:{id:string}}){
    const user=await currentUser()
    
    if(!user) return null;


    const communitydetails=await fetchCommunityDetails(params.id)

    return(
        <section>
        <ProfileHeader
        accountId={communitydetails.id}
        authUserId={user.id}
        name={communitydetails.name}
        username={communitydetails.username}
        imgUrl={communitydetails.image}
        bio={communitydetails.bio}
        type="Community"
        />
        <div className='mt-9'>
            <Tabs defaultValue="thread" className="w-full">
              <TabsList className="tab">
              {communityTabs.map((tab)=>(
                <TabsTrigger className="tab"
                 key={tab.label}
                 value={tab.value}>
                    <Image
                    src={tab.icon}
                    alt={tab.label}
                    width={24}
                    height={24}
                    className="object-contain"/>
                    <p className='max-sm:hidden'>{tab.label}</p>
                    {
                        tab.label==='Threads' && (
                            <p className='ml-1 rounded-sm bg-light-4 px-2 py-1
                            !text-tiny-medium text-light-2'>
                                {communitydetails?.threads?.length}
                            </p>
                        )
                    }
                </TabsTrigger>
              ))}
            </TabsList>  
           
                <TabsContent  value="threads"
                className="w-full text-light-1">
                   <ThreadsTab
                    currentUserId={user.id}
                    accountId={communitydetails._id}
                    accountType="Community"/>
                </TabsContent>

                <TabsContent  value="members"
                className="w-full text-light-1">
                 <section className='mt-9 flex-col flex gap-10'>
                  { communitydetails?.members.map((member:any)=>(
                    <UserCard
                    key={member.id}
                     id={member.id}
                     name={member.name}
                     username={member.username}
                     imgUrl={member.image}
                     personType='User'
                    />
                  ))

                  }
                 </section>
                   <ThreadsTab
                    currentUserId={user.id}
                    accountId={communitydetails._id}
                    accountType="Community"/>
                </TabsContent>
             
                <TabsContent  value="requests"
                className="w-full text-light-1">
                   <ThreadsTab
                    currentUserId={user.id}
                    accountId={communitydetails._id}
                    accountType="Community"/>
                </TabsContent>
             
            </Tabs>
        </div>
        </section>
    )
}

export default Page;