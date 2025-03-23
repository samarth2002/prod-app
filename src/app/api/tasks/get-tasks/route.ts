import { NextResponse } from 'next/server';
import { Task } from '@/lib/server/models';

export async function GET() {
    try {
        const tasksFromDb = await Task.find().lean(); 

        const cleanedTasks = tasksFromDb.map((task: any) => ({
            ...task,
            subTasks: task.subTasks.map(({ _id, ...rest }: any) => rest), 
        }));

        return NextResponse.json({ success: true, tasks: cleanedTasks }, { status: 200 });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
