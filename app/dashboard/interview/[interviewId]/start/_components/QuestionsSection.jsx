"use client"
import { Lightbulb, Volume, Volume2 } from 'lucide-react';
import React from 'react'
import { useState, useEffect } from 'react'

function QuestionsSection({mockInterviewQuestions, activeQuestionIndex}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const textToSpeech = (text) => {
    if(!isClient) return;
    
    if('speechSynthesis' in window){
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    }
    else{
      alert('Sorry, your browser does not support text to speech');
    }
  } 

  const questionsArray = mockInterviewQuestions?.interviewQuestions || 
                        mockInterviewQuestions?.mockInterviewQuestions || 
                        mockInterviewQuestions?.questions || 
                        (Array.isArray(mockInterviewQuestions) ? mockInterviewQuestions : []);
  
  return (
    <div className='h-full flex flex-col'>
      <div className='p-5 border rounded-lg flex-1 flex flex-col'>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Questions Section</h3>
          
          {/* Question Navigation Cards - Improved scrollable grid */}
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2'>
            {questionsArray && questionsArray.length > 0 && 
              questionsArray.map((question,index)=>(
                <div key={index} className={`p-3 border rounded-lg text-center text-xs font-medium cursor-pointer transition-all duration-200 hover:shadow-md ${activeQuestionIndex === index ? 'bg-primary text-white border-primary shadow-lg' : 'bg-secondary hover:bg-secondary/80'}`}>
                  Q{index+1}
                </div>
              ))
            }
          </div>
        </div>

        {/* Current Question Display */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <h2 className='text-lg md:text-xl font-medium leading-relaxed mb-4'>
              {questionsArray[activeQuestionIndex]?.question}
            </h2>
            
            {/* Text to Speech Button */}
            <button 
              onClick={()=>textToSpeech(questionsArray[activeQuestionIndex]?.question)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            >
              <Volume2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Listen</span>
            </button>
          </div>

          {/* Note Section */}
          <div className='border rounded-lg p-4 mt-auto bg-blue-50/50'>
            <h2 className='flex gap-2 items-center text-primary mb-2'>
              <Lightbulb className="w-5 h-5"/>
              <strong>Note:</strong>
            </h2>
            <p className='text-sm text-primary leading-relaxed'>
              {process.env.NEXT_PUBLIC_QUESTION_NOTE || "Click on Record Answer when you want to answer the question. At the end of the interview we will give you the feedback along with correct answer for each of question and your answer to compare it."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionsSection