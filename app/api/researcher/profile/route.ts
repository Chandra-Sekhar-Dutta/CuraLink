import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { db } from '@/db';
import { researcherProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

function toCsv(list: string[] | undefined) {
  return (list || []).map((s) => s.trim()).filter(Boolean).join(',');
}

function fromCsv(csv: string | null) {
  if (!csv) return [] as string[];
  return csv.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(String(session.user.id));

  try {
    const rows = await db.select().from(researcherProfiles).where(eq(researcherProfiles.userId, userId)).limit(1);
    const row = rows[0];
    if (!row) return NextResponse.json({ profile: null });
    return NextResponse.json({
      profile: {
        specialties: fromCsv(row.specialtiesCsv),
        interests: fromCsv(row.interestsCsv),
        orcid: row.orcid || '',
        researchGate: row.researchGate || '',
        affiliation: row.affiliation || '',
        department: row.department || '',
        position: row.position || '',
        phone: row.phone || '',
        availableForMeetings: !!row.availableForMeetings,
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(String(session.user.id));

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const payload = {
    userId,
    specialtiesCsv: toCsv(body.specialties as string[]),
    interestsCsv: toCsv(body.interests as string[]),
    orcid: (body.orcid ?? '').slice(0, 19) || null,
    researchGate: (body.researchGate ?? '') || null,
    affiliation: (body.affiliation ?? '').slice(0, 255) || null,
    department: (body.department ?? '').slice(0, 255) || null,
    position: (body.position ?? '').slice(0, 255) || null,
    phone: (body.phone ?? '').slice(0, 50) || null,
    availableForMeetings: body.availableForMeetings !== false, // default true
  };

  try {
    const existing = await db.select().from(researcherProfiles).where(eq(researcherProfiles.userId, userId)).limit(1);
    if (existing[0]) {
      await db.update(researcherProfiles).set({
        specialtiesCsv: payload.specialtiesCsv,
        interestsCsv: payload.interestsCsv,
        orcid: payload.orcid,
        researchGate: payload.researchGate,
        affiliation: payload.affiliation,
        department: payload.department,
        position: payload.position,
        phone: payload.phone,
        availableForMeetings: payload.availableForMeetings,
        updatedAt: new Date(),
      }).where(eq(researcherProfiles.userId, userId));
    } else {
      await db.insert(researcherProfiles).values({ ...payload });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Failed to save researcher profile:', e);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
