import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/lib/server/models';

export async function DELETE(
    req: NextRequest,
    context: { params: { id: string } } 
) {
    const { id } = context.params;

    try {
        const deleted = await Task.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Task deleted" }, { status: 200 });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
