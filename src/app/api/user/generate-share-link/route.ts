import { NextResponse } from 'next/server';
import { User } from '@/lib/server/models';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    const { userId } = await req.json();
    try {
        const currentUser = await User.findById(userId).lean()

        if (!currentUser) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }
        let linkId
        if (!currentUser?.commonDashboardLink) {
            linkId = uuidv4();

            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { commonDashboardLink: linkId },
                { new: true, lean: true }
            );

        }else{
            linkId = currentUser.commonDashboardLink
        }

        const baseUrl = process.env.WEB_BASE_URL || 'http://localhost:3000';
        const shareLink = `${baseUrl}/shared/${linkId}`;

        return NextResponse.json({ success: true, shareLink });
    } catch (err) {
        console.error(err); 
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
