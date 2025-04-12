import { NextRequest, NextResponse } from 'next/server';
import { Task, User } from '@/lib/server/models';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { _id, name, subTasks, userId } = body;

        if (!_id || !userId) {
            return NextResponse.json(
                { success: false, error: 'Task ID and User ID are required' },
                { status: 400 }
            );
        }

        const existingTask = await Task.findById(_id);
        if (!existingTask) {
            return NextResponse.json(
                { success: false, error: 'Task not found' },
                { status: 404 }
            );
        }

        const oldPoints = existingTask.totalPoints;

        const updatePayload: any = {};
        if (name) updatePayload.name = name;

        let newTotalPoints = oldPoints;

        if (subTasks && Array.isArray(subTasks)) {
            updatePayload.subTasks = subTasks;
            newTotalPoints = subTasks.reduce(
                (acc: number, subTask: { points: number }) => acc + (subTask?.points || 0),
                0
            );
            updatePayload.totalPoints = newTotalPoints;
        }

        const updatedTask = await Task.findByIdAndUpdate(_id, updatePayload, {
            new: true,
        });

        if (!updatedTask) {
            return NextResponse.json(
                { success: false, error: 'Task update failed' },
                { status: 500 }
            );
        }

        const pointDifference = newTotalPoints - oldPoints;

        await User.findByIdAndUpdate(userId, {
            $inc: {
                totalPoints: pointDifference,
                availablePoints: pointDifference,
            },
        });

        return NextResponse.json({ success: true, task: updatedTask }, { status: 200 });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
