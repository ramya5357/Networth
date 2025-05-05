import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { Customer, Loan, Repayment } from '../types';

interface ExportOptions {
  includeShopInfo?: boolean;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
}

export const exportCustomerStatement = (
  customer: Customer,
  loans: Loan[],
  repayments: Repayment[],
  options: ExportOptions = {}
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = dayjs().format('MMMM D, YYYY');

  // Default options
  const defaultOptions: ExportOptions = {
    includeShopInfo: true,
    shopName: 'CrediKhaata Shop',
    shopAddress: '123 Main Street, City, Country',
    shopPhone: '+91 1234567890',
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Header
  doc.setFontSize(20);
  doc.setTextColor(15, 82, 186); // #0F52BA - primary color
  doc.text('Credit Statement', pageWidth / 2, 20, { align: 'center' });

  // Shop information
  if (finalOptions.includeShopInfo) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(finalOptions.shopName || '', pageWidth / 2, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.text(finalOptions.shopAddress || '', pageWidth / 2, 35, { align: 'center' });
    doc.text(finalOptions.shopPhone || '', pageWidth / 2, 40, { align: 'center' });
  }

  // Customer information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Statement Date: ' + today, 15, 50);
  doc.text('Customer: ' + customer.name, 15, 57);
  doc.text('Phone: ' + customer.phone, 15, 64);
  doc.text('Address: ' + customer.address, 15, 71);
  doc.text('Total Outstanding: ₹' + customer.totalOutstanding.toFixed(2), 15, 78);

  // Summary box
  autoTable(doc, {
    startY: 85,
    head: [['Summary']],
    body: [
      ['Total Credit Amount', '₹' + loans.reduce((sum, loan) => sum + loan.amount, 0).toFixed(2)],
      ['Total Paid Amount', '₹' + repayments.reduce((sum, repayment) => sum + repayment.amount, 0).toFixed(2)],
      ['Outstanding Balance', '₹' + customer.totalOutstanding.toFixed(2)],
      ['Status', customer.status === 'overdue' ? 'OVERDUE' : 'Up to date'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 82, 186],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 10 },
  });

  // Loans table
  const loanTableData = loans.map(loan => [
    loan.description,
    dayjs(loan.createdAt).format('MMM D, YYYY'),
    dayjs(loan.dueDate).format('MMM D, YYYY'),
    '₹' + loan.amount.toFixed(2),
    '₹' + loan.remainingAmount.toFixed(2),
    loan.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [['Description', 'Date', 'Due Date', 'Amount', 'Remaining', 'Status']],
    body: loanTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 82, 186],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    willDrawCell: (data) => {
      // Highlight overdue loans
      const rowData = data.row.raw as string[];
      if (rowData[5] === 'OVERDUE') {
        data.cell.styles.textColor = [220, 20, 60]; // Crimson red
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Repayments table
  if (repayments.length > 0) {
    const repaymentTableData = repayments.map(repayment => {
      const relatedLoan = loans.find(loan => loan.id === repayment.loanId);
      return [
        relatedLoan ? relatedLoan.description : 'Unknown',
        dayjs(repayment.date).format('MMM D, YYYY'),
        '₹' + repayment.amount.toFixed(2),
        repayment.notes || '-',
      ];
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Against Loan', 'Date', 'Amount', 'Notes']],
      body: repaymentTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 82, 186],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });
  }

  // Footer
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(10);
  doc.text('This is a computer-generated statement and requires no signature.', pageWidth / 2, finalY, { align: 'center' });
  doc.text('CrediKhaata - ' + today, pageWidth / 2, finalY + 5, { align: 'center' });

  // Download the PDF
  doc.save(`Credit_Statement_${customer.name.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.pdf`);
};