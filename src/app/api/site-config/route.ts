import { NextResponse } from 'next/server';
import { getSiteSettings, saveSiteSettings } from '../../../../utils/siteConfig';
import { getAuthenticatedUser } from '../../../../utils/apiAuth';

export async function GET() {
  try {
    const settings = getSiteSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load site config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const updated = saveSiteSettings(body);
    return NextResponse.json({ settings: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update site config' }, { status: 500 });
  }
}
