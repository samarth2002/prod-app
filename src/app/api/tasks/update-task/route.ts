import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/lib/server/models';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { _id, name, subTasks } = body;

        if (!_id) {
            return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 });
        }

        const updatePayload: any = {};

        if (name) updatePayload.name = name;

        if (subTasks && Array.isArray(subTasks)) {
            updatePayload.subTasks = subTasks;
            updatePayload.totalPoints = subTasks.reduce(
                (acc: number, subTask: { points: number }) => acc + (subTask?.points || 0),
                0
            );
        }

        const updatedTask = await Task.findByIdAndUpdate(_id, updatePayload, {
            new: true, 
        });

        if (!updatedTask) {
            return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, task: updatedTask }, { status: 200 });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
