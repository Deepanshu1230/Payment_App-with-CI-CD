"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth";
import prisma from "@repo/db/client";



export async function createOnRamp(amount:number,provider:string){
  const session=await getServerSession(authOptions);
  const token=(Math.random()*100).toString();
  const userId=session?.user?.id;
  if(!userId){
    return {
        message:"Login first"
    }
  }

  await prisma.onRampTransaction.create({
    data:{
        userId:Number(userId),
        provider,
        amount,
        startTime:new Date(),
        status:"Processing",
        token:token
    }
  })
  return {
    message:"On ramp Added"
  }
} 