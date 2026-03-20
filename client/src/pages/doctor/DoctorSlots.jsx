import { useState, useEffect } from 'react';
import { Clock, Trash2, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorSlots = () => {
    const { authFetch } = useAuth();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState('');

    const [form, setForm] = useState({
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        duration: '30',
        appointmentType: 'Both'
    });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/slots`);
            const data = await res.json();
            if (data.success) setSlots(data.data);
        } catch (err) {
            console.error('Error fetching slots:', err);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setMessage('');
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/slots`, {
                method: 'POST',
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                setMessage(`${data.count} slots created successfully!`);
                fetchSlots();
            } else {
                setMessage('Error: ' + (data.message || data.error));
            }
        } catch (err) {
            setMessage('Error creating slots');
        }
        setCreating(false);
    };

    const handleDelete = async (slotId) => {
        if (!confirm('Delete this slot?')) return;
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/slots/${slotId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setSlots(prev => prev.filter(s => s._id !== slotId));
            } else {
                alert(data.message || 'Failed to delete slot');
            }
        } catch (err) {
            alert('Error deleting slot');
        }
    };

    // Preview generated time slots
    const previewSlots = () => {
        if (!form.startTime || !form.endTime || !form.duration) return [];
        const [sh, sm] = form.startTime.split(':').map(Number);
        const [eh, em] = form.endTime.split(':').map(Number);
        let current = sh * 60 + sm;
        const end = eh * 60 + em;
        const times = [];
        while (current < end) {
            const h = Math.floor(current / 60);
            const m = current % 60;
            times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            current += parseInt(form.duration);
        }
        return times;
    };

    // Group existing slots by date
    const groupedSlots = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    if (loading) return <div className="text-center py-16 text-gray-400">Loading slots...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Slots</h2>
                <p className="text-gray-500 text-sm mt-1">Create and manage your availability</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message}
                </div>
            )}

            {/* Slot Generator */}
            <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary-600" /> Generate Slots
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input type="date" name="date" value={form.date} onChange={handleChange} required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slot Duration (min)</label>
                        <select name="duration" value={form.duration} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
                            <option value="15">15 minutes</option>
                            <option value="20">20 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
                        <select name="appointmentType" value={form.appointmentType} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
                            <option value="Both">Both (Online & Clinic)</option>
                            <option value="Online Consultation">Online Consultation</option>
                            <option value="Physical Clinic Visit">Physical Clinic Visit</option>
                        </select>
                    </div>
                </div>

                {/* Preview */}
                {form.date && previewSlots().length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview ({previewSlots().length} slots):</p>
                        <div className="flex flex-wrap gap-2">
                            {previewSlots().map(t => (
                                <span key={t} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <button type="submit" disabled={creating}
                    className="btn-primary py-3 px-8 shadow-md shadow-primary-500/20 flex items-center gap-2 text-sm font-semibold">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {creating ? 'Creating...' : 'Generate Slots'}
                </button>
            </form>

            {/* Existing Slots */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Your Slots ({slots.length})</h3>
                </div>

                {slots.length === 0 ? (
                    <div className="p-16 text-center">
                        <Clock className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No slots created yet</h3>
                        <p className="text-gray-500">Use the form above to generate your availability slots.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {Object.entries(groupedSlots).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateSlots]) => (
                            <div key={date} className="p-6">
                                <h4 className="font-bold text-gray-900 mb-3">
                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {dateSlots.sort((a, b) => a.time.localeCompare(b.time)).map(slot => (
                                        <div key={slot._id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${slot.isBooked ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                            <Clock className="w-3.5 h-3.5" />
                                            {slot.time}
                                            {slot.isBooked ? (
                                                <span className="text-xs bg-red-100 px-1.5 py-0.5 rounded">Booked</span>
                                            ) : (
                                                <button onClick={() => handleDelete(slot._id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorSlots;
