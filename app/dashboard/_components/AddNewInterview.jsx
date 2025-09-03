"use client"
import React, { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button.jsx'
import { chatSession } from '@/utlils/GeminiAIModal'
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs'

import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.jsx"
import { Textarea } from '@/components/ui/textarea.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { LoaderCircle } from 'lucide-react'
import { db } from '@/utlils/db'
import { MockInterview } from '@/utlils/schema'


function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false)
  const [jobTitle, setJobTitle] = useState();
  const [jobDescription, setJobDescription] = useState();
  const [yearsOfExperience, setYearsOfExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [JsonResponse, setJsonResponse] = useState([]);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Check if user is loaded and authenticated
    if (!isLoaded) {
      console.log('User data not loaded yet')
      setLoading(false)
      return
    }
    
    if (!user) {
      console.log('User not authenticated')
      alert('Please sign in to create an interview')
      setLoading(false)
      return
    }
    
    const formData = new FormData(e.target)
    const jobTitle = formData.get('jobTitle')
    const jobDescription = formData.get('jobDescription')
    const yearsOfExperience = formData.get('yearsOfExperience')

    console.log('Form submitted:', { jobTitle, jobDescription, yearsOfExperience })
    console.log('User at start of handleSubmit:', user)

    const InputPromot = `You are an AI interviewer. Your task is to generate a set of interview questions and their corresponding ideal answers based on the provided job details.

    **Job Details:**
    - **Job Position:** ${jobTitle}
    - **Job Description:** ${jobDescription}
    - **Years of Experience:** ${yearsOfExperience}
    
    **Instructions for Question Generation:**
    1.  Generate exactly ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions.
    2.  The questions must be highly relevant and tailored to the specified 'Job Position', 'Job Description', and 'Years of Experience'. Consider the seniority implied by the years of experience.
    3.  Include a diverse mix of question types to simulate a comprehensive interview. This should include:
        * **Technical Questions:** Deep dive into specific skills, technologies, tools, or methodologies explicitly mentioned in the 'Job Description'.
        * **Behavioral Questions:** Questions that start with "Tell me about a time when..." or "Describe a situation where..." to assess past performance and soft skills (e.g., teamwork, leadership, problem-solving, conflict resolution, adaptability).
        * **Situational Questions:** Present hypothetical scenarios relevant to the role to gauge decision-making, critical thinking, and how the candidate would handle future challenges.
        * **Problem-Solving/Case Study Questions:** If applicable to the role (e.g., for engineering, data science, product management), include a question that requires a structured approach to a complex problem.
        * **Role-Specific Questions:** Questions unique to the core responsibilities, challenges, and daily tasks outlined in the 'Job Description'.
        * **Motivation/Fit Questions:** Questions about the candidate's interest in this specific role and company, career aspirations, and how they align with the company culture.
    
    **Instructions for Answer Generation:**
    1.  For each question, provide a comprehensive, insightful, and ideal answer.
    2.  The answer should demonstrate a strong understanding of the topic, relevant experience, and professional communication.
    3.  Answers should be detailed enough to serve as a good example for a candidate, including specific examples, methodologies, and quantifiable results where appropriate.
    4.  Ensure answers align with best practices and industry standards for the given 'Job Position' and 'Years of Experience'.
    
    **Output Format:**
    JSON`;

    try {
      const result = await chatSession.sendMessage(InputPromot)
      const MockJsonResp = result.response.text().replace(/```json/g, '').replace(/```/g, '');
      console.log(JSON.parse(MockJsonResp));
      
      setJsonResponse(MockJsonResp);

      if (MockJsonResp) {
        // Debug user information
        console.log("User object:", user);
        console.log("Primary email:", user?.primaryEmailAddress?.emailAddress);
        
        // Get user email with fallback
        const userEmail = user?.primaryEmailAddress?.emailAddress || 
                         user?.emailAddresses?.[0]?.emailAddress || 
                         'unknown@example.com';
        
        console.log("Using email:", userEmail);

        const resp = await db.insert(MockInterview).values({
          mockId: uuidv4(),
          jsonMockResponse: MockJsonResp,
          jobPosition: jobTitle,
          jobDesc: jobDescription,
          jobExperience: yearsOfExperience,
          createdBy: userEmail,
          createdAt: new Date().toISOString(),
        }).returning({ mockId: MockInterview.mockId });

        console.log("Inserted Mock Interview with mockId:", resp[0].mockId);
        if(resp){
          setOpenDialog(false);
          router.push('/dashboard/interview/' + resp[0].mockId);
        }
      } else {
        console.log("No Mock Json Response");
      }
      
      setOpenDialog(false)
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false)
    }

  }
  return (
    <div>
      <div className='p-10 border round-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all duration-300' onClick={() => setOpenDialog(true)}>
        <h2 className='font-bold test-lg text-center'>+ Add New</h2>
      </div>

      <Dialog open={openDialog}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='font-bold text-2xl' >Tell us more about your interview </DialogTitle>
            <DialogDescription>
              Add Details about your Job postion/role, Job description, and the years of experience required
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mt-4">
                <div className='flex flex-col gap-2'>
                  <Label> Job Title</Label>
                  <Input name="jobTitle" placeholder='Ex. Software Engineer' required onChange={(e) => setJobTitle(e.target.value)} />
                </div>

                <div className='flex flex-col gap-2'>
                  <Label> Job Description/ Tech Stack </Label>
                  <Textarea name="jobDescription" placeholder='Ex. React, Node.js, MongoDB etc' required onChange={(e) => setJobDescription(e.target.value)} />
                </div>

                <div className='flex flex-col gap-2'>
                  <Label>Years of Experience</Label>
                  <Input name="yearsOfExperience" placeholder='Ex. 5' type='number' max="100" min="0" required onChange={(e) => setYearsOfExperience(e.target.value)} />
                </div>

                <div className='flex gap-5 justify-end mt-6'>
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ?
                      <>
                        <LoaderCircle className="animate-spin mr-2" />
                        Generating from AI
                      </>
                      :
                      'Start Interview'
                    }
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </div>

  )
}

export default AddNewInterview