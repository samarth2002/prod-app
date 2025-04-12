import { NextRequest, NextResponse } from 'next/server';
import { Task, User } from '@/lib/server/models';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, name, subTasks } = body;

        if (!userId || !name) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let totalPoints = 0;

        if (subTasks && Array.isArray(subTasks)) {
            totalPoints = subTasks.reduce((acc, subTask) => acc + subTask?.points, 0);
        } else {
            return NextResponse.json(
                { success: false, error: 'Bad subTasks format' },
                { status: 400 }
            );
        }

        const task = new Task({
            name,
            subTasks: subTasks || [],
            totalPoints: totalPoints || 0,
        });

        const newTask = await task.save();

        await User.findByIdAndUpdate(userId, {
            $push: { tasksId: newTask._id },
            $inc: {
                totalPoints: totalPoints,
                availablePoints: totalPoints,
            },
        });

        return NextResponse.json({ success: true, task: newTask }, { status: 201 });
    } catch (error) {
        console.error('Error creating task: ', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
