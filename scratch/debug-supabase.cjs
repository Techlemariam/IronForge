const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debug() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key present: ${!!serviceKey}`);

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing URL or Key');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log('Calling auth.admin.listUsers()...');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('Error returned by Supabase:');
      console.log(JSON.stringify(error, null, 2));
    } else {
      console.log(`Success! Found ${data.users.length} users.`);
    }
  } catch (err) {
    console.error('Caught error:');
    console.error(err);
  }
}

debug();
