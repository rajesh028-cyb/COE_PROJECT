const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    throw err;
  }
}

export async function fetchCases(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/cases${queryString}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching cases:', err);
    throw err;
  }
}

export async function fetchCaseDetail(caseId) {
  try {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching case ${caseId}:`, err);
    throw err;
  }
}

export async function submitIntakeRequest(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Error submitting intake request:', err);
    throw err;
  }
}

export async function submitHumanReview(caseId, reviewData) {
  try {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`Error submitting review for ${caseId}:`, err);
    throw err;
  }
}

export async function assignStaff(caseId, assignData) {
  try {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`Error assigning staff for ${caseId}:`, err);
    throw err;
  }
}
