import { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { calculateLineItem } from '../../utils/calculations';
import { formatCurrency } from '../../utils/helpers';

/**
 * Generate HTML content for the quote document
 * Styled to match SVL quote PDF format
 */
const generateQuoteHTML = (data) => {
  const { projectInfo, quotePackages, equipmentGroups, lineItems } = data;

  // Sort packages by sortOrder
  const sortedPackages = [...quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Format date for display (M/D/YYYY format)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
  };

  // Parse bullets text into array, preserving NOTE: lines separately
  const parseContent = (text) => {
    if (!text) return { bullets: [], notes: [] };
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const bullets = [];
    const notes = [];

    lines.forEach(line => {
      // Check if line starts with NOTE: or is a note indicator
      if (line.toUpperCase().startsWith('NOTE:') || line.toUpperCase().startsWith('NOTE ')) {
        notes.push(line);
      } else {
        // Remove bullet markers
        bullets.push(line.replace(/^[•\-*]\s*/, ''));
      }
    });

    return { bullets, notes };
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

  // Generate dot leaders for price line
  const dotLeader = '......................................................................................';

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; font-size: 11pt; line-height: 1.4;">

      <!-- Company Header -->
      <div style="text-align: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid #f97316;">
        <div style="font-size: 9pt; color: #666;">
          2920 Centre Pointe Drive, Roseville, MN 55113 | Phone: 651-481-8000 | Fax: 651-481-8621
        </div>
        <div style="font-size: 9pt; color: #0066cc; margin-top: 4px;">
          www.svl.com | projects@svl.com
        </div>
      </div>

      <!-- Info Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; border: 1px solid #000;">
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #000; width: 33%;">
            <div><strong>To:</strong> ${projectInfo.customerName || ''}</div>
            <div><strong>Attn:</strong> ${projectInfo.attention || ''}</div>
            <div><strong>Engineer:</strong> ${projectInfo.engineerCompany || ''}</div>
            <div><strong>Page(s):</strong> 1</div>
          </td>
          <td style="padding: 4px 8px; border: 1px solid #000; width: 34%;">
            <div><strong>Project:</strong> ${projectInfo.projectName || ''}</div>
            <div><strong>Location:</strong> ${projectInfo.location || ''}</div>
            <div><strong>Notes:</strong> ${projectInfo.quoteNotes || ''}</div>
          </td>
          <td style="padding: 4px 8px; border: 1px solid #000; width: 33%;">
            <div><strong>Date:</strong> ${formatDate(new Date().toISOString().split('T')[0])}</div>
            <div><strong>SVL Quote #:</strong> ${projectInfo.projectNumber || ''}</div>
            <div><strong>Bid Date:</strong> ${formatDate(projectInfo.bidDate)}</div>
            <div><strong>Addendums:</strong> ${projectInfo.addendums || ''}</div>
          </td>
        </tr>
      </table>
  `;

  // Generate each package section
  sortedPackages.forEach((pkg) => {
    const pkgGroups = equipmentGroups
      .filter(g => g.packageId === pkg.id)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const packageTotal = calculatePackageTotal(pkg.id);

    // Package Header - Blue with underline, italic "Basis of Design" style
    html += `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 12pt; font-weight: normal; color: #0066cc; margin: 0 0 2px 0; padding-bottom: 2px; border-bottom: 1px solid #000;">
          ${pkg.name}
        </h2>
    `;

    // Generate each equipment group within the package
    pkgGroups.forEach((group) => {
      const hasContent = group.equipmentHeading || group.equipmentBullets || group.notes;

      if (hasContent) {
        // Equipment heading line with tag right-aligned
        if (group.equipmentHeading) {
          html += `
            <div style="display: flex; justify-content: space-between; margin-top: 8px; margin-bottom: 4px;">
              <div style="font-weight: bold;">
                ${group.equipmentHeading}
              </div>
              ${group.tag ? `<div style="font-weight: bold;">Tag: ${group.tag}</div>` : ''}
            </div>
          `;
        }

        // Parse content for bullets and notes
        const { bullets, notes: inlineNotes } = parseContent(group.equipmentBullets);

        // Equipment Bullets
        if (bullets.length > 0) {
          html += `<ul style="margin: 0 0 8px 40px; padding: 0; list-style-type: disc;">`;
          bullets.forEach(bullet => {
            html += `<li style="margin-bottom: 2px;">${bullet}</li>`;
          });
          html += `</ul>`;
        }

        // Inline notes from bullets (NOTE: lines)
        if (inlineNotes.length > 0) {
          inlineNotes.forEach(note => {
            html += `<div style="margin-left: 40px; margin-bottom: 4px;"><strong>${note}</strong></div>`;
          });
        }

        // Notes section
        if (group.notes) {
          const notesLines = group.notes.split('\n').filter(line => line.trim());
          notesLines.forEach(note => {
            // Check if it's a clarification or note that should be highlighted
            if (note.toUpperCase().includes('NOT INCLUDED') || note.toUpperCase().includes('CLARIFICATION')) {
              html += `<div style="margin-left: 40px; margin-bottom: 4px;"><strong style="color: #0066cc; text-decoration: underline;">${note}</strong></div>`;
            } else {
              html += `<div style="margin-left: 40px; margin-bottom: 4px;">${note}</div>`;
            }
          });
        }
      }
    });

    // Package Total Price with dot leaders
    const priceStr = formatCurrency(packageTotal);
    html += `
        <div style="margin-top: 12px; color: #f97316; font-weight: bold;">
          Total net price, freight allowed ${dotLeader.substring(0, 80 - priceStr.length)} ${priceStr}
        </div>
      </div>
    `;
  });

  // Footer - Sincerely
  html += `
      <div style="margin-top: 40px;">
        <div>Sincerely,</div>
        <div style="font-family: 'Brush Script MT', cursive; font-size: 16pt; margin-top: 8px; color: #333;">
          ${projectInfo.salesRep || 'Sales Representative'}
        </div>
      </div>

      <!-- Terms Footer -->
      <div style="margin-top: 40px; padding-top: 12px; border-top: 2px solid #f97316; font-size: 8pt; text-align: center; color: #666;">
        <div style="font-weight: bold;">ALL SALES ARE SUBJECT TO SVL'S TERMS AND CONDITIONS OF SALE, AVAILABLE AT</div>
        <div><a href="https://www.svl.com/terms-and-conditions/" style="color: #0066cc;">https://www.svl.com/terms-and-conditions/</a>, apply to this proposal/sale. Sales & use taxes not included.</div>
        <div>Goods will conform to approved/reviewed submittals. Quotes are valid for 30 days.</div>
      </div>
    </div>
  `;

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
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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
