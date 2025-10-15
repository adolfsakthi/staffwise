
'use server';

import { NextRequest, NextResponse } from 'next/server';

// This file is part of a reverted set of changes and is no longer in use.
// It is intentionally left with minimal functionality.

export async function GET(request: NextRequest) {
    return NextResponse.json({ message: 'This endpoint is not in use.' }, { status: 404 });
}
