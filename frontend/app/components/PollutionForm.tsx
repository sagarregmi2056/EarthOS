"use client";

import { useState } from 'react';
import axios from 'axios';

interface PollutionFormProps {
    onClose: () => void;
}

const PollutionForm: React.FC<PollutionFormProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        latitude: '',
        longitude: '',
        pm25: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!formData.latitude || !formData.longitude || !formData.pm25) {
            setError('Please fill in all required fields');
            return;
        }

        // Check if values are valid numbers
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        const pm25 = parseFloat(formData.pm25);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            setError('Latitude must be a number between -90 and 90');
            return;
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            setError('Longitude must be a number between -180 and 180');
            return;
        }

        if (isNaN(pm25) || pm25 < 0 || pm25 > 999) {
            setError('PM2.5 value must be a number between 0 and 999');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            // Submit data to API
            await axios.post('/api/pollution', {
                latitude: lat,
                longitude: lng,
                pm25: pm25,
                notes: formData.notes,
                source: 'user',
                deviceInfo: navigator.userAgent
            });

            setSuccess(true);

            // Reset form after 2 seconds
            setTimeout(() => {
                setFormData({
                    latitude: '',
                    longitude: '',
                    pm25: '',
                    notes: ''
                });
                setSuccess(false);
                onClose();
            }, 2000);

        } catch (err) {
            setError('Failed to submit data. Please try again.');
            console.error('Submission error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use browser geolocation to fill coordinates
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude.toFixed(6),
                        longitude: position.coords.longitude.toFixed(6)
                    }));
                },
                (err) => {
                    setError(`Geolocation error: ${err.message}`);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold mb-4">Report Pollution</h3>

            {success ? (
                <div className="bg-green-600 text-white p-3 rounded mb-4">
                    Data submitted successfully!
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-600 text-white p-2 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col space-y-4">
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                            >
                                Get My Location
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Latitude*</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className="w-full bg-slate-700 rounded p-2 text-white"
                                    placeholder="e.g. 40.7128"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Longitude*</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className="w-full bg-slate-700 rounded p-2 text-white"
                                    placeholder="e.g. -74.0060"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">PM2.5 Value*</label>
                            <input
                                type="number"
                                name="pm25"
                                value={formData.pm25}
                                onChange={handleChange}
                                className="w-full bg-slate-700 rounded p-2 text-white"
                                placeholder="e.g. 125"
                                min="0"
                                max="999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="w-full bg-slate-700 rounded p-2 text-white"
                                placeholder="Additional observations"
                                rows={2}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-earth-blue hover:bg-blue-800 px-3 py-1 rounded disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PollutionForm; 