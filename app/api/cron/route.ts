import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

const GET = async (request: NextRequest) => {
    console.log("Hello World - Cron job is working");
    return NextResponse.json({ message: "Hello World" }, {status: 200});
}