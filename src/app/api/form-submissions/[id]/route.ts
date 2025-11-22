import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/form-submissions/[id] - Update a form submission (mark as read)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const submission = await db.formSubmission.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error updating form submission:', error)
    return NextResponse.json(
      { error: 'Failed to update form submission' },
      { status: 500 }
    )
  }
}

// DELETE /api/form-submissions/[id] - Delete a form submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.formSubmission.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting form submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete form submission' },
      { status: 500 }
    )
  }
}
