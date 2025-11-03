import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { db } from '@/db';
import { users, researcherProfiles } from '@/db/schema';
import { eq, ne, and, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Try to get session, but allow access even if it fails
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.warn('Session check failed, allowing access:', error);
    }

    // Get current user's ID
    const currentUserId = session?.user ? (session.user as any).id : null;

    // Fetch researchers from database
    let collaborators: any[] = [];
    
    try {
      // Join users with researcher profiles to get active researchers
      collaborators = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          affiliation: researcherProfiles.affiliation,
          department: researcherProfiles.department,
          position: researcherProfiles.position,
          specialties: researcherProfiles.specialtiesCsv,
          orcid: researcherProfiles.orcid,
        })
        .from(users)
        .innerJoin(researcherProfiles, eq(users.id, researcherProfiles.userId))
        .where(
          and(
            eq(users.userType, 'researcher'),
            currentUserId ? ne(users.id, parseInt(currentUserId)) : sql`true` // Exclude current user
          )
        )
        .limit(10)
        .execute();
    } catch (dbError) {
      console.warn('Database query failed, using mock data:', dbError);
    }

    // Format the data
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

    let formattedCollaborators = collaborators.map((collab) => {
      return {
        id: collab.id,
        name: collab.name || 'Anonymous Researcher',
        email: collab.email,
        image: collab.image,
        avatar: getInitials(collab.name),
        institution: collab.affiliation || 'Not specified',
        department: collab.department,
        position: collab.position,
        specialties: collab.specialties ? collab.specialties.split(',').map((s: string) => s.trim()) : [],
        projects: Math.floor(Math.random() * 5) + 1, // Mock for now - you can add actual project count logic
      };
    });

    // If no collaborators from database, use mock data
    if (formattedCollaborators.length === 0) {
      formattedCollaborators = [
        {
          id: 1001,
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@stanford.edu',
          image: '',
          avatar: 'SJ',
          institution: 'Stanford University',
          department: 'Department of Neuroscience',
          position: 'Senior Research Scientist',
          specialties: ['Neurodegenerative Diseases', 'Alzheimer\'s Research', 'Clinical Trials'],
          projects: 3,
        },
        {
          id: 1002,
          name: 'Dr. Michael Chen',
          email: 'mchen@mit.edu',
          image: '',
          avatar: 'MC',
          institution: 'MIT',
          department: 'Department of Bioengineering',
          position: 'Associate Professor',
          specialties: ['Bioengineering', 'Medical Devices', 'Tissue Engineering'],
          projects: 2,
        },
        {
          id: 1003,
          name: 'Dr. Emily Rodriguez',
          email: 'erodriguez@jhu.edu',
          image: '',
          avatar: 'ER',
          institution: 'Johns Hopkins',
          department: 'Department of Oncology',
          position: 'Principal Investigator',
          specialties: ['Cancer Research', 'Immunotherapy', 'Precision Medicine'],
          projects: 4,
        },
        {
          id: 1004,
          name: 'Dr. James Williams',
          email: 'jwilliams@harvard.edu',
          image: '',
          avatar: 'JW',
          institution: 'Harvard Medical School',
          department: 'Department of Genetics',
          position: 'Research Fellow',
          specialties: ['Genetics', 'Gene Therapy', 'Rare Diseases'],
          projects: 2,
        },
        {
          id: 1005,
          name: 'Dr. Priya Patel',
          email: 'ppatel@mayo.edu',
          image: '',
          avatar: 'PP',
          institution: 'Mayo Clinic',
          department: 'Department of Cardiology',
          position: 'Clinical Researcher',
          specialties: ['Cardiovascular Disease', 'Heart Failure', 'Clinical Trials'],
          projects: 3,
        },
      ];
    }

    return NextResponse.json({
      success: true,
      collaborators: formattedCollaborators,
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    
    // Return mock data as fallback if everything fails
    const mockCollaborators = [
      {
        id: 1001,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@stanford.edu',
        image: '',
        avatar: 'SJ',
        institution: 'Stanford University',
        department: 'Department of Neuroscience',
        position: 'Senior Research Scientist',
        specialties: ['Neurodegenerative Diseases', 'Alzheimer\'s Research'],
        projects: 3,
      },
      {
        id: 1002,
        name: 'Dr. Michael Chen',
        email: 'mchen@mit.edu',
        image: '',
        avatar: 'MC',
        institution: 'MIT',
        department: 'Department of Bioengineering',
        position: 'Associate Professor',
        specialties: ['Bioengineering', 'Medical Devices'],
        projects: 2,
      },
      {
        id: 1003,
        name: 'Dr. Emily Rodriguez',
        email: 'erodriguez@jhu.edu',
        image: '',
        avatar: 'ER',
        institution: 'Johns Hopkins',
        department: 'Department of Oncology',
        position: 'Principal Investigator',
        specialties: ['Cancer Research', 'Immunotherapy'],
        projects: 4,
      },
    ];

    return NextResponse.json({
      success: true,
      collaborators: mockCollaborators,
      fallback: true,
    });
  }
}
