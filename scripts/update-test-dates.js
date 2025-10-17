const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * Update class dates for testing the cron job
 */

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateClassDates() {
    console.log('🔄 Updating class dates for testing...\n');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const twoDays = new Date();
    twoDays.setDate(twoDays.getDate() + 2);
    const twoDaysDate = twoDays.toISOString().split('T')[0];

    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    const threeDaysDate = threeDays.toISOString().split('T')[0];

    const oneWeek = new Date();
    oneWeek.setDate(oneWeek.getDate() + 7);
    const oneWeekDate = oneWeek.toISOString().split('T')[0];

    const updates = [
        {
            title: 'Kids Cooking Basics',
            date: tomorrowDate,
            time: '10:00:00',
            reason: '🔥 TOMORROW - Will trigger cron job!'
        },
        {
            title: 'Family Cooking Workshop',
            date: twoDaysDate,
            time: '14:00:00',
            reason: '📅 In 2 days'
        },
        {
            title: 'Birthday Party Cooking',
            date: threeDaysDate,
            time: '11:00:00',
            reason: '📅 In 3 days'
        },
        {
            title: 'Healthy Cooking for Kids',
            date: oneWeekDate,
            time: '15:00:00',
            reason: '📅 In 1 week'
        }
    ];

    for (const update of updates) {
        console.log(`📚 Updating "${update.title}"...`);
        console.log(`   Date: ${update.date} at ${update.time}`);
        console.log(`   ${update.reason}\n`);

        const { data, error } = await supabase
            .from('clases')
            .update({ 
                date: update.date, 
                time: update.time 
            })
            .eq('title', update.title)
            .select();

        if (error) {
            console.error(`❌ Error updating ${update.title}:`, error);
        } else if (data && data.length > 0) {
            console.log(`✅ Updated successfully\n`);
        } else {
            console.log(`⚠️ Class not found\n`);
        }
    }

    console.log('═'.repeat(80));
    console.log('📊 VIEWING ALL CLASSES WITH UPDATED DATES');
    console.log('═'.repeat(80) + '\n');

    // Fetch and display all classes
    const { data: classes, error: fetchError } = await supabase
        .from('clases')
        .select('*')
        .order('date', { ascending: true });

    if (fetchError) {
        console.error('Error fetching classes:', fetchError);
        return;
    }

    classes.forEach(clase => {
        const enrolled = clase.enrolled || 0;
        const minStudents = clase.minStudents || 0;
        const maxStudents = clase.maxStudents || 0;
        const hasMinimum = enrolled >= minStudents;
        const isFull = enrolled >= maxStudents;

        console.log(`📚 ${clase.title}`);
        console.log(`   Date: ${clase.date} at ${clase.time}`);
        console.log(`   Enrollment: ${enrolled}/${maxStudents} (min: ${minStudents})`);
        
        if (isFull) {
            console.log(`   Status: ✅ FULL`);
        } else if (hasMinimum) {
            console.log(`   Status: ✅ HAS MINIMUM - Will proceed`);
        } else {
            console.log(`   Status: ❌ BELOW MINIMUM - Will be cancelled`);
        }
        console.log('');
    });

    console.log('═'.repeat(80));
    console.log('🎯 TEST EXPECTATIONS');
    console.log('═'.repeat(80) + '\n');

    const tomorrowClasses = classes.filter(c => c.date === tomorrowDate);
    
    if (tomorrowClasses.length > 0) {
        console.log('Classes scheduled for TOMORROW (will trigger cron):\n');
        
        tomorrowClasses.forEach(clase => {
            const enrolled = clase.enrolled || 0;
            const minStudents = clase.minStudents || 0;
            const hasMinimum = enrolled >= minStudents;

            console.log(`📚 ${clase.title}`);
            console.log(`   Enrolled: ${enrolled}/${clase.maxStudents} (min: ${minStudents})`);
            
            if (hasMinimum) {
                console.log(`   ✅ Cron will: Send CONFIRMATION emails + CHARGE payments`);
            } else {
                console.log(`   ❌ Cron will: Send CANCELLATION emails + RELEASE payment holds`);
            }
            console.log('');
        });
    } else {
        console.log('⚠️ No classes found for tomorrow. Cron job will not find any classes to process.');
    }

    console.log('═'.repeat(80));
    console.log('🚀 TO TEST THE CRON JOB');
    console.log('═'.repeat(80));
    console.log('Run: npm run cron:payment-capture');
    console.log('\nThe cron job will check for classes 24 hours away and:');
    console.log('1. Send confirmation/cancellation emails to students');
    console.log('2. Capture or cancel payment authorizations\n');
}

updateClassDates().then(() => {
    console.log('✅ Done!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});

