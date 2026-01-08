import { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { calculateLineItem } from '../../utils/calculations';
import { formatCurrency } from '../../utils/helpers';

/**
 * Generate HTML content for the quote document
 */
const generateQuoteHTML = (data) => {
  const { projectInfo, quotePackages, equipmentGroups, lineItems } = data;

  // Sort packages by sortOrder
  const sortedPackages = [...quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Parse bullets text into array (handles both • and - as bullet markers, or plain lines)
  const parseBullets = (bulletsText) => {
    if (!bulletsText) return [];
    return bulletsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[•\-*]\s*/, '')); // Remove bullet markers
  };

  // Calculate package total bid price
  const calculatePackageTotal = (pkgId) => {
    const pkgGroups = equipmentGroups.filter(g => g.packageId === pkgId);
    const pkgLineItems = lineItems.filter(li =>
      pkgGroups.some(g => g.id === li.equipmentGroupId)
    );
    return pkgLineItems.reduce((total, item) => {
      const calc = calculateLineItem(item);
      return total + calc.bidPrice;
    }, 0);
  };

  let html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333;">
      <!-- Header -->
      <div style="margin-bottom: 40px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #1e40af; margin: 0 0 20px 0;">Equipment Quote</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; width: 140px; font-weight: 600; color: #6b7280;">Project Name:</td>
            <td style="padding: 4px 0;">${projectInfo.projectName || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #6b7280;">Project Number:</td>
            <td style="padding: 4px 0;">${projectInfo.projectNumber || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #6b7280;">Bid Date:</td>
            <td style="padding: 4px 0;">${formatDate(projectInfo.bidDate) || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #6b7280;">Customer:</td>
            <td style="padding: 4px 0;">${projectInfo.customerName || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600; color: #6b7280;">Engineer:</td>
            <td style="padding: 4px 0;">${projectInfo.engineerCompany || '—'}</td>
          </tr>
        </table>
      </div>
  `;

  // Generate each package section
  sortedPackages.forEach((pkg) => {
    const pkgGroups = equipmentGroups
      .filter(g => g.packageId === pkg.id)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const packageTotal = calculatePackageTotal(pkg.id);

    html += `
      <div style="margin-bottom: 40px;">
        <!-- Package Header -->
        <h2 style="font-size: 22px; font-weight: bold; color: #1e3a5f; margin: 0 0 20px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
          ${pkg.name}
        </h2>
    `;

    // Generate each equipment group within the package
    pkgGroups.forEach((group) => {
      const hasContent = group.equipmentHeading || group.equipmentBullets || group.notes;

      if (hasContent) {
        html += `<div style="margin-bottom: 24px; padding-left: 16px;">`;

        // Equipment Heading
        if (group.equipmentHeading) {
          html += `
            <h3 style="font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 12px 0;">
              ${group.equipmentHeading}
            </h3>
          `;
        }

        // Equipment Bullets
        if (group.equipmentBullets) {
          const bullets = parseBullets(group.equipmentBullets);
          if (bullets.length > 0) {
            html += `<ul style="margin: 0 0 16px 0; padding-left: 24px; list-style-type: disc;">`;
            bullets.forEach(bullet => {
              html += `<li style="margin-bottom: 6px; line-height: 1.5;">${bullet}</li>`;
            });
            html += `</ul>`;
          }
        }

        // Notes
        if (group.notes) {
          html += `
            <div style="margin-top: 12px; padding: 12px; background-color: #f9fafb; border-left: 3px solid #9ca3af; font-style: italic; color: #6b7280;">
              ${group.notes.replace(/\n/g, '<br>')}
            </div>
          `;
        }

        html += `</div>`;
      }
    });

    // Package Total Price
    html += `
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: right;">
          <span style="font-size: 16px; font-weight: 600; color: #1e3a5f;">
            Net Price, Freight included
            <span style="display: inline-block; width: 40px; text-align: center;">.......</span>
            ${formatCurrency(packageTotal)}
          </span>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  return html;
};

/**
 * Quote Preview Modal Component
 * Displays the quote as formatted HTML with print functionality
 */
const QuotePreviewModal = ({ isOpen, onClose, data }) => {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const quoteHTML = generateQuoteHTML(data);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quote - ${data.projectInfo.projectName || 'Untitled'}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          ${quoteHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">Quote Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div
            ref={printRef}
            className="bg-white shadow-lg mx-auto"
            style={{ maxWidth: '800px' }}
            dangerouslySetInnerHTML={{ __html: quoteHTML }}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <p className="text-sm text-gray-500 text-center">
            Click &quot;Print / Save PDF&quot; to print or save as PDF using your browser&apos;s print dialog
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotePreviewModal;
