import { NextResponse } from "next/server"
import  db from "@repo/db/client";


export const dynamic = 'force-dynamic';

export const GET = async () => {
    await db.user.create({
        data: {
            email: "asd",
            name: "adsads",
            number:"082049820",
            password:"1232434"
        }
    })
    return NextResponse.json({
        message: "hi there"
    })
}