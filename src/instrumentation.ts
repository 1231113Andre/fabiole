/**
 * This file runs on server startup in Next.js
 * It's executed once when the server starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run in Node.js runtime (not Edge)
    const { testConnection } = await import('./lib/googleSheets/connection');
    
    testConnection().then((result: any) => {
      if (result.success) {
        console.log('\n✅ ============================================');
        console.log('✅ GOOGLE SHEETS CONNECTION: SUCCESS');
        console.log('✅ ============================================');
        if (result.details) {
          console.log(`📊 Spreadsheet: ${result.details.spreadsheetTitle || 'N/A'}`);
          console.log(`📋 Sheet ID: ${result.details.sheetId}`);
          console.log(`📝 Sheet Name: ${result.details.sheetName}`);
          console.log(`👤 Users in infoData: ${result.details.userCount || 0}`);
          if (result.details.serviceAccountEmail) {
            console.log(`🔑 Service Account: ${result.details.serviceAccountEmail}`);
          }
          if (result.details.headers && result.details.headers.length > 0) {
            console.log(`📑 Headers: ${result.details.headers.join(' | ')}`);
          }
        }
        console.log('✅ ============================================\n');
      } else {
        console.error('\n❌ ============================================');
        console.error('❌ GOOGLE SHEETS CONNECTION: FAILED');
        console.error('❌ ============================================');
        console.error(`❌ Error: ${result.error || result.message}`);
        console.error('❌ ============================================\n');
      }
    }).catch((error: any) => {
      console.error('\n❌ ============================================');
      console.error('❌ GOOGLE SHEETS CONNECTION: ERROR');
      console.error('❌ ============================================');
      console.error(`❌ Error: ${error.message || String(error)}`);
      console.error('❌ ============================================\n');
    });
  }
}

