import { NextRequest, NextResponse } from 'next/server'
import { Task } from '@/lib/server/models';

export async function POST(req: NextRequest){
    try{
        const body = await req.json();

        const { name, subTasks } = body;

        if(!name){
            return NextResponse.json({success: false, error: 'Missing required fields'},{status: 400})
        }

        let totalPoints = 0

        if(subTasks && Array.isArray(subTasks)){
            totalPoints = subTasks.reduce((acc, subTask) => acc+subTask?.points, 0);
        } else if (!Array.isArray(subTasks)){
            return NextResponse.json({ success: false, error: 'Bad subTasks format' }, { status: 500 })
        }

        const task = new Task({
            name, 
            subTasks: subTasks || [],
            totalPoints: totalPoints || 0
        })

        const newTask = await task.save();
        
        return NextResponse.json({success: true, task: newTask},{ status: 201})
    }catch(error){
        console.error("Error creating task: ", error);
        return NextResponse.json({success:false, error: "Internal server error"},{ status: 500})
    }
}