import { NextResponse } from 'next/server';
import { Task } from '@/lib/server/models';
import { User } from '@/lib/server/models';


type Params = {
    userId: string;
};

export async function GET(request: Request, { params }: { params: Promise<Params> }) {

    const { userId } = await params;

    try {
        const currentUser = await User.findById(userId).lean()
        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }
        const tasks = currentUser.tasksId;

        const tasksFromDb = await Task.find({ _id: { $in: tasks } }).lean();

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
