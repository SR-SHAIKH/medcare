import { useState, useEffect } from 'react';
import { FileText, Download, Upload, Plus, ExternalLink, Calendar as CalendarIcon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MedicalHistory = () => {
    const { authFetch } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState({ name: '', url: '' });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/patient/medical-history`);
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Failed to load clinical records.');
        }
        setLoading(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/patient/upload-report`, {
                method: 'POST',
                body: JSON.stringify({ reportName: uploadData.name, reportUrl: uploadData.url })
            });
            const data = await res.json();
            if (data.success) {
                setShowUploadModal(false);
                setUploadData({ name: '', url: '' });
                // In a real app, you'd show a success toast
            }
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
                    <p className="text-gray-500 text-sm">Access your clinical reports and history</p>
                </div>
                <button 
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary py-2.5 px-5 flex items-center gap-2 rounded-2xl shadow-lg shadow-primary-500/20"
                >
                    <Plus className="w-5 h-5" /> Upload Report
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">Loading medical records...</div>
            ) : error ? (
                <div className="py-20 text-center text-red-500 bg-red-50 rounded-3xl">{error}</div>
            ) : history.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No records found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">You don't have any past consultation records or uploaded reports yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {history.map(record => (
                        <div key={record._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary-100 transition-all group">
                            <div className="p-6 lg:p-8">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-secondary-50 text-secondary-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-secondary-600 group-hover:text-white transition-colors">
                                            <CalendarIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-bold text-gray-900">Consultation with Dr. {record.doctor?.name}</h4>
                                                <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed mb-4">{record.notes}</p>
                                            
                                            {record.prescriptions?.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Prescription</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {record.prescriptions.map((p, idx) => (
                                                            <span key={idx} className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-primary-100 italic">
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {record.reports?.length > 0 && (
                                        <div className="lg:w-1/3 pt-6 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-gray-100">
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Files & Reports</h5>
                                            <div className="space-y-3">
                                                {record.reports.map((file, idx) => (
                                                    <a 
                                                        key={idx} 
                                                        href={file.url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-50 group/file transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <FileText className="w-5 h-5 text-gray-400 group-hover/file:text-primary-600" />
                                                            <span className="text-sm font-medium text-gray-600 truncate">{file.name}</span>
                                                        </div>
                                                        <Download className="w-4 h-4 text-gray-400 group-hover/file:text-primary-600" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in-center">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Upload Medical Report</h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Report Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    placeholder="e.g. Blood Test Results"
                                    value={uploadData.name}
                                    onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">File URL (Mocked Upload)</label>
                                <div className="relative">
                                    <input 
                                        type="url" 
                                        required
                                        className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        placeholder="https://example.com/report.pdf"
                                        value={uploadData.url}
                                        onChange={(e) => setUploadData({...uploadData, url: e.target.value})}
                                    />
                                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <button type="submit" className="w-full btn-primary py-4 rounded-xl font-bold shadow-lg shadow-primary-500/30">
                                Submit Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalHistory;
