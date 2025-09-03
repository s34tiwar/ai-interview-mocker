"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { toast } from "sonner"
import { chatSession } from '@/utlils/GeminiAIModal'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utlils/db'
import { UserAnswer } from '@/utlils/schema'

function RecordAnswerSection({ mockInterviewQuestions, activeQuestionIndex, interviewData }) {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [speechToTextHook, setSpeechToTextHook] = useState({
    error: null,
    interimResult: '',
    isRecording: false,
    results: [],
    startSpeechToText: () => { },
    stopSpeechToText: () => { },
  });

  // Get questions array from props
  const questionsArray = mockInterviewQuestions?.interviewQuestions ||
    mockInterviewQuestions?.mockInterviewQuestions ||
    mockInterviewQuestions?.questions ||
    (Array.isArray(mockInterviewQuestions) ? mockInterviewQuestions : []);

  useEffect(() => {
    setIsClient(true);

    // Dynamically import and initialize the speech-to-text hook only on client
    const initializeSpeechToText = async () => {
      try {
        const { useSpeechToText } = await import('react-speech-to-text');

        // We need to use a different approach since hooks can't be called conditionally
        // Let's use the native Web Speech API instead
        const initSpeechRecognition = () => {
          if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
          }

          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();

          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          let isRecording = false;
          let results = [];
          let interimResult = '';

          recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                final += transcript;
              } else {
                interim += transcript;
              }
            }

            if (final) {
              results.push({
                transcript: final,
                timestamp: Date.now()
              });
            }

            interimResult = interim;

            setSpeechToTextHook(prev => ({
              ...prev,
              results: [...results],
              interimResult: interim
            }));
          };

          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setSpeechToTextHook(prev => ({
              ...prev,
              error: event.error,
              isRecording: false
            }));
          };

          recognition.onstart = () => {
            isRecording = true;
            setSpeechToTextHook(prev => ({
              ...prev,
              isRecording: true,
              error: null
            }));
          };

          recognition.onend = () => {
            isRecording = false;
            setSpeechToTextHook(prev => ({
              ...prev,
              isRecording: false
            }));
          };

          const startSpeechToText = () => {
            if (!isRecording) {
              recognition.start();
            }
          };

          const stopSpeechToText = () => {
            if (isRecording) {
              recognition.stop();
            }
          };

          setSpeechToTextHook({
            error: null,
            interimResult: '',
            isRecording: false,
            results: [],
            startSpeechToText,
            stopSpeechToText,
          });
        };

        initSpeechRecognition();
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    };

    initializeSpeechToText();
  }, []);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = speechToTextHook;

  // Update userAnswer when speech recognition results change
  useEffect(() => {
    const combinedAnswer = results.map(result => result.transcript).join(' ').trim();
    setUserAnswer(combinedAnswer);
  }, [results]);

  useEffect(()=>{
    if(!isRecording && userAnswer?.length > 10){
      UpdateUserAnswerInDb();
    }
  },[userAnswer, isRecording])


  const StopStartRecording = async () => {
    if (isRecording) {
      stopSpeechToText();

      // Get the user answer after stopping recording
      const userAnswer = results.map(result => result.transcript).join(' ');

      if (userAnswer?.length < 10) {
        setIsLoading(false);
        toast('Please record a longer answer (minimum 10 characters)');
        return;
      }

      try {
        // const feedbackPrompt = "Question: " + questionsArray[activeQuestionIndex]?.question +
        //   "\n\nUser Answer: " + userAnswer +
        //   "\n\nDepends on question and user answer for given interview question please give us rating for answer and feedback as area of improvement if any. In just 3 - 5 lines to improve it. Provide the feedback in JSON format with rating field and feedback field";

        // const result = await chatSession.sendMessage(feedbackPrompt);

        // const mockJsonResp = result.response.text().replace(/```json/g, '').replace(/```/g, '');

        // console.log('AI Feedback:', mockJsonResp);

        // const JsonFeedbackResp = JSON.parse(mockJsonResp);

        // Database insertion is now handled in UpdateUserAnswerInDb function


        // if (resp) {
        //   toast.success('Answer recorded and analyzed successfully!');
        // }
        // else {
        //   toast.error('Failed to analyze answer. Please try again.');
        // }
        // setUserAnswer('');
        // setIsLoading(false);



        // Save the answer logic here
        console.log('Saving user answer:', userAnswer);
        toast.success('Answer recorded and analyzed successfully!');
      } catch (error) {
        console.error('Error getting AI feedback:', error);
        toast.error('Failed to analyze answer. Please try again.');
      }
    }
    else {
      startSpeechToText();
      toast.info('Recording started. Please speak your answer.');
    }
  }

  const UpdateUserAnswerInDb=async()=> {

    setIsLoading(true);


    const feedbackPrompt = "Question: " + questionsArray[activeQuestionIndex]?.question +
      "\n\nUser Answer: " + userAnswer +
      "\n\nDepends on question and user answer for given interview question please give us rating for answer and feedback as area of improvement if any. In just 3 - 5 lines to improve it. Provide the feedback in JSON format with rating field and feedback field";

    const result = await chatSession.sendMessage(feedbackPrompt);

    const mockJsonResp = result.response.text().replace(/```json/g, '').replace(/```/g, '');

    console.log('AI Feedback:', mockJsonResp);

    const JsonFeedbackResp = JSON.parse(mockJsonResp);

    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewData?.mockId,
      question: questionsArray[activeQuestionIndex]?.question,
      correctAns: questionsArray[activeQuestionIndex]?.answer,
      userAnswer: userAnswer,
      feedback: JsonFeedbackResp?.feedback,
      rating: JsonFeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress,
      createdAt: new Date().toISOString(),
    })


    if (resp) {
      toast.success('Answer recorded and analyzed successfully!');
    }
    else {
      toast.error('Failed to analyze answer. Please try again.');
    }
    setUserAnswer('');
    setIsLoading(false);

  }



  return (
    <div className='h-full flex flex-col'>
      <div className='p-5 border rounded-lg flex-1 flex flex-col gap-6'>

        {/* Webcam Section */}
        <div className='flex flex-col justify-center items-center bg-secondary rounded-lg p-5 relative min-h-[300px]'>
          <Image src={'/webcam.jpg'} alt='webcam' width={200} height={200}
            className='absolute opacity-20' />
          <Webcam
            mirrored={true}
            className="rounded-lg border-2 border-gray-200 shadow-lg"
            style={{
              width: '100%',
              maxWidth: 400,
              height: 'auto',
              zIndex: 10,
            }}
          />
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col gap-4">
          <Button variant={'outline'} className="w-full py-3 text-lg font-medium">
            Record Answer
          </Button>

          {/* Speech Recognition Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Recording Status:
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${isRecording ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {isRecording ? 'Recording' : 'Stopped'}
                </span>
              </span>
            </div>

            <button
              disabled={isLoading}
              onClick={StopStartRecording}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
              {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
            </button>
          </div>

          {/* Transcription Results */}
          {(results.length > 0 || interimResult) && (
            <div className="bg-white border rounded-lg p-4 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Your Answer:</h4>
              <div className="space-y-2">
                {results.map((result) => (
                  <p key={result.timestamp} className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {result.transcript}
                  </p>
                ))}
                {interimResult && (
                  <p className="text-sm text-gray-500 italic p-2 border-l-2 border-blue-300 bg-blue-50">
                    {interimResult}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecordAnswerSection