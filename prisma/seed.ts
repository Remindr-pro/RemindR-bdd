import { PrismaClient, UserType } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const insuranceCompany = await prisma.insuranceCompany.create({
    data: {
      name: 'Health Insurance Co.',
      contactEmail: 'contact@healthinsurance.com',
      phoneNumber: '+1234567890',
      address: '123 Health St, City, Country',
    },
  });

  const family = await prisma.family.create({
    data: {
      insuranceCompanyId: insuranceCompany.id,
      familyName: 'Doe Family',
      primaryContactEmail: 'doe@example.com',
      subscriptionStatus: 'active',
    },
  });

  const adminPassword = await hashPassword('admin123');
  await prisma.user.upsert({
    where: { email: 'admin@remind-r.com' },
    update: {
      userType: UserType.ADMIN,
      role: 'admin',
    },
    create: {
      email: 'admin@remind-r.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      role: 'admin',
      userType: UserType.ADMIN,
      familyId: family.id,
    },
  });

  const userPassword = await hashPassword('user123');
  const user = await prisma.user.upsert({
    where: { email: 'user@remind-r.com' },
    update: {
      userType: UserType.INDIVIDUAL,
    },
    create: {
      email: 'user@remind-r.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567891',
      dateOfBirth: new Date('1995-05-15'),
      genderBirth: 'male',
      genderActual: 'male',
      role: 'family_member',
      userType: UserType.INDIVIDUAL,
      familyId: family.id,
    },
  });

  await prisma.healthProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      bloodType: 'O+',
      height: 175.5,
      weight: 70.0,
      allergies: ['Peanuts', 'Dust'],
      chronicConditions: [],
      medications: ['Vitamin D'],
      preferences: {
        language: 'en',
        units: 'metric',
      },
    },
  });

  const medicationType = await prisma.reminderType.create({
    data: {
      name: 'Medication',
      category: 'health',
      description: 'Reminder to take medication',
    },
  });

  await prisma.reminderType.create({
    data: {
      name: 'Appointment',
      category: 'health',
      description: 'Medical appointment reminder',
    },
  });

  await prisma.reminder.create({
    data: {
      userId: user.id,
      typeId: medicationType.id,
      title: 'Take Vitamin D',
      description: 'Take your daily vitamin D supplement',
      scheduledTime: new Date('1970-01-01T09:00:00'),
      recurrence: {
        frequency: 'daily',
      },
      isActive: true,
      startDate: new Date(),
    },
  });

  const healthCategory = await prisma.articleCategory.create({
    data: {
      name: 'General Health',
      description: 'Articles about general health and wellness',
      targetAgeMin: 0,
      targetAgeMax: 100,
      tags: ['health', 'wellness'],
    },
  });
  
  await prisma.article.create({
    data: {
      categoryId: healthCategory.id,
      title: '10 Tips for Better Sleep',
      content: 'Getting enough quality sleep is essential for your health...',
      excerpt: 'Discover 10 simple tips to improve your sleep quality.',
      readingTimeMinutes: 5,
      author: 'Dr. Jane Smith',
      isPublished: true,
      publishedAt: new Date(),
      targetAudience: {
        ageRange: [18, 65],
        interests: ['health', 'wellness'],
      },
      seoKeywords: ['sleep', 'health', 'wellness'],
    },
  });

  await prisma.partner.create({
    data: {
      name: 'Health Clinic',
      description: 'A trusted health clinic partner',
      category: 'healthcare',
      websiteUrl: 'https://healthclinic.example.com',
      isActive: true,
      isExtern: true,
    },
  });

  await prisma.questionnary.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      step: 5,
      nbPersonsFollowed: 1,
      hasGeneralPractitioner: true,
      generalPractitionerName: 'Dr. Smith',
      physicalActivityFrequency: '3-4 times per week',
      dietType: 'balanced',
      usesAlternativeMedicine: false,
      enabledReminderTypes: ['medication', 'appointment'],
      reminderFrequency: 'daily',
      enabledNotificationChannels: ['push', 'email'],
    },
  });

  console.log('✅ Seeding completed!');
  console.log(`📧 Admin: admin@remind-r.com / admin123`);
  console.log(`📧 User: user@remind-r.com / user123`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

