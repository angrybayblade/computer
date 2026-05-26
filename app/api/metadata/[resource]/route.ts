import { NextResponse } from "next/server";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import {
  assertResourceSlug,
  createResource,
  listResource,
  listResourceRowsForEditor,
} from "@/lib/db/repositories";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resource: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const slug = assertResourceSlug(resource);
    const forEditor = _request.headers.get("x-edit-mode") === "1";

    if (forEditor) {
      const authenticated = await isEditAuthenticated();
      if (!authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(listResourceRowsForEditor(slug));
    }

    return NextResponse.json(listResource(slug));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authenticated = await isEditAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resource } = await context.params;
    const slug = assertResourceSlug(resource);
    const body = (await request.json()) as Record<string, unknown>;
    const created = createResource(slug, body);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
