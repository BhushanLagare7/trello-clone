import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { ENTITY_TYPE } from "@/lib/generated/prisma/enums";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const { cardId } = await params;
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const auditLogs = await db.auditLog.findMany({
      where: {
        orgId,
        entityId: cardId,
        entityType: ENTITY_TYPE.CARD,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    return NextResponse.json(auditLogs);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
