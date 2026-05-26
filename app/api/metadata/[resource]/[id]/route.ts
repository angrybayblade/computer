import { NextResponse } from "next/server";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import {
  assertResourceSlug,
  deleteResource,
  getResourceRow,
  updateResource,
} from "@/lib/db/repositories";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resource: string; id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { resource, id } = await context.params;
    const slug = assertResourceSlug(resource);
    const row = getResourceRow(slug, id);

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authenticated = await isEditAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resource, id } = await context.params;
    const slug = assertResourceSlug(resource);
    const body = (await request.json()) as Record<string, unknown>;
    const updated = updateResource(slug, id, body);

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authenticated = await isEditAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resource, id } = await context.params;
    const slug = assertResourceSlug(resource);
    const deleted = deleteResource(slug, id);

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
