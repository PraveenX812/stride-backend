import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Zap, Activity, Globe } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

const Dashboard = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '60vh', textAlign: 'center', color: '#94a3b8'
            }}>
                <h2 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Welcome</h2>
                <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                    Your dashboard is currently empty. <br />
                    Chat on the right to visualize emissions data for you.
                </p>
                <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
                    Try: <em>"Visualize CO2 trends for Transport and Energy"</em>
                </div>
            </div>
        );
    }

    const isTrend = data?.chart_type === 'trend' || (Array.isArray(data) && data.length > 0 && data[0].data);
    const chartItems = Array.isArray(data) ? data : (data?.chart_data || []);

    let barChartData = { labels: [], datasets: [] };
    let doughnutData = { labels: [], datasets: [] };
    let summary = { totalCo2: 0, topSector: 'N/A', labelStr: '' };

    if (isTrend) {
        const allYears = Array.from(new Set(chartItems.flatMap(s => s.data.map(d => d.year)))).sort((a, b) => a - b);
        const latestYear = allYears[allYears.length - 1];
        summary.labelStr = latestYear || "Trend";


        let maxSector = { name: '', val: 0 };
        chartItems.forEach(sector => {
            const latestData = sector.data.find(d => d.year === latestYear) || sector.data[sector.data.length - 1];
            if (latestData) {
                summary.totalCo2 += latestData.co2;
                if (latestData.co2 > maxSector.val) maxSector = { name: sector.sector, val: latestData.co2 };
            }
        });
        summary.topSector = maxSector.name;

        // Charts
        barChartData = {
            labels: allYears,
            datasets: chartItems.map(sector => ({
                label: sector.sector,
                data: allYears.map(year => {
                    const entry = sector.data.find(d => d.year === year);
                    return entry ? entry.co2 : 0;
                }),
                backgroundColor: sector.color,
                borderRadius: 4,
            })),
        };

        doughnutData = {
            labels: chartItems.map(d => d.sector),
            datasets: [{
                data: chartItems.map(sector => {
                    const latest = sector.data.find(d => d.year === latestYear) || sector.data[sector.data.length - 1];
                    return latest ? latest.co2 : 0;
                }),
                backgroundColor: chartItems.map(d => d.color),
                borderColor: '#1e293b',
                borderWidth: 2
            }]
        };

    } else {
        summary.labelStr = "Current";
        let maxItem = { label: '', val: 0 };

        chartItems.forEach(item => {
            summary.totalCo2 += item.value;
            if (item.value > maxItem.val) maxItem = { label: item.label, val: item.value };
        });
        summary.topSector = maxItem.label;

        barChartData = {
            labels: chartItems.map(d => d.label),
            datasets: [{
                label: 'Emissions',
                data: chartItems.map(d => d.value),
                backgroundColor: chartItems.map(d => d.color),
                borderRadius: 6
            }]
        };

        doughnutData = {
            labels: chartItems.map(d => d.label),
            datasets: [{
                data: chartItems.map(d => d.value),
                backgroundColor: chartItems.map(d => d.color),
                borderColor: '#1e293b',
                borderWidth: 2
            }]
        };
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8' } },
            title: { display: false },
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
    };

    return (
        <div>
            <div className="dashboard-grid">
                {/* Summary Card 1 */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: '#10b981' }}>
                        <Globe size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Emissions ({summary.labelStr})</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{(summary.totalCo2).toLocaleString()}</div>
                    </div>
                </div>

                {/* Summary Card 2 */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255, 99, 132, 0.2)', borderRadius: '12px', color: '#ff6384' }}>
                        <Zap size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Highest Emitter</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary.topSector}</div>
                    </div>
                </div>

                {/* Summary Card 3 */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(54, 162, 235, 0.2)', borderRadius: '12px', color: '#36a2eb' }}>
                        <Activity size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Data Entities</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{chartItems.length}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Data Comparison</h3>
                    <div className="chart-container">
                        <Bar data={barChartData} options={barOptions} />
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Distribution ({summary.labelStr})</h3>
                    <div className="chart-container" style={{ position: 'relative' }}>
                        <Doughnut
                            data={doughnutData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
                                cutout: '70%'
                            }}
                        />
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            textAlign: 'center', pointerEvents: 'none'
                        }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>100%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>About the Data</h3>
                <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                    This visualization is generated by the <strong>AI Analyst</strong> based on your queries.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
