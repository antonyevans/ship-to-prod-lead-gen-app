document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('agent-form');
    const setupSection = document.getElementById('campaign-setup');
    const dashboardSection = document.getElementById('live-dashboard');
    const leadsBody = document.getElementById('leads-body');
    const submitBtn = form.querySelector('.primary-btn');
    
    let pollingInterval = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable button to prevent multi-submit
        submitBtn.disabled = true;
        submitBtn.innerText = 'Initializing Agents...';
        
        const payload = {
            agentName: document.getElementById('agent-name').value,
            productOffering: document.getElementById('product-offering').value,
            idealProfile: document.getElementById('ideal-profile').value
        };

        try {
            // Trigger the backend API
            const response = await fetch('/api/start-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if(data.status === 'success') {
                // Transition UI
                setupSection.classList.add('hidden');
                dashboardSection.classList.remove('hidden');
                dashboardSection.classList.add('fade-in');
                
                // Start polling database
                startPolling();
            } else {
                alert('Failed to start campaign. Check backend logs.');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Deploy Voice Agent';
            }
        } catch (error) {
            console.error(error);
            alert('Error connecting to backend API.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Deploy Voice Agent';
        }
    });

    async function fetchLeads() {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            
            if (data.leads && data.leads.length > 0) {
                renderTable(data.leads);
            }
        } catch(e) {
            console.error("Polling error: ", e);
        }
    }

    function renderTable(leads) {
        leadsBody.innerHTML = ''; // Clear table
        
        leads.forEach(lead => {
            const tr = document.createElement('tr');
            
            // Status styling
            let statusClass = lead.status === 'Calling' ? 'status-calling' : 'status-completed';
            
            tr.innerHTML = `
                <td><strong>${lead.name}</strong><br><small style="color: var(--text-secondary)">${lead.company}</small></td>
                <td>${lead.phone}</td>
                <td class="${statusClass}">${lead.status}</td>
                <td>${lead.summary || 'Awaiting agent transcript...'}</td>
            `;
            leadsBody.appendChild(tr);
        });
    }

    function startPolling() {
        // Fetch immediately, then every 3 seconds
        fetchLeads();
        pollingInterval = setInterval(fetchLeads, 3000);
    }
});
