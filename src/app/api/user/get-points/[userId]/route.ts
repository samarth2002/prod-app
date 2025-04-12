import { NextResponse } from 'next/server'
import { User } from '@/lib/server/models';

type Params = {
    userId: string;
}

export async function GET(request: Request, { params }: { params: Promise<{userId: string}>}) {
    const { userId } = await params
    try {
        const currentUser = await User.findById(userId).lean()
        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }
        console.log(currentUser)

        return NextResponse.json({ success: true, points: currentUser.availablePoints })
    } catch (error) {
        console.error('Error fetching points:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}