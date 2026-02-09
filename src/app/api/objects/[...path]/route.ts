export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getObjectFile } from "@/lib/objectStorage";

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const objectPath = params.path.join("/");
    const file = await getObjectFile(objectPath);

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    const [contents] = await file.download();

    return new NextResponse(new Uint8Array(contents), {
      headers: {
        "Content-Type": (metadata.contentType as string) || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving object:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
