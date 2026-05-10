// prisma/seed.ts
// Production-quality seed data for NexusHQ Team Task Manager

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AVATAR_COLORS = [
  'linear-gradient(135deg,#4f7bef,#a855f7)',
  'linear-gradient(135deg,#14b8a6,#22c55e)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#a855f7,#ec4899)',
  'linear-gradient(135deg,#06b6d4,#4f7bef)',
  'linear-gradient(135deg,#22c55e,#14b8a6)',
  'linear-gradient(135deg,#f97316,#f59e0b)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
];

async function main() {
  console.log('🌱 Seeding NexusHQ database...');

  // ---- Clear existing data ----
  await prisma.auditLog.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();

  console.log('  ✓ Cleared existing data');

  // ---- Tags ----
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'frontend', color: '#4f7bef' } }),
    prisma.tag.create({ data: { name: 'backend', color: '#22c55e' } }),
    prisma.tag.create({ data: { name: 'design', color: '#a855f7' } }),
    prisma.tag.create({ data: { name: 'security', color: '#ef4444' } }),
    prisma.tag.create({ data: { name: 'mobile', color: '#f59e0b' } }),
    prisma.tag.create({ data: { name: 'analytics', color: '#14b8a6' } }),
    prisma.tag.create({ data: { name: 'docs', color: '#8892a4' } }),
    prisma.tag.create({ data: { name: 'performance', color: '#06b6d4' } }),
    prisma.tag.create({ data: { name: 'api', color: '#ec4899' } }),
    prisma.tag.create({ data: { name: 'devops', color: '#f97316' } }),
  ]);

  const tagMap = Object.fromEntries(tags.map((t) => [t.name, t]));
  console.log('  ✓ Created tags');

  // ---- Users ----
  const passwordHash = await bcrypt.hash('Password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alex.liu@nexushq.com',
        name: 'Alex Liu',
        passwordHash,
        role: 'ADMIN',
        avatarColor: AVATAR_COLORS[0],
        title: 'CTO',
        department: 'Engineering',
        isActive: true,
        lastActiveAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.chen@nexushq.com',
        name: 'Sarah Chen',
        passwordHash,
        role: 'PROJECT_MANAGER',
        avatarColor: AVATAR_COLORS[1],
        title: 'Head of Design',
        department: 'Design',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 10 * 60000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'marcus.webb@nexushq.com',
        name: 'Marcus Webb',
        passwordHash,
        role: 'MEMBER',
        avatarColor: AVATAR_COLORS[2],
        title: 'Senior Backend Engineer',
        department: 'Engineering',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 30 * 60000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'priya.nair@nexushq.com',
        name: 'Priya Nair',
        passwordHash,
        role: 'MEMBER',
        avatarColor: AVATAR_COLORS[3],
        title: 'Product Designer',
        department: 'Product',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 2 * 3600000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'jordan.blake@nexushq.com',
        name: 'Jordan Blake',
        passwordHash,
        role: 'MEMBER',
        avatarColor: AVATAR_COLORS[4],
        title: 'Full-Stack Engineer',
        department: 'Engineering',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 5 * 60000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'ava.torres@nexushq.com',
        name: 'Ava Torres',
        passwordHash,
        role: 'PROJECT_MANAGER',
        avatarColor: AVATAR_COLORS[5],
        title: 'Marketing Lead',
        department: 'Marketing',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 3600000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'liam.park@nexushq.com',
        name: 'Liam Park',
        passwordHash,
        role: 'MEMBER',
        avatarColor: AVATAR_COLORS[6],
        title: 'UI Engineer',
        department: 'Design',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 45 * 60000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'nina.ross@nexushq.com',
        name: 'Nina Ross',
        passwordHash,
        role: 'MEMBER',
        avatarColor: AVATAR_COLORS[7],
        title: 'Product Analyst',
        department: 'Product',
        isActive: true,
        lastActiveAt: new Date(Date.now() - 4 * 3600000),
      },
    }),
  ]);

  const [alex, sarah, marcus, priya, jordan, ava, liam, nina] = users;
  console.log(`  ✓ Created ${users.length} users`);

  // ---- Teams ----
  const [engTeam, designTeam, productTeam] = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Engineering',
        description: 'Backend, frontend, and infrastructure',
        color: '#4f7bef',
        members: {
          create: [
            { userId: alex.id },
            { userId: marcus.id },
            { userId: jordan.id },
          ],
        },
      },
    }),
    prisma.team.create({
      data: {
        name: 'Design & Product',
        description: 'UX, UI, and product strategy',
        color: '#a855f7',
        members: {
          create: [
            { userId: sarah.id },
            { userId: priya.id },
            { userId: liam.id },
          ],
        },
      },
    }),
    prisma.team.create({
      data: {
        name: 'Growth',
        description: 'Marketing, analytics, and growth',
        color: '#22c55e',
        members: {
          create: [
            { userId: ava.id },
            { userId: nina.id },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ Created teams');

  // ---- Projects ----
  const now = new Date();
  const d = (days: number) => new Date(now.getTime() + days * 86400000);

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Nexus Platform v2',
        description: 'Full platform rebuild with new architecture, improved performance, and redesigned UX.',
        status: 'ACTIVE',
        priority: 'HIGH',
        healthScore: 82,
        startDate: d(-60),
        deadline: d(36),
        ownerId: alex.id,
        managerId: sarah.id,
        teamId: engTeam.id,
        milestones: {
          create: [
            { title: 'Architecture approved', dueDate: d(-30), isCompleted: true },
            { title: 'Backend APIs complete', dueDate: d(10) },
            { title: 'Frontend integration', dueDate: d(25) },
            { title: 'Production launch', dueDate: d(36) },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App Redesign',
        description: 'Complete UX overhaul of iOS and Android apps with new design system.',
        status: 'ACTIVE',
        priority: 'HIGH',
        healthScore: 61,
        startDate: d(-30),
        deadline: d(18),
        ownerId: sarah.id,
        managerId: sarah.id,
        teamId: designTeam.id,
        milestones: {
          create: [
            { title: 'Design system complete', dueDate: d(-10), isCompleted: true },
            { title: 'iOS screens', dueDate: d(7) },
            { title: 'Android screens', dueDate: d(14) },
            { title: 'Beta release', dueDate: d(18) },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'API Gateway Refactor',
        description: 'Consolidate all microservice APIs under a unified gateway with rate limiting.',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        healthScore: 90,
        startDate: d(-45),
        deadline: d(10),
        ownerId: alex.id,
        managerId: alex.id,
        teamId: engTeam.id,
        milestones: {
          create: [
            { title: 'Gateway design', dueDate: d(-20), isCompleted: true },
            { title: 'Rate limiting live', dueDate: d(-5), isCompleted: true },
            { title: 'Load testing', dueDate: d(5) },
            { title: 'Production cutover', dueDate: d(10) },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Analytics Suite',
        description: 'Real-time analytics dashboard for customers with cohort and retention views.',
        status: 'PLANNING',
        priority: 'MEDIUM',
        healthScore: 40,
        startDate: d(0),
        deadline: d(52),
        ownerId: alex.id,
        managerId: ava.id,
        teamId: productTeam.id,
        milestones: {
          create: [
            { title: 'Requirements finalized', dueDate: d(7) },
            { title: 'MVP design', dueDate: d(21) },
            { title: 'Alpha release', dueDate: d(40) },
            { title: 'GA launch', dueDate: d(52) },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Customer Portal',
        description: 'Self-service customer management portal with SSO and billing integration.',
        status: 'ACTIVE',
        priority: 'LOW',
        healthScore: 74,
        startDate: d(-20),
        deadline: d(51),
        ownerId: ava.id,
        managerId: ava.id,
        teamId: productTeam.id,
        milestones: {
          create: [
            { title: 'Auth system', dueDate: d(7) },
            { title: 'Billing integration', dueDate: d(30) },
            { title: 'Beta', dueDate: d(45) },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Security Audit 2026',
        description: 'Comprehensive security review, penetration testing, and vulnerability remediation.',
        status: 'ACTIVE',
        priority: 'CRITICAL',
        healthScore: 55,
        startDate: d(-14),
        deadline: d(5),
        ownerId: alex.id,
        managerId: alex.id,
        teamId: engTeam.id,
        milestones: {
          create: [
            { title: 'Scope definition', dueDate: d(-10), isCompleted: true },
            { title: 'External pentest', dueDate: d(2) },
            { title: 'Remediation', dueDate: d(5) },
          ],
        },
      },
    }),
  ]);

  const [nexusV2, mobileApp, apiGateway, analytics, customerPortal, securityAudit] = projects;
  console.log(`  ✓ Created ${projects.length} projects`);

  // ---- Tasks ----
  const taskData = [
    // Nexus v2
    { title: 'Design system documentation', desc: 'Create comprehensive design token documentation for Figma and code.', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, projectId: nexusV2.id, assigneeId: sarah.id, creatorId: alex.id, dueDate: d(8), tags: ['design', 'docs'] },
    { title: 'Implement JWT refresh token flow', desc: 'Sliding session tokens with Redis backing and rotation.', status: 'REVIEW' as const, priority: 'HIGH' as const, projectId: nexusV2.id, assigneeId: marcus.id, creatorId: alex.id, dueDate: d(2), tags: ['backend', 'security'] },
    { title: 'Performance budget CI gates', desc: 'Set Core Web Vitals budgets and enforce in CI pipeline.', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, projectId: nexusV2.id, assigneeId: jordan.id, creatorId: sarah.id, dueDate: d(10), tags: ['frontend', 'performance'] },
    { title: 'PostgreSQL query optimization', desc: 'Add composite indexes to hot query paths, analyze slow queries.', status: 'COMPLETED' as const, priority: 'HIGH' as const, projectId: nexusV2.id, assigneeId: marcus.id, creatorId: alex.id, dueDate: d(-5), tags: ['backend'] },
    { title: 'E2E test suite setup', desc: 'Configure Playwright for critical user flows.', status: 'TODO' as const, priority: 'MEDIUM' as const, projectId: nexusV2.id, assigneeId: jordan.id, creatorId: sarah.id, dueDate: d(20), tags: ['frontend'] },
    // Mobile App
    { title: 'Onboarding flow screens (iOS)', desc: 'Design 5-step onboarding with animated illustrations.', status: 'TODO' as const, priority: 'HIGH' as const, projectId: mobileApp.id, assigneeId: priya.id, creatorId: sarah.id, dueDate: d(6), tags: ['mobile', 'design'] },
    { title: 'iOS push notification setup', desc: 'Configure APNs for delivery, rich notifications, and actions.', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, projectId: mobileApp.id, assigneeId: jordan.id, creatorId: sarah.id, dueDate: d(4), tags: ['mobile', 'backend'] },
    { title: 'Figma component library sync', desc: 'Sync design tokens from Figma to code components via Style Dictionary.', status: 'REVIEW' as const, priority: 'MEDIUM' as const, projectId: mobileApp.id, assigneeId: liam.id, creatorId: sarah.id, dueDate: d(6), tags: ['design'] },
    { title: 'Android navigation refactor', desc: 'Migrate from fragment transactions to Jetpack Compose navigation.', status: 'TODO' as const, priority: 'MEDIUM' as const, projectId: mobileApp.id, assigneeId: liam.id, creatorId: sarah.id, dueDate: d(12), tags: ['mobile'] },
    // API Gateway
    { title: 'API rate limiting middleware', desc: 'Per-route rate limiting with Redis sliding windows.', status: 'COMPLETED' as const, priority: 'HIGH' as const, projectId: apiGateway.id, assigneeId: jordan.id, creatorId: alex.id, dueDate: d(-6), tags: ['backend', 'api'] },
    { title: 'Database indexing optimization', desc: 'Add composite indexes to hot query paths.', status: 'COMPLETED' as const, priority: 'HIGH' as const, projectId: apiGateway.id, assigneeId: marcus.id, creatorId: alex.id, dueDate: d(-8), tags: ['backend'] },
    { title: 'Load testing & benchmarks', desc: 'k6 load test at 10k req/s with baseline comparison.', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, projectId: apiGateway.id, assigneeId: marcus.id, creatorId: alex.id, dueDate: d(3), tags: ['backend', 'performance'] },
    // Analytics
    { title: 'User analytics dashboard MVP', desc: 'Build cohort and retention analytics views with Recharts.', status: 'TODO' as const, priority: 'MEDIUM' as const, projectId: analytics.id, assigneeId: liam.id, creatorId: ava.id, dueDate: d(30), tags: ['frontend', 'analytics'] },
    { title: 'Marketing analytics integration', desc: 'Connect GA4 and HubSpot data pipelines to internal warehouse.', status: 'TODO' as const, priority: 'LOW' as const, projectId: analytics.id, assigneeId: ava.id, creatorId: ava.id, dueDate: d(45), tags: ['analytics'] },
    // Customer Portal
    { title: 'Customer portal SSO auth', desc: 'SAML and OIDC integration with Google, Microsoft, and Okta.', status: 'TODO' as const, priority: 'HIGH' as const, projectId: customerPortal.id, assigneeId: nina.id, creatorId: ava.id, dueDate: d(10), tags: ['backend', 'security'] },
    { title: 'Billing dashboard UI', desc: 'Stripe subscription management with invoices and usage charts.', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, projectId: customerPortal.id, assigneeId: liam.id, creatorId: ava.id, dueDate: d(25), tags: ['frontend'] },
    // Security Audit
    { title: 'Penetration testing report', desc: 'External vendor pentest coordination and internal review.', status: 'IN_PROGRESS' as const, priority: 'CRITICAL' as const, projectId: securityAudit.id, assigneeId: marcus.id, creatorId: alex.id, dueDate: d(2), tags: ['security'] },
    { title: 'OWASP vulnerability scan', desc: 'Automated OWASP ZAP scan of all public-facing endpoints.', status: 'COMPLETED' as const, priority: 'HIGH' as const, projectId: securityAudit.id, assigneeId: jordan.id, creatorId: alex.id, dueDate: d(-3), tags: ['security'] },
    { title: 'Secrets rotation plan', desc: 'Audit all environment secrets and implement auto-rotation.', status: 'TODO' as const, priority: 'HIGH' as const, projectId: securityAudit.id, assigneeId: alex.id, creatorId: alex.id, dueDate: d(5), tags: ['security', 'devops'] },
  ];

  for (const t of taskData) {
    const { tags: taskTags, ...rest } = t;
    const task = await prisma.task.create({
      data: {
        ...rest,
        completedAt: rest.status === 'COMPLETED' ? new Date(Date.now() - Math.random() * 7 * 86400000) : undefined,
        tags: {
          create: taskTags.map((name) => ({ tagId: tagMap[name]?.id ?? '' })).filter((t) => t.tagId),
        },
      },
    });

    // Add comments to some tasks
    if (Math.random() > 0.4) {
      const commentAuthors = [alex, sarah, marcus, jordan].filter(u => u.id !== rest.assigneeId);
      const author = commentAuthors[Math.floor(Math.random() * commentAuthors.length)];
      await prisma.comment.createMany({
        data: [
          {
            content: 'This looks good! Let me know if you need any help with the implementation.',
            taskId: task.id,
            authorId: author.id,
          },
        ],
      });
    }
  }

  console.log(`  ✓ Created ${taskData.length} tasks with comments`);

  // ---- Activity Logs ----
  const activityEntries = [
    { type: 'TASK_COMPLETED' as const, action: 'Completed "API rate limiting middleware"', userId: jordan.id, projectId: apiGateway.id },
    { type: 'TASK_CREATED' as const, action: 'Created "Design system documentation"', userId: sarah.id, projectId: nexusV2.id },
    { type: 'PROJECT_CREATED' as const, action: 'Created project "Security Audit 2026"', userId: alex.id, projectId: securityAudit.id },
    { type: 'TASK_ASSIGNED' as const, action: 'Assigned "iOS push notification setup" to Jordan Blake', userId: sarah.id, projectId: mobileApp.id },
    { type: 'STATUS_CHANGED' as const, action: 'Moved "JWT refresh token flow" to Review', userId: marcus.id, projectId: nexusV2.id },
    { type: 'MEMBER_JOINED' as const, action: 'Nina Ross joined the workspace', userId: nina.id },
    { type: 'TASK_UPDATED' as const, action: 'Updated deadline for "Mobile App Redesign"', userId: ava.id, projectId: mobileApp.id },
    { type: 'TASK_COMPLETED' as const, action: 'Completed "Database indexing optimization"', userId: marcus.id, projectId: apiGateway.id },
  ];

  for (let i = 0; i < activityEntries.length; i++) {
    await prisma.activityLog.create({
      data: {
        ...activityEntries[i],
        createdAt: new Date(Date.now() - i * 15 * 60000),
      },
    });
  }

  console.log('  ✓ Created activity logs');

  // ---- Notifications for alex ----
  await prisma.notification.createMany({
    data: [
      { type: 'TASK_COMPLETED', title: 'Task completed', message: 'Jordan Blake completed "API rate limiting middleware"', userId: alex.id, isRead: false, createdAt: new Date(Date.now() - 2 * 60000) },
      { type: 'TASK_ASSIGNED', title: 'Task assigned', message: 'You were assigned to "Secrets rotation plan"', userId: alex.id, isRead: false, createdAt: new Date(Date.now() - 15 * 60000) },
      { type: 'DEADLINE_WARNING', title: 'Deadline approaching', message: '"Mobile App Redesign" deadline is in 18 days', userId: alex.id, isRead: false, createdAt: new Date(Date.now() - 3600000) },
      { type: 'COMMENT_ADDED', title: 'New comment', message: 'Marcus Webb commented on "Penetration testing report"', userId: alex.id, isRead: true, createdAt: new Date(Date.now() - 2 * 3600000) },
      { type: 'PROJECT_UPDATE', title: 'Project flagged', message: '"Security Audit 2026" flagged as high risk', userId: alex.id, isRead: true, createdAt: new Date(Date.now() - 3 * 3600000) },
    ],
  });

  console.log('  ✓ Created notifications');
  console.log('\n✅ Seed complete!\n');
  console.log('Sample accounts:');
  console.log('  Admin:   alex.liu@nexushq.com / Password123');
  console.log('  Manager: sarah.chen@nexushq.com / Password123');
  console.log('  Member:  marcus.webb@nexushq.com / Password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
