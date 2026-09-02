/**
 * Finance Service for the Reward Game.
 * Reuses the exact same API endpoints as the True Harbor main app.
 */

const DASHBOARD_API = 'https://api.aiseservices.com';
const CHAT_API = 'https://jqncngtsmd.execute-api.us-east-1.amazonaws.com/prod/chat';
const PLAID_API = 'https://y8e8lh1ja5.execute-api.us-east-1.amazonaws.com/prod/link';

/**
 * Fetch the dashboard snapshot for a given employee.
 * This mirrors the flow in true-harbor-ui's useSnapshot.ts:
 *   1. POST /dashboard-snapshot → get presigned S3 URL
 *   2. Fetch the presigned URL → parse JSON
 */
export async function fetchSnapshot(employeeId) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Step 1: Get presigned URL
  const response = await fetch(`${DASHBOARD_API}/dashboard-snapshot`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ employeeId }),
  });

  const respData = await response.json();

  if (!respData || !respData.success || !respData.data?.presignedUrl) {
    if (response.status === 404 || respData?.message === 'NO_DATA') {
      return { error: 'NO_DATA' };
    }
    return { error: respData?.message || 'Snapshot not available' };
  }

  // Step 2: Fetch the actual JSON from the presigned S3 URL
  const fetched = await fetch(respData.data.presignedUrl, {
    headers: { Accept: 'application/json' },
  });

  if (!fetched.ok) {
    return { error: `Failed to fetch snapshot: ${fetched.status}` };
  }

  let parsed = await fetched.text();
  try {
    parsed = JSON.parse(parsed);
  } catch {
    return { error: 'Failed to parse snapshot JSON' };
  }

  // Handle double-stringified JSON (same as useSnapshot.ts)
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      // leave as-is
    }
  }

  return { data: parsed };
}

/**
 * Send a question to the Sherpa (chatbot API).
 * Reuses the exact same endpoint as the True Harbor chatbot.
 */
export async function askSherpa(message, userId) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(CHAT_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, user_id: userId }),
    });

    const data = await response.json();
    return {
      botResponse: data.bot_response || '',
      suggestedQuestions: data.suggested_questions || [],
      suggestedAction: data.suggested_action || null,
    };
  } catch (err) {
    console.error('Sherpa chat error:', err);
    return {
      botResponse: 'The mountain winds are too strong. I cannot hear you right now. Try again later.',
      suggestedQuestions: [],
      suggestedAction: null,
    };
  }
}

/**
 * Plaid Integration for Bank Linking
 */
export async function generateLinkToken(employeeId) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${PLAID_API}/generate-link-token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ employee_id: employeeId }),
  });
  const data = await response.json();
  return data.link_token;
}

export async function exchangePublicToken(employeeId, publicToken) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${PLAID_API}/exchange-public-token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ employee_id: employeeId, publicToken }),
  });
  return response.json();
}
