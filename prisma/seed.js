const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error('No user found. Create an account first.');
  }

  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'Initial project setup',
      owner: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  console.log('Project created:', project);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
