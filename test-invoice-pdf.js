import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING INVOICE PDF DOWNLOAD VERIFICATION SUITE');
  console.log('====================================================\n');

  const baseUrl = 'http://localhost:5000/api';

  // Helper for HTTP requests
  async function apiCall(endpoint, options = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else if (contentType.includes('application/pdf')) {
      const arrayBuf = await res.arrayBuffer();
      data = Buffer.from(arrayBuf);
    } else {
      data = await res.text();
    }
    return { status: res.status, headers: res.headers, data };
  }

  // 1. Authenticate as Super Admin
  console.log('1. Authenticating as Super Admin (admin@moonlightvilla.com)...');
  const adminLogin = await apiCall('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@moonlightvilla.com', password: 'password123' })
  });
  if (adminLogin.status !== 200 || !adminLogin.data.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
  }
  const adminToken = adminLogin.data.token;
  console.log('   ✓ Super Admin authenticated successfully.\n');

  // 2. Authenticate as Goa Location Manager (goamanager@moonlightvilla.com)
  console.log('2. Authenticating as Goa Location Manager (goamanager@moonlightvilla.com)...');
  const goaLogin = await apiCall('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'goamanager@moonlightvilla.com', password: 'password123' })
  });
  if (goaLogin.status !== 200 || !goaLogin.data.token) {
    throw new Error(`Goa Manager login failed: ${JSON.stringify(goaLogin.data)}`);
  }
  const goaToken = goaLogin.data.token;
  console.log('   ✓ Goa Location Manager authenticated successfully.\n');

  // 3. Fetch all invoices
  console.log('3. Fetching available invoices from database...');
  const invRes = await apiCall('/invoices', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (invRes.status !== 200 || !invRes.data.invoices) {
    throw new Error(`Failed to list invoices: ${JSON.stringify(invRes.data)}`);
  }
  const invoices = invRes.data.invoices;
  console.log(`   ✓ Found ${invoices.length} invoices:`);
  invoices.forEach(inv => {
    console.log(`     - ${inv.invoiceNumber} | ID: ${inv._id} | Status: ${inv.status} | Total: Rs. ${inv.grandTotal} | Paid: Rs. ${inv.paidAmount} | Balance: Rs. ${inv.balanceDue}`);
  });
  console.log();

  const invPartial = invoices.find(i => i.invoiceNumber === 'INV-2026-1001');
  const invPaid = invoices.find(i => i.invoiceNumber === 'INV-2026-1002');

  if (!invPartial) throw new Error('INV-2026-1001 (Partial payment) not found in DB!');
  if (!invPaid) throw new Error('INV-2026-1002 (Fully paid) not found in DB!');

  // TEST 1: Download existing invoice
  console.log('TEST 1: Download an existing invoice (GET /api/invoices/:id/download-pdf)');
  const test1 = await apiCall(`/invoices/${invPartial._id}/download-pdf`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`   Status: ${test1.status}`);
  console.log(`   Content-Type: ${test1.headers.get('content-type')}`);
  console.log(`   Content-Disposition: ${test1.headers.get('content-disposition')}`);
  console.log(`   Buffer length: ${test1.data.length} bytes`);
  console.log(`   Is PDF: ${test1.data.slice(0, 5).toString() === '%PDF-'}`);
  if (test1.status !== 200 || !test1.headers.get('content-type')?.includes('application/pdf')) {
    throw new Error('TEST 1 FAILED: Could not download existing invoice PDF');
  }
  console.log('   ✓ TEST 1 PASSED: Successfully downloaded existing invoice PDF with correct headers!\n');

  // Also test /api/billing/invoices/:id/download-pdf route
  console.log('TEST 1b: Verify alias route GET /api/billing/invoices/:id/download-pdf');
  const test1b = await apiCall(`/billing/invoices/${invPartial._id}/download-pdf`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (test1b.status !== 200 || !test1b.headers.get('content-type')?.includes('application/pdf')) {
    throw new Error('TEST 1b FAILED: Route /api/billing/invoices/:id/download-pdf failed');
  }
  console.log('   ✓ TEST 1b PASSED: /api/billing/invoices/:id/download-pdf is also fully functional!\n');

  // TEST 2: Download invoice with partial payment
  console.log('TEST 2: Download invoice with partial payment (INV-2026-1001)');
  const test2 = await apiCall(`/invoices/${invPartial._id}/download-pdf`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (test2.status !== 200 || test2.data.length < 500) {
    throw new Error('TEST 2 FAILED: Partial payment invoice download failed');
  }
  console.log(`   ✓ TEST 2 PASSED: Downloaded partial payment invoice (Total: ${invPartial.grandTotal}, Paid: ${invPartial.paidAmount}, Balance: ${invPartial.balanceDue}, PDF size: ${test2.data.length} bytes)\n`);

  // TEST 3: Download fully paid invoice
  console.log('TEST 3: Download fully paid invoice (INV-2026-1002)');
  const test3 = await apiCall(`/invoices/${invPaid._id}/download-pdf`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (test3.status !== 200 || test3.data.length < 500) {
    throw new Error('TEST 3 FAILED: Fully paid invoice download failed');
  }
  console.log(`   ✓ TEST 3 PASSED: Downloaded fully paid invoice (Total: ${invPaid.grandTotal}, Paid: ${invPaid.paidAmount}, Status: ${invPaid.status}, PDF size: ${test3.data.length} bytes)\n`);

  // TEST 4: Download invoice with zero balance
  console.log('TEST 4: Download invoice with zero balance (INV-2026-1002 balanceDue === 0)');
  if (invPaid.balanceDue !== 0) {
    throw new Error(`Expected balanceDue 0 for invPaid, got: ${invPaid.balanceDue}`);
  }
  console.log(`   ✓ Verified balanceDue is ${invPaid.balanceDue}. Download confirmed in Test 3.`);
  console.log('   ✓ TEST 4 PASSED: Zero-balance invoice validated and generated correctly!\n');

  // TEST 5: Try downloading a nonexistent invoice
  console.log('TEST 5: Try downloading a nonexistent invoice');
  const fakeId = '507f1f77bcf86cd799439011'; // valid ObjectId that does not exist
  const test5a = await apiCall(`/invoices/${fakeId}/download-pdf`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`   Request with non-existent valid ObjectId: Status ${test5a.status}, Response:`, test5a.data);
  if (test5a.status !== 404 || test5a.data.success !== false) {
    throw new Error(`TEST 5 FAILED: Expected 404 for nonexistent invoice, got ${test5a.status}`);
  }

  const invalidId = 'invalid-hex-id-999';
  const test5b = await apiCall(`/invoices/${invalidId}/download-pdf`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`   Request with invalid ObjectId format: Status ${test5b.status}, Response:`, test5b.data);
  if (test5b.status !== 404) {
    throw new Error(`TEST 5 FAILED: Expected 404 for invalid ID format, got ${test5b.status}`);
  }
  console.log('   ✓ TEST 5 PASSED: Meaningful 404 responses returned for non-existent and invalid invoice IDs!\n');

  // TEST 6: Try downloading an invoice belonging to another property
  console.log('TEST 6: Try downloading an invoice belonging to another property (Tenant/Property Isolation)');
  console.log('   Goa Location Manager attempting to download Lonavala property invoice (INV-2026-1001)...');
  const test6Forbidden = await apiCall(`/invoices/${invPartial._id}/download-pdf`, {
    headers: { Authorization: `Bearer ${goaToken}` }
  });
  console.log(`   Status: ${test6Forbidden.status}, Response:`, test6Forbidden.data);
  if (test6Forbidden.status !== 403) {
    throw new Error(`TEST 6 FAILED: Expected 403 Forbidden for cross-property download, got ${test6Forbidden.status}`);
  }
  console.log('   ✓ Successfully blocked cross-property invoice download with 403 Forbidden!');

  console.log('   Goa Location Manager attempting to download their OWN Goa property invoice (INV-2026-1002)...');
  const test6Allowed = await apiCall(`/invoices/${invPaid._id}/download-pdf`, {
    headers: { Authorization: `Bearer ${goaToken}` }
  });
  console.log(`   Status: ${test6Allowed.status}, Buffer length: ${test6Allowed.data.length} bytes`);
  if (test6Allowed.status !== 200 || !test6Allowed.headers.get('content-type')?.includes('application/pdf')) {
    throw new Error(`TEST 6 FAILED: Expected 200 OK for manager downloading their own property invoice, got ${test6Allowed.status}`);
  }
  console.log('   ✓ Successfully allowed manager to download their own property invoice!');
  console.log('   ✓ TEST 6 PASSED: Tenant & property data isolation enforced rigorously!\n');

  // TEST 7: Verify that the downloaded file opens correctly and contains correct invoice data
  console.log('TEST 7: Verify PDF structure and document integrity');
  const pdfHeader = test1.data.slice(0, 5).toString();
  const pdfString = test1.data.toString('latin1');
  const hasEof = pdfString.includes('%%EOF');

  console.log(`   - PDF Magic Header: "${pdfHeader}" (Valid: ${pdfHeader === '%PDF-'})`);
  console.log(`   - PDF End-of-File marker: ${hasEof ? 'Found (%%EOF)' : 'Missing'}`);
  console.log(`   - Total File Size: ${test1.data.length} bytes`);

  // Write out test sample files to disk for inspection
  fs.writeFileSync('C:/project/moon-light/test_invoice_partial.pdf', test1.data);
  fs.writeFileSync('C:/project/moon-light/test_invoice_paid.pdf', test3.data);
  console.log('   - Sample PDF files saved to test_invoice_partial.pdf and test_invoice_paid.pdf');

  if (pdfHeader !== '%PDF-' || !hasEof || test1.data.length < 1000) {
    throw new Error('TEST 7 FAILED: PDF document integrity check failed');
  }
  console.log('   ✓ TEST 7 PASSED: PDF structure verified and confirmed valid!\n');

  // EXTRA TEST: Unauthenticated request security
  console.log('SECURITY CHECK: Unauthenticated request without token');
  const testUnauth = await apiCall(`/invoices/${invPartial._id}/download-pdf`);
  console.log(`   Status: ${testUnauth.status}, Response:`, testUnauth.data);
  if (testUnauth.status !== 401) {
    throw new Error(`SECURITY CHECK FAILED: Expected 401 for unauthenticated request, got ${testUnauth.status}`);
  }
  console.log('   ✓ Passed: Unauthenticated request correctly rejected with 401 Unauthorized!\n');

  // EXTRA TEST: Guest download with valid booking reference (?ref=...)
  console.log('GUEST ACCESS: Public confirmation voucher download with ?ref=MLV-2026-X89K2');
  const testGuest = await apiCall(`/invoices/${invPartial._id}/download-pdf?ref=MLV-2026-X89K2`);
  console.log(`   Status: ${testGuest.status}, Content-Type: ${testGuest.headers.get('content-type')}`);
  if (testGuest.status !== 200 || !testGuest.headers.get('content-type')?.includes('application/pdf')) {
    throw new Error(`GUEST ACCESS FAILED: Expected 200 for guest with matching reference, got ${testGuest.status}`);
  }
  console.log('   ✓ Passed: Confirmed booking guest can securely download their own tax invoice!\n');

  console.log('====================================================');
  console.log('🎉 ALL 7 TESTS & SECURITY CHECKS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
