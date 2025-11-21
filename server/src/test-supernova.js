const { prisma } = require('./config/database');

async function test() {
  console.log('Testing SUPERNova models...\n');

  // Test coaching programs
  console.log('📚 Fetching coaching programs with full structure...');
  const programs = await prisma.coachingProgram.findMany({
    include: {
      modules: {
        include: {
          lessons: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: {
      order: 'asc'
    }
  });

  console.log(`\n✅ Found ${programs.length} coaching programs:\n`);

  programs.forEach(program => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Program: ${program.name} (${program.code})`);
    console.log(`Tier: ${program.tier}`);
    console.log(`Description: ${program.description}`);
    console.log(`Modules: ${program.modules.length}`);

    program.modules.forEach(module => {
      console.log(`  └─ Module ${module.order}: ${module.title}`);
      console.log(`     Lessons: ${module.lessons.length}`);

      module.lessons.forEach(lesson => {
        console.log(`       └─ Lesson ${lesson.order}: ${lesson.title} (${lesson.duration} min)`);
      });
    });
    console.log('');
  });

  // Test model counts
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Database Statistics:\n');

  const stats = {
    subscriptionTiers: await prisma.subscriptionTier.count(),
    coachingPrograms: await prisma.coachingProgram.count(),
    programModules: await prisma.programModule.count(),
    programLessons: await prisma.programLesson.count(),
  };

  Object.entries(stats).forEach(([key, count]) => {
    console.log(`  ${key}: ${count}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SUPERNova models working perfectly!\n');

  await prisma.$disconnect();
}

test().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
