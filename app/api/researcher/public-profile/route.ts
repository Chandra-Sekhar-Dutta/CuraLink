import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, researcherProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userIdNum = parseInt(userId);

    // Check if this is a mock user ID (1001-1005)
    if (userIdNum >= 1001 && userIdNum <= 1005) {
      const mockProfiles: any = {
        1001: {
          id: 1001,
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@stanford.edu',
          image: '',
          avatar: 'SJ',
          affiliation: 'Stanford University',
          department: 'Department of Neuroscience',
          position: 'Senior Research Scientist',
          specialties: ['Neurodegenerative Diseases', 'Alzheimer\'s Research', 'Clinical Trials'],
          interests: ['Brain Imaging', 'Cognitive Neuroscience', 'Biomarker Discovery'],
          orcid: '0000-0002-1234-5678',
          researchGate: 'https://www.researchgate.net/profile/Sarah-Johnson',
          phone: '+1-650-555-0123',
        },
        1002: {
          id: 1002,
          name: 'Dr. Michael Chen',
          email: 'mchen@mit.edu',
          image: '',
          avatar: 'MC',
          affiliation: 'MIT',
          department: 'Department of Bioengineering',
          position: 'Associate Professor',
          specialties: ['Bioengineering', 'Medical Devices', 'Tissue Engineering'],
          interests: ['3D Bioprinting', 'Regenerative Medicine', 'Biomaterials'],
          orcid: '0000-0001-2345-6789',
          researchGate: 'https://www.researchgate.net/profile/Michael-Chen',
          phone: '+1-617-555-0124',
        },
        1003: {
          id: 1003,
          name: 'Dr. Emily Rodriguez',
          email: 'erodriguez@jhu.edu',
          image: '',
          avatar: 'ER',
          affiliation: 'Johns Hopkins',
          department: 'Department of Oncology',
          position: 'Principal Investigator',
          specialties: ['Cancer Research', 'Immunotherapy', 'Precision Medicine'],
          interests: ['Tumor Immunology', 'CAR-T Therapy', 'Cancer Genomics'],
          orcid: '0000-0003-3456-7890',
          researchGate: 'https://www.researchgate.net/profile/Emily-Rodriguez',
          phone: '+1-410-555-0125',
        },
        1004: {
          id: 1004,
          name: 'Dr. James Williams',
          email: 'jwilliams@harvard.edu',
          image: '',
          avatar: 'JW',
          affiliation: 'Harvard Medical School',
          department: 'Department of Genetics',
          position: 'Research Fellow',
          specialties: ['Genetics', 'Gene Therapy', 'Rare Diseases'],
          interests: ['CRISPR Technology', 'Genetic Counseling', 'Personalized Medicine'],
          orcid: '0000-0004-4567-8901',
          researchGate: 'https://www.researchgate.net/profile/James-Williams',
          phone: '+1-617-555-0126',
        },
        1005: {
          id: 1005,
          name: 'Dr. Priya Patel',
          email: 'ppatel@mayo.edu',
          image: '',
          avatar: 'PP',
          affiliation: 'Mayo Clinic',
          department: 'Department of Cardiology',
          position: 'Clinical Researcher',
          specialties: ['Cardiovascular Disease', 'Heart Failure', 'Clinical Trials'],
          interests: ['Cardiac Imaging', 'Heart Transplantation', 'Preventive Cardiology'],
          orcid: '0000-0005-5678-9012',
          researchGate: 'https://www.researchgate.net/profile/Priya-Patel',
          phone: '+1-507-555-0127',
        },
      };

      const profile = mockProfiles[userIdNum];
      if (profile) {
        return NextResponse.json({
          success: true,
          profile,
          mock: true,
        });
      }
    }

    // Fetch researcher profile from database
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        affiliation: researcherProfiles.affiliation,
        department: researcherProfiles.department,
        position: researcherProfiles.position,
        specialties: researcherProfiles.specialtiesCsv,
        interests: researcherProfiles.interestsCsv,
        orcid: researcherProfiles.orcid,
        researchGate: researcherProfiles.researchGate,
        phone: researcherProfiles.phone,
      })
      .from(users)
      .innerJoin(researcherProfiles, eq(users.id, researcherProfiles.userId))
      .where(eq(users.id, userIdNum))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = result[0];

    // Get initials from name
    const getInitials = (name: string | null) => {
      if (!name) return '??';
      return name
        .split(' ')
        .filter((word) => word !== 'Dr.' && word !== 'Prof.')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    // Format the profile data
    const formattedProfile = {
      id: profile.id,
      name: profile.name || 'Anonymous Researcher',
      email: profile.email,
      image: profile.image,
      avatar: getInitials(profile.name),
      affiliation: profile.affiliation || 'Not specified',
      department: profile.department,
      position: profile.position,
      specialties: profile.specialties ? profile.specialties.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      interests: profile.interests ? profile.interests.split(',').map((i: string) => i.trim()).filter(Boolean) : [],
      orcid: profile.orcid,
      researchGate: profile.researchGate,
      phone: profile.phone,
    };

    return NextResponse.json({
      success: true,
      profile: formattedProfile,
    });
  } catch (error) {
    console.error('Error fetching researcher profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
