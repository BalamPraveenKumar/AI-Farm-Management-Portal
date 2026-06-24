import React, { useEffect, useState } from 'react';
import { diseaseService } from '../services/diseaseService';
import { farmService } from '../services/farmService';
import { batchService } from '../services/batchService';
import { 
  Plus, 
  Search, 
  Activity, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  X, 
  RefreshCw, 
  Sparkles,
  ShieldAlert,
  Clock
} from 'lucide-react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    return `http://localhost:5000${imagePath}`;
  }
  return imagePath;
};

export default function DiseaseReports({ showToast, onUnauthorized }) {
  const [reports, setReports] = useState([]);
  const [farms, setFarms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [remarks, setRemarks] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Image detail modal
  const [activeImageReport, setActiveImageReport] = useState(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const loadReportsFarmsAndBatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [reportsRes, farmsRes, batchesRes] = await Promise.all([
        diseaseService.getDiseaseReports(onUnauthorized),
        farmService.getFarms(onUnauthorized),
        batchService.getBatches(onUnauthorized)
      ]);

      if (reportsRes && reportsRes.success) {
        // Sort reports by reported date / created_on descending
        const sorted = (reportsRes.reports || []).sort((a, b) => {
          return new Date(b.created_on || b.reported_date) - new Date(a.created_on || a.reported_date);
        });
        setReports(sorted);
      } else {
        showToast(reportsRes?.message || 'Failed to fetch reports.', 'error');
      }

      if (farmsRes && farmsRes.success) {
        const farmList = farmsRes.farms || [];
        setFarms(farmList);
        if (farmList.length > 0) {
          setSelectedFarmId(farmList[0].farm_id);
        }
      }

      if (batchesRes && batchesRes.success) {
        setBatches(batchesRes.batches || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading disease reports.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsFarmsAndBatches();
  }, []);

  // Handle farm change to update dependent batches
  useEffect(() => {
    if (selectedFarmId) {
      const filtered = batches.filter(b => b.farm?.farm_id === selectedFarmId);
      setFilteredBatches(filtered);
      if (filtered.length > 0) {
        setSelectedBatchId(filtered[0].batch_id);
      } else {
        setSelectedBatchId('');
      }
    } else {
      setFilteredBatches([]);
      setSelectedBatchId('');
    }
  }, [selectedFarmId, batches]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file.', 'error');
      return;
    }

    setImageFileName(file.name);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result); // Full base64 with prefix (e.g. data:image/png;base64,...)
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      showToast('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!selectedFarmId || !selectedBatchId || !symptoms.trim() || !imageBase64) {
      showToast('Farm, Batch, Symptoms, and Image are all required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await diseaseService.createDiseaseReport({
        farm_id: selectedFarmId,
        batch_id: selectedBatchId,
        symptoms: symptoms.trim(),
        remarks: remarks.trim() || undefined,
        disease_image: imageFile
      }, onUnauthorized);

      if (result && result.success) {
        showToast(result.message || 'Disease report submitted successfully!', 'success');
        setShowModal(false);
        // Reset Form
        setSymptoms('');
        setRemarks('');
        setImageBase64('');
        setImageFileName('');
        setImageFile(null);
        
        // Reload list
        loadReportsFarmsAndBatches();
      } else {
        showToast(result?.message || 'Failed to submit disease report.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during submission.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'badge-red';
      case 'medium': return 'badge-orange';
      default: return 'badge-green';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'badge-green';
      case 'underreview': return 'badge-orange';
      default: return 'badge-blue';
    }
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.report_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.farm?.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.batch?.batch_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === '' || r.risk_level?.toLowerCase() === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <h2 className="page-title" style={{ fontSize: '28px' }}>Disease Reports & AI Diagnostics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Submit crop/animal symptoms for quick computer-vision diagnostics</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', gap: '8px' }} onClick={() => loadReportsFarmsAndBatches(true)} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
            Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)} disabled={farms.length === 0}>
            <Plus size={18} />
            File Disease Report
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert-banner">
        <Sparkles size={20} />
        <span>
          <strong>AI Diagnostic Note:</strong> When you submit a disease report, our computer vision backend parses the symptoms asynchronously. Please wait 10-15 seconds and click the <strong>Refresh</strong> button above to review diagnosis recommendations.
        </span>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, symptoms, farm or batch name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="filter-select"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading diagnostic records...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state">
          <Activity size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h4 className="empty-title">No Reports Registered</h4>
            <p className="empty-desc">
              {searchTerm || riskFilter 
                ? 'No disease reports match your search criteria.' 
                : 'Any outbreaks or symptoms? Log them with a picture to get an instant AI evaluation and alerts.'}
            </p>
          </div>
          {(searchTerm || riskFilter) && (
            <button className="btn-secondary" onClick={() => { setSearchTerm(''); setRiskFilter(''); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-container" style={{ overflow: 'hidden' }}>
          <table className="custom-table" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '110px' }}>ID / Date</th>
                <th style={{ width: '130px' }}>Scope</th>
                <th style={{ width: '160px' }}>Symptoms & Remarks</th>
                <th style={{ width: '120px' }}>Disease Photo</th>
                <th style={{ width: '160px' }}>AI Analysis & Suggestion</th>
                <th style={{ width: '90px' }}>Risk</th>
                <th style={{ width: '100px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr 
                  key={report.report_sys_id || report.report_id}
                  onClick={() => setActiveImageReport(report)}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                >
                  <td>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--mono)', fontSize: '13px' }}>{report.report_id}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{report.reported_date || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.farm?.farm_name || 'N/A'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Batch: {report.batch?.batch_name || 'N/A'} ({report.animal_type || 'N/A'})
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={report.symptoms}>
                      <strong>Symptoms:</strong> {report.symptoms}
                    </div>
                    {report.remarks && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={report.remarks}>
                        <strong>Remarks:</strong> {report.remarks}
                      </div>
                    )}
                  </td>
                  <td>
                    {report.disease_image ? (
                      <div style={{ position: 'relative', width: '80px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img 
                          src={getImageUrl(report.disease_image)} 
                          alt="Disease Symptom" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="image-hover">
                          <ImageIcon size={14} style={{ color: '#fff' }} />
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Image</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {report.ai_analysis && report.ai_analysis !== 'Pending AI Analysis' ? (
                        <>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} />
                            Diagnosis Complete
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: 'var(--text-secondary)', 
                            maxHeight: '60px', 
                            overflowY: 'auto',
                            backgroundColor: 'var(--bg-app)', 
                            padding: '6px', 
                            borderRadius: '4px',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.3'
                          }}>
                            {report.ai_analysis}
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--warning)', fontWeight: 600 }}>
                          <Clock size={12} className="spinner" />
                          Pending AI Diagnostics
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRiskBadgeClass(report.risk_level)}`}>
                      {report.risk_level || 'low'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                      {report.status || 'submitted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">File Animal Disease Report</h3>
              <button className="drawer-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(90vh - 80px)' }}>
              <div className="modal-body" style={{ overflowY: 'auto', flexGrow: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Farm *</label>
                    <select
                      className="form-input"
                      value={selectedFarmId}
                      onChange={(e) => setSelectedFarmId(e.target.value)}
                      required
                    >
                      {farms.map((f) => (
                        <option key={f.farm_sys_id || f.farm_id} value={f.farm_id}>
                          {f.farm_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Batch *</label>
                    <select
                      className="form-input"
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      required
                      disabled={filteredBatches.length === 0}
                    >
                      {filteredBatches.length === 0 ? (
                        <option value="">No batches in this farm</option>
                      ) : (
                        filteredBatches.map((b) => (
                          <option key={b.batch_sys_id || b.batch_id} value={b.batch_id}>
                            {b.batch_name} ({b.animal_type})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observed Symptoms *</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="e.g. High fever, mouth ulcers, loss of appetite, foaming, lameness..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Symptom Image (Required) *</label>
                  <input
                    type="file"
                    id="disease_image"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                    required={!imageBase64}
                  />
                  <div 
                    className="image-upload-wrapper"
                    onClick={() => document.getElementById('disease_image').click()}
                  >
                    {imageBase64 ? (
                      <div style={{ width: '100%' }}>
                        <img src={imageBase64} className="image-preview" alt="Preview" />
                        <p style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'bold', marginTop: '8px' }}>
                          ✓ Image loaded: {imageFileName}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to replace image</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={36} style={{ color: 'var(--text-muted)' }} />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '14px' }}>Click to select/upload photo</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Accepts JPG, PNG, GIF</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks / Additional Observations</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="e.g. Symptoms visible since 2 days. Rest of the batch appears healthy."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff', borderWidth: '2px' }}></span>
                      Submitting report...
                    </span>
                  ) : (
                    'Submit to AI Inspection'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Detail View Modal */}
      {activeImageReport && (
        <div className="modal-overlay" onClick={() => setActiveImageReport(null)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Symptom Record — {activeImageReport.report_id}</h3>
              <button className="drawer-close" onClick={() => setActiveImageReport(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeImageReport.disease_image && (
                <img 
                  src={getImageUrl(activeImageReport.disease_image)} 
                  alt="Symptom Visual" 
                  style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: 'var(--radius-md)', backgroundColor: '#000' }} 
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <strong>Symptoms:</strong>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{activeImageReport.symptoms}</p>
                </div>
                {activeImageReport.remarks && (
                  <div>
                    <strong>Remarks:</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{activeImageReport.remarks}</p>
                  </div>
                )}
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--primary)', fontSize: '13px', marginBottom: '4px' }}>
                    <Sparkles size={14} />
                    AI Diagnosis:
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                    {activeImageReport.ai_analysis || 'AI analysis is currently processing. Check back in a few seconds.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveImageReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
