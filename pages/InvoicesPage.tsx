
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { DownloadIcon, StarIcon } from '../components/icons.tsx';
import { jsPDF } from 'jspdf';
import { Logo } from '../components/Logo.tsx'; // Assuming Logo can be used this way

interface Invoice {
    id: string;
    invoiceDate: string;
    status: 'Paid';
    details: string;
    amount: number;
    paymentMethod: string;
}

const InvoicesPage: React.FC = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        if (user?.isPremium && user.creationDate) {
            // Generate realistic mock invoices based on user data
            const creationDate = new Date(user.creationDate);
            const generatedInvoices: Invoice[] = [];

            // Initial subscription invoice
            generatedInvoices.push({
                id: `INV-${creationDate.getFullYear()}-${String(creationDate.getMonth() + 1).padStart(2, '0')}`,
                invoiceDate: creationDate.toISOString().split('T')[0],
                status: 'Paid',
                details: 'Premium Plan - Yearly Subscription',
                amount: 5.00,
                paymentMethod: 'Card'
            });

            // Add renewal invoices if applicable
            let renewalDate = new Date(creationDate);
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
            while (renewalDate < new Date()) {
                 generatedInvoices.push({
                    id: `INV-${renewalDate.getFullYear()}-${String(renewalDate.getMonth() + 1).padStart(2, '0')}`,
                    invoiceDate: renewalDate.toISOString().split('T')[0],
                    status: 'Paid',
                    details: 'Premium Plan - Yearly Renewal',
                    amount: 5.00,
                    paymentMethod: 'Card'
                });
                renewalDate.setFullYear(renewalDate.getFullYear() + 1);
            }
            
            setInvoices(generatedInvoices.reverse()); // Show most recent first
        }
    }, [user]);

    const handleDownloadInvoice = (invoice: Invoice) => {
        const pdf = new jsPDF('p', 'mm', 'a4');

        // --- PDF Content ---
        // Header
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INVOICE', 14, 22);

        pdf.setFontSize(10);
        pdf.text('PDFBullet', 14, 30);
        pdf.text('Kathmandu, Nepal', 14, 35);
        pdf.text('Support@pdfbullet.com', 14, 40);

        // Invoice Details
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Invoice #: ${invoice.id}`, 148, 22);
        pdf.text(`Invoice Date: ${invoice.invoiceDate}`, 148, 28);
        pdf.text(`Due Date: ${invoice.invoiceDate}`, 148, 34);

        // Bill To
        pdf.setFont('helvetica', 'bold');
        pdf.text('Bill To:', 14, 55);
        pdf.setFont('helvetica', 'normal');
        pdf.text(user?.businessDetails?.companyName || user?.username || 'N/A', 14, 61);
        pdf.text(user?.businessDetails?.address || 'Address not provided', 14, 66);
        pdf.text(user?.businessDetails?.city || '', 14, 71);
        pdf.text(user?.businessDetails?.country || '', 14, 76);
        
        // Table Header
        pdf.setFillColor(230, 230, 230); // Light grey
        pdf.rect(14, 90, 182, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text('Description', 16, 95);
        pdf.text('Amount', 180, 95, { align: 'right' });

        // Table Body
        pdf.setFont('helvetica', 'normal');
        pdf.text(invoice.details, 16, 105);
        pdf.text(`$${invoice.amount.toFixed(2)}`, 180, 105, { align: 'right' });

        // Total Section
        pdf.line(120, 120, 196, 120); // Horizontal line
        pdf.setFont('helvetica', 'bold');
        pdf.text('Total', 122, 125);
        pdf.text(`$${invoice.amount.toFixed(2)}`, 180, 125, { align: 'right' });
        
        // Footer
        pdf.setFontSize(9);
        pdf.setTextColor(150);
        pdf.text('Thank you for your business!', 14, 280);

        pdf.save(`invoice-${invoice.id}.pdf`);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Invoice history</h1>
                {!user?.isPremium && (
                    <Link
                        to="/pricing"
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors text-sm"
                    >
                        <StarIcon className="h-5 w-5" />
                        <span>Upgrade to Premium</span>
                    </Link>
                )}
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">All invoices</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">Invoice Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Details</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Payment Method</th>
                                <th scope="col" className="px-6 py-3 text-center">Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user?.isPremium && invoices.length > 0 ? (
                                invoices.map(invoice => (
                                    <tr key={invoice.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100">{invoice.invoiceDate}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full">
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{invoice.details}</td>
                                        <td className="px-6 py-4">${invoice.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">{invoice.paymentMethod}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleDownloadInvoice(invoice)} 
                                                className="p-2 text-gray-500 hover:text-brand-red rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title={`Download invoice ${invoice.id}`}
                                            >
                                                <DownloadIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 px-6 text-gray-500 dark:text-gray-400">
                                        You have no invoices yet.
                                        {!user?.isPremium && (
                                            <p className="mt-2">
                                                <Link to="/pricing" className="text-brand-red font-semibold hover:underline">Upgrade to Premium</Link> to start your subscription.
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoicesPage;
