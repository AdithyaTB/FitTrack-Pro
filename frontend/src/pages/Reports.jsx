import { FileText, Download } from 'lucide-react';
import API from '../services/api';

const Reports = () => {
    const handleDownload = async () => {
        try {
            const response = await API.get('/reports/pdf', {
                responseType: 'blob', // Important for handling binary data
            });

            // Create a link to download the PDF
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'fitness_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading report', error);
            alert('Failed to download report');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Reports</h1>

            <div className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-6 bg-primary/20 rounded-full text-primary-light mb-4">
                    <FileText size={64} />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Your Fitness Report</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Generate a detailed PDF report of your workout history, weight progress, and health statistics to share with your trainer or keep for your records.
                    </p>
                </div>

                <button
                    onClick={handleDownload}
                    className="glass-btn flex items-center gap-2 text-lg px-8 py-3"
                >
                    <Download size={24} /> Download PDF
                </button>
            </div>
        </div>
    );
};

export default Reports;
