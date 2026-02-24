import { NextRequest, NextResponse } from 'next/server';
import { executeCode } from '@/lib/executor';
import { ExecuteRequest } from '@/types/execution';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecuteRequest;

    if (!body.language || !body.code) {
      return NextResponse.json(
        { error: 'language and code are required' },
        { status: 400 }
      );
    }

    if (body.code.length > 50000) {
      return NextResponse.json(
        { error: 'Code too large' },
        { status: 400 }
      );
    }

    const result = await executeCode(
      body.language,
      body.code,
      body.tests || []
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
