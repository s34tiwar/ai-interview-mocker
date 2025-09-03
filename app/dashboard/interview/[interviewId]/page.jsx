"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/utlils/db'
import { MockInterview } from '@/utlils/schema'
import { eq } from 'drizzle-orm'
import Webcam from "react-webcam";
import { Lightbulb, WebcamIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

function Interview() {
  const [interviewData, setInterviewData] = useState();
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const params = useParams()

  useEffect(() => {
    console.log(params.interviewId)
    GetInterviewDetails();
  }, [])

  /**
    GetInterviewDetails is a function that fetches the interview details from the database using the interviewId from the URL.u 
    Used to get interview  details by MockId/ interview Id
   */

  const GetInterviewDetails=async()=>{
    const result=await db.select().from(MockInterview).where(eq(MockInterview.mockId, params.interviewId))


    setInterviewData(result[0]);
  }
  
  return (
    <div className = 'my-10 flex justify-center flex-col items-center'>
      <h2 className='text-2xl font-bold'>Let's Get Started</h2>
             <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-10'>
         {/* Left Column - Webcam */}
         <div className="flex flex-col items-center">
           { webCamEnabled ? 
             <Webcam 
               onUserMedia={()=>setWebCamEnabled(true)}
               onUserMediaError={()=>setWebCamEnabled(false)}
               mirrored={true}
               style={{
                 width: 300,
                 height: 300,
               }}
             />
             :
             <>
               <WebcamIcon className='w-full my-7 h-68 p-20 bg-gray-300 rounded-lg border' />
               <Button   onClick={()=>setWebCamEnabled(true)}>Enable Webcam and Microphone</Button>
             </>
           }
         </div>

         {/* Right Column - Job Information */}
         <div className="flex flex-col justify-center">
           {interviewData && (
             <div className="p-5 border rounded-lg bg-secondary">
               <h2 className="text-lg mb-3">
                 <strong>Job Role/Job Position: </strong>
                 {interviewData.jobPosition}
               </h2>
               <h2 className="text-lg mb-3">
                 <strong>Job Description: </strong>
                 {interviewData.jobDesc}
               </h2>
               <h2 className="text-lg">
                 <strong>Years of Experience: </strong>
                 {interviewData.jobExperience}
               </h2>
             </div>
           )}
         </div>

         {/* <div>
            <h2><Lightbulb/> <strong>Information</strong></h2>
         </div> */}
       </div>

      <div className='flex justify-center items-center mt-10'>
        <Link href={`/dashboard/interview/${params.interviewId}/start`}>
          <Button>Start Interview</Button>
        </Link>
      </div>
      
    </div>

      
  )
}

export default Interview