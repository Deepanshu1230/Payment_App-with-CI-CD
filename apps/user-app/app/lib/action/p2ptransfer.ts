"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
//to whom we want to send the number and the amount
export default async function p2ptransfer(to: string, amount: number) {
  const session = await getServerSession(authOptions);
  const from = session?.user?.id;
  if (!from) {
    return {
      message: "Error while Sending the Number",
    };
  }

  const toUser = await prisma.user.findFirst({
    where: {
      number: to,
    },
  });

  if (!toUser) {
    return {
      message: "User Not Found",
    };
  }

  try{
    await prisma.$transaction(async (txns) => {
        await txns.$queryRaw`SELECT * FROM "Balance"
        WHERE "userId"= ${Number(from)} FOR UPDATE`; 
    const frombalance = await txns.balance.findUnique({
      where: {
        userId: Number(from),
      },
    });
    if (!frombalance || frombalance?.amount < amount) {
      throw new Error("Insuffucient Balance");
    }

    //the from user have the balance
    await txns.balance.update({
      where: {
        userId: Number(from),
      },
      data: {
        amount: {
          decrement: amount,
        },
      },
    });

    await txns.balance.update({
      where: {
        userId: toUser.id,
      },
      data: {
        amount: {
          increment: amount,
        },
      },
    });
    await txns.p2pTransfer.create({
        data:{
            fromUserId:from,
            toUserId:toUser.id,
            amount,
            timestamp:new Date()
        }
    })

    
    //increment of the from user
    //decrement of the to user
  });
  return {
    message:"Transfer SuccessFull"
  }

  }
  catch(error:any){
    return { message: error.message || "Transfer failed" };
  }

  

}
