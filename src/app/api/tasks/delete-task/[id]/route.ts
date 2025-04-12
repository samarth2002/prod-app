import { NextRequest, NextResponse } from 'next/server';
import { Task, User } from '@/lib/server/models';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const {id: taskId} = await params;

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId' },
                { status: 400 }
            );
        }

        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return NextResponse.json(
                { success: false, error: 'Task not found' },
                { status: 404 }
            );
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { tasksId: taskId },
        });

        return NextResponse.json(
            { success: true, message: 'Task deleted and user updated' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
