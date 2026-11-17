import PDFDocument from 'pdfkit';

/**
 * Generate a luxury, vector-grade tax invoice PDF for Moon Light Villa ERP
 * 
 * @param {Object} invoice - Invoice database document with items, totals, gstDetails, customerDetails
 * @param {Object} reservation - Associated reservation document with villa, propertyLocation, stay dates
 * @param {Array} payments - Associated payment settlement records
 * @returns {Promise<Buffer>} - Resolves with the binary PDF buffer
 */
export const generateInvoicePdf = (invoice, reservation, payments = []) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Helper for clean currency formatting (using standard 'Rs.' for universally compatible rendering)
      const formatCurrency = (val) => {
        const num = Number(val || 0);
        return 'Rs. ' + num.toLocaleString('en-IN');
      };

      const formatDate = (d) => {
        if (!d) return 'N/A';
        try {
          return new Date(d).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        } catch {
          return 'N/A';
        }
      };

      // Property & Location Information from database
      const propertyLocation = reservation?.propertyLocation || reservation?.villa?.propertyLocation;
      const villa = reservation?.villa;
      const propertyName = propertyLocation?.name || villa?.name || 'Moon Light Villa & Luxury Sanctuary';
      const propertyAddress = propertyLocation?.address || villa?.location?.address || 'Moon Light Valley, Whispering Pines Hill, Old Khandala Road';
      const propertyCityState = `${propertyLocation?.city || villa?.location?.city || 'Lonavala'}, ${propertyLocation?.state || villa?.location?.state || 'Maharashtra'} - ${propertyLocation?.pincode || villa?.location?.pincode || '410401'}`;
      const propertyPhone = propertyLocation?.phone || '+91 98200 12345';
      const propertyEmail = propertyLocation?.email || 'reservations@moonlightvilla.com';

      // 1. Header Banner & Branding
      // Gold accent bar at top
      doc.rect(40, 40, 515, 4).fill('#d97706');

      // Brand Title
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('MOON LIGHT VILLA', 40, 52);

      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#d97706')
        .text('LUXURY PRIVATE ESTATES & RESORTS', 40, 74);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(propertyName, 40, 86, { width: 260 })
        .text(propertyAddress, 40, 97, { width: 260 })
        .text(propertyCityState, 40, 108, { width: 260 })
        .text(`Phone: ${propertyPhone} | Email: ${propertyEmail}`, 40, 119, { width: 260 })
        .text('GSTIN: 27AABCM9999P1Z8 (Maharashtra)', 40, 130, { width: 260 });

      // Invoice Meta Box (Right-aligned)
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('TAX INVOICE', 320, 52, { align: 'right', width: 235 });

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#334155')
        .text(`Invoice #: ${invoice.invoiceNumber}`, 320, 75, { align: 'right', width: 235 });

      doc
        .fontSize(8.5)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`Date of Issue: ${formatDate(invoice.issueDate || invoice.createdAt)}`, 320, 90, { align: 'right', width: 235 });

      if (invoice.dueDate) {
        doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 320, 102, { align: 'right', width: 235 });
      }

      // Status Badge
      const status = (invoice.status || 'Issued').toUpperCase();
      let badgeBg = '#f1f5f9';
      let badgeTextColor = '#475569';
      if (status === 'PAID') {
        badgeBg = '#dcfce7';
        badgeTextColor = '#15803d';
      } else if (status === 'PARTIALLY PAID') {
        badgeBg = '#fef3c7';
        badgeTextColor = '#b45309';
      } else if (status === 'OVERDUE' || status === 'CANCELLED') {
        badgeBg = '#fee2e2';
        badgeTextColor = '#b91c1c';
      }

      const badgeY = invoice.dueDate ? 116 : 106;
      doc.roundedRect(465, badgeY, 90, 18, 3).fill(badgeBg);
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(badgeTextColor)
        .text(status, 465, badgeY + 4.5, { align: 'center', width: 90 });

      // Divider line
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, 148).lineTo(555, 148).stroke();

      // 2. Guest Information & Stay Details (Two Columns with Card Background)
      const boxY = 156;
      const boxHeight = 85;

      // Left Box: Billed To
      doc.roundedRect(40, boxY, 250, boxHeight, 4).fillAndStroke('#f8fafc', '#e2e8f0');
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('BILLED TO (GUEST / CUSTOMER)', 50, boxY + 8);

      const customerName = invoice.customerDetails?.fullName || invoice.customer?.fullName || 'Valued Guest';
      const customerPhone = invoice.customerDetails?.phone || invoice.customer?.phone || 'N/A';
      const customerEmail = invoice.customerDetails?.email || invoice.customer?.email || 'N/A';
      const customerAddress = invoice.customerDetails?.address || invoice.customer?.address || '';
      const customerGst = invoice.customerDetails?.gstNumber || '';

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#1e293b')
        .text(customerName, 50, boxY + 22);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#475569')
        .text(`Phone: ${customerPhone}`, 50, boxY + 35)
        .text(`Email: ${customerEmail}`, 50, boxY + 46);

      if (customerAddress) {
        doc.text(`Address: ${customerAddress.slice(0, 45)}`, 50, boxY + 57);
      }
      if (customerGst) {
        doc.text(`GSTIN: ${customerGst}`, 50, boxY + 68);
      }

      // Right Box: Property & Reservation Details
      doc.roundedRect(305, boxY, 250, boxHeight, 4).fillAndStroke('#f8fafc', '#e2e8f0');
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('PROPERTY & STAY DETAILS', 315, boxY + 8);

      const villaDisplayName = villa?.name || (reservation ? 'Moon Light Resort Accommodation' : 'Hospitality Services');
      const bookingRef = reservation?.bookingReference || 'N/A (Direct Billing)';
      const checkInStr = formatDate(reservation?.checkIn);
      const checkOutStr = formatDate(reservation?.checkOut);
      const nights = reservation?.totalNights || 1;
      const adults = reservation?.guests?.adults || 2;
      const children = reservation?.guests?.children || 0;

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#1e293b')
        .text(villaDisplayName, 315, boxY + 22, { width: 230 });

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#475569')
        .text(`Booking Ref: ${bookingRef}`, 315, boxY + 35)
        .text(`Stay Dates: ${checkInStr} to ${checkOutStr} (${nights} Night${nights > 1 ? 's' : ''})`, 315, boxY + 46)
        .text(`Guests: ${adults} Adults, ${children} Children`, 315, boxY + 57)
        .text(`Booking Type: ${reservation?.bookingType || 'Full Villa Sanctuary'}`, 315, boxY + 68);

      // 3. Line Items Table
      const tableHeaderY = boxY + boxHeight + 14;

      // Table Header Row
      doc.rect(40, tableHeaderY, 515, 20).fill('#0f172a');
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#f8fafc')
        .text('DESCRIPTION', 48, tableHeaderY + 6)
        .text('HSN/SAC', 245, tableHeaderY + 6)
        .text('QTY', 310, tableHeaderY + 6, { align: 'center', width: 30 })
        .text('RATE', 355, tableHeaderY + 6, { align: 'right', width: 75 })
        .text('TAXABLE', 435, tableHeaderY + 6, { align: 'right', width: 55 })
        .text('TOTAL', 495, tableHeaderY + 6, { align: 'right', width: 55 });

      let currentY = tableHeaderY + 20;

      const items = (invoice.items && invoice.items.length > 0)
        ? invoice.items
        : [{
            description: 'Luxury Villa Accommodation & Bespoke Hospitality Services',
            hsnCode: '996311',
            quantity: 1,
            unitPrice: invoice.subTotal || invoice.grandTotal,
            taxableAmount: invoice.subTotal || invoice.grandTotal,
            total: invoice.grandTotal
          }];

      items.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, currentY, 515, 20).fill(rowBg);

        const desc = item.description || 'Accommodation Services';
        const hsn = item.hsnCode || '996311';
        const qty = item.quantity || 1;
        const rate = formatCurrency(item.unitPrice || 0);
        const taxable = formatCurrency(item.taxableAmount || item.unitPrice * qty || 0);
        const total = formatCurrency(item.total || 0);

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#1e293b')
          .text(desc.length > 40 ? desc.slice(0, 38) + '...' : desc, 48, currentY + 5, { width: 195 })
          .text(hsn, 245, currentY + 5)
          .text(String(qty), 310, currentY + 5, { align: 'center', width: 30 })
          .text(rate, 355, currentY + 5, { align: 'right', width: 75 })
          .text(taxable, 435, currentY + 5, { align: 'right', width: 55 })
          .font('Helvetica-Bold')
          .text(total, 495, currentY + 5, { align: 'right', width: 55 });

        currentY += 20;
      });

      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, currentY).lineTo(555, currentY).stroke();

      // 4. Financial Breakdown & Totals (Right Column) & Notes (Left Column)
      const summaryTop = currentY + 8;

      // Notes on Left
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('NOTES & REMARKS:', 40, summaryTop + 4);

      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(invoice.notes || 'Thank you for choosing Moon Light Villa.', 40, summaryTop + 16, { width: 230 })
        .text(invoice.termsAndConditions || 'Check-in: 2:00 PM | Check-out: 11:00 AM. GST applicable as per statutory rates.', 40, summaryTop + 32, { width: 230 });

      // Totals Box on Right
      const rightX = 330;
      const labelW = 110;
      const valW = 110;
      let lineY = summaryTop;

      const subTotal = invoice.subTotal || 0;
      const cgst = invoice.gstDetails?.cgst ?? Math.round((invoice.gstDetails?.totalGst || 0) / 2);
      const sgst = invoice.gstDetails?.sgst ?? Math.round((invoice.gstDetails?.totalGst || 0) / 2);
      const igst = invoice.gstDetails?.igst || 0;
      const totalGst = invoice.gstDetails?.totalGst || (cgst + sgst + igst);
      const discount = invoice.discount || 0;
      const grandTotal = invoice.grandTotal || 0;
      const paidAmount = invoice.paidAmount || 0;
      const balanceDue = invoice.balanceDue ?? Math.max(0, grandTotal - paidAmount);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#475569')
        .text('Taxable Amount:', rightX, lineY)
        .text(formatCurrency(subTotal), rightX + labelW, lineY, { align: 'right', width: valW });
      lineY += 13;

      if (discount > 0) {
        doc
          .fillColor('#15803d')
          .text('Discount Applied:', rightX, lineY)
          .text('- ' + formatCurrency(discount), rightX + labelW, lineY, { align: 'right', width: valW });
        lineY += 13;
      }

      if (igst > 0) {
        doc
          .fillColor('#475569')
          .text('IGST (18%):', rightX, lineY)
          .text(formatCurrency(igst), rightX + labelW, lineY, { align: 'right', width: valW });
        lineY += 13;
      } else {
        doc
          .fillColor('#475569')
          .text('CGST (9%):', rightX, lineY)
          .text(formatCurrency(cgst), rightX + labelW, lineY, { align: 'right', width: valW });
        lineY += 13;

        doc
          .text('SGST (9%):', rightX, lineY)
          .text(formatCurrency(sgst), rightX + labelW, lineY, { align: 'right', width: valW });
        lineY += 13;
      }

      doc
        .text('Total GST (18%):', rightX, lineY)
        .text(formatCurrency(totalGst), rightX + labelW, lineY, { align: 'right', width: valW });
      lineY += 15;

      // Grand Total Box
      doc.rect(rightX - 5, lineY - 2, 230, 20).fill('#0f172a');
      doc
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('GRAND TOTAL:', rightX, lineY + 3)
        .text(formatCurrency(grandTotal), rightX + labelW, lineY + 3, { align: 'right', width: valW });
      lineY += 23;

      // Paid Amount & Balance Due
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#15803d')
        .text('Amount Paid:', rightX, lineY)
        .text(formatCurrency(paidAmount), rightX + labelW, lineY, { align: 'right', width: valW });
      lineY += 13;

      const balColor = balanceDue > 0 ? '#b91c1c' : '#15803d';
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor(balColor)
        .text('Balance Due:', rightX, lineY)
        .text(formatCurrency(balanceDue), rightX + labelW, lineY, { align: 'right', width: valW });
      lineY += 18;

      // 5. Payment Transaction Details Section
      let paymentSectionY = Math.max(lineY + 10, summaryTop + 85);
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, paymentSectionY).lineTo(555, paymentSectionY).stroke();
      paymentSectionY += 8;

      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('PAYMENT TRANSACTIONS & SETTLEMENT DETAILS', 40, paymentSectionY);
      paymentSectionY += 14;

      if (payments && payments.length > 0) {
        // Table header for payments
        doc.rect(40, paymentSectionY, 515, 16).fill('#f1f5f9');
        doc
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .fillColor('#334155')
          .text('DATE', 48, paymentSectionY + 4)
          .text('PAYMENT REF', 125, paymentSectionY + 4)
          .text('METHOD / GATEWAY', 230, paymentSectionY + 4)
          .text('TXN / ORDER ID', 345, paymentSectionY + 4)
          .text('AMOUNT', 440, paymentSectionY + 4, { align: 'right', width: 55 })
          .text('STATUS', 505, paymentSectionY + 4, { align: 'center', width: 45 });
        paymentSectionY += 16;

        payments.forEach((pay, idx) => {
          const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
          doc.rect(40, paymentSectionY, 515, 16).fill(rowBg);

          const payDate = formatDate(pay.paymentDate || pay.createdAt);
          const payRef = pay.paymentReference || 'N/A';
          const method = pay.paymentMethod || 'Online Gateway';
          const txnId = pay.transactionId || pay.gatewayPaymentId || pay.gatewayOrderId || 'VERIFIED_SETTLED';
          const amount = formatCurrency(pay.amount);
          const payStatus = pay.status || 'Completed';

          doc
            .fontSize(7.5)
            .font('Helvetica')
            .fillColor('#1e293b')
            .text(payDate, 48, paymentSectionY + 4)
            .text(payRef, 125, paymentSectionY + 4)
            .text(method, 230, paymentSectionY + 4)
            .text(txnId.length > 20 ? txnId.slice(0, 18) + '...' : txnId, 345, paymentSectionY + 4)
            .font('Helvetica-Bold')
            .text(amount, 440, paymentSectionY + 4, { align: 'right', width: 55 })
            .fillColor(payStatus === 'Completed' ? '#15803d' : '#b45309')
            .text(payStatus, 505, paymentSectionY + 4, { align: 'center', width: 45 });

          paymentSectionY += 16;
        });
      } else {
        doc.rect(40, paymentSectionY, 515, 20).fill('#f8fafc');
        doc
          .fontSize(8)
          .font('Helvetica-Oblique')
          .fillColor('#64748b')
          .text('No payment transactions recorded for this invoice yet. Payment status: ' + (invoice.status || 'Unpaid'), 48, paymentSectionY + 5);
        paymentSectionY += 22;
      }

      // 6. Footer (Fixed at bottom)
      const footerY = 765;
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, footerY).lineTo(555, footerY).stroke();
      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text('This is a computer-generated tax invoice issued by Moon Light Villa Management ERP. No physical signature is required.', 40, footerY + 6, { align: 'center', width: 515 })
        .text(`Moon Light Villa Hospitality System • Generated on ${formatDate(Date.now())} • Page 1 of 1`, 40, footerY + 16, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
