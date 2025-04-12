


import { NextResponse } from 'next/server'
import { User } from '@/lib/server/models';

export async function POST(request: Request) {
    const { userId, decrementValue } = await request.json()
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $inc: { availablePoints: -Math.abs(decrementValue) } }, 
            { new: true, lean: true }
        );
        

        return NextResponse.json({ success: true, updatedUser: updatedUser })
    } catch (error) {
        console.error('Error fetching points:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}