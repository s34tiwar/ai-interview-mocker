'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/utlils/db'
import { MockInterview } from '@/utlils/schema'
import { eq } from 'drizzle-orm'
import QuestionsSection from './_components/QuestionsSection'
import RecordAnswerSection from './_components/RecordAnswerSection'
import { Button } from '@/components/ui/button'

function StartInterview() {
    const params = useParams()
    const [interviewData, setInterviewData]=useState();
    const [mockInterviewQuestions, setMockInterviewQuestions]=useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex]=useState(0);


    useEffect(()=>{
        GetInterviewDetails();
    },[])

      /**
    GetInterviewDetails is a function that fetches the interview details from the database using the interviewId from the URL.u 
    Used to get interview  details by MockId/ interview Id
   */

  const GetInterviewDetails=async()=>{
    const result=await db.select().from(MockInterview).where(eq(MockInterview.mockId, params.interviewId))

    setInterviewData(result[0]);

    const jsonMockResp=JSON.parse(result[0].jsonMockResponse);
    console.log('Raw JSON Response:', jsonMockResp);
    
    // Fix: Extract the correct array from the response
    let questions = [];
    if (jsonMockResp.mockInterviewQuestions && Array.isArray(jsonMockResp.mockInterviewQuestions)) {
      questions = jsonMockResp.mockInterviewQuestions;
    } else if (jsonMockResp.interviewQuestions && Array.isArray(jsonMockResp.interviewQuestions)) {
      questions = jsonMockResp.interviewQuestions;
    } else if (Array.isArray(jsonMockResp)) {
      questions = jsonMockResp;
    }
    
    console.log('Setting questions array:', questions);
    console.log('Questions array length:', questions.length);
    setMockInterviewQuestions(questions);
  }
  


  return (
    <div className="min-h-screen bg-background">
        <div className='container mx-auto p-4 max-w-7xl'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 h-full'>
                {/* Questions*/}
                <div className="flex flex-col">
                    <QuestionsSection  mockInterviewQuestions={mockInterviewQuestions} activeQuestionIndex={activeQuestionIndex}/>
                </div>

                {/* video/ Audio Recorder */}
                <div className="flex flex-col">
                    <RecordAnswerSection
                    mockInterviewQuestions={mockInterviewQuestions} 
                    activeQuestionIndex={activeQuestionIndex}
                    interviewData={interviewData}
                    />
                </div>
            </div>

            <div className='flex justify-center gap-6 mt-4'>
              {activeQuestionIndex > 0 && (
                <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)}>
                  Previous Question
                </Button>
              )}
              
              {mockInterviewQuestions && mockInterviewQuestions.length > 0 && activeQuestionIndex < (mockInterviewQuestions.length - 1) && (
                <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}>
                  Next Question
                </Button>
              )}
              
              {mockInterviewQuestions && mockInterviewQuestions.length > 0 && activeQuestionIndex === (mockInterviewQuestions.length - 1) && (
                <Button onClick={()=>{}}>
                  End Interview
                </Button>
              )}
            </div>
        </div>
    </div>
  )
}

export default StartInterview