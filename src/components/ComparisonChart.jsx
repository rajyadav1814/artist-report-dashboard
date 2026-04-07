import React, { useRef, useEffect } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, DoughnutController, ArcElement } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, DoughnutController, ArcElement);

const ComparisonChart = ({ artists, selectedIds }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const chartArtists = artists
      .filter(a => selectedIds?.includes(a.id))
      .sort((a, b) => b.monthlyListeners - a.monthlyListeners);

    if (chartArtists.length === 0) return;

    const labels = chartArtists.map(a => a.name.split(' ')[0]);
    const data = chartArtists.map(a => a.monthlyListeners / 1000000);
    const colors = chartArtists.map(a => `${a.color}cc`);
    const borderColors = chartArtists.map(a => a.color);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,10,20,0.95)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
              label: ctx => `${ctx.raw.toFixed(1)}M monthly listeners`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.65)', font: { size: 11 } },
            grid: { display: false },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
          y: {
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: v => `${v}M` },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [artists, selectedIds]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export const ComparisonViewsChart = ({ artists, selectedIds }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const chartArtists = artists
      .filter(a => selectedIds?.includes(a.id))
      .sort((a, b) => b.youtubeViews - a.youtubeViews);

    if (chartArtists.length === 0) return;

    const labels = chartArtists.map(a => a.name.split(' ')[0]);
    const data = chartArtists.map(a => a.youtubeViews / 1e9);
    const colors = chartArtists.map(a => `${a.color}cc`);
    const borderColors = chartArtists.map(a => a.color);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,10,20,0.95)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
              label: ctx => `${ctx.raw.toFixed(1)}B YouTube views`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.65)', font: { size: 11 } },
            grid: { display: false },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
          y: {
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: v => `${v}B` },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [artists, selectedIds]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export const ComparisonAwardsChart = ({ artists, selectedIds }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const chartArtists = artists
      .filter(a => selectedIds?.includes(a.id))
      .map(a => ({
        ...a,
        awardCount: (a.awards || []).filter(aw => aw.status === 'won' || aw.status === 'honored').length,
      }))
      .sort((a, b) => b.awardCount - a.awardCount);

    if (chartArtists.length === 0) return;

    const labels = chartArtists.map(a => a.name.split(' ')[0]);
    const data = chartArtists.map(a => a.awardCount);
    const colors = chartArtists.map(a => `${a.color}cc`);
    const borderColors = chartArtists.map(a => a.color);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,10,20,0.95)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
              label: ctx => `${ctx.raw} awards won`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.65)', font: { size: 11 } },
            grid: { display: false },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
          y: {
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, precision: 0 },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [artists, selectedIds]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export const ComparisonToursChart = ({ artists, selectedIds }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const chartArtists = artists
      .filter(a => selectedIds?.includes(a.id))
      .map(a => ({
        ...a,
        tourCount: (a.tours || []).filter(t => t.status === 'announced').length,
      }))
      .sort((a, b) => b.tourCount - a.tourCount);

    if (chartArtists.length === 0) return;

    const labels = chartArtists.map(a => a.name.split(' ')[0]);
    const data = chartArtists.map(a => a.tourCount);
    const colors = chartArtists.map(a => `${a.color}cc`);
    const borderColors = chartArtists.map(a => a.color);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,10,20,0.95)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
              label: ctx => `${ctx.raw} active tours`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.65)', font: { size: 11 } },
            grid: { display: false },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
          y: {
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, precision: 0 },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [artists, selectedIds]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export const ComparisonRankChart = ({ artists, selectedIds }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const rankedArtists = artists
      .filter(a => selectedIds?.includes(a.id) && a.rank != null)
      .sort((a, b) => a.rank - b.rank);

    if (rankedArtists.length === 0) return;

    const maxRank = Math.max(...rankedArtists.map(a => a.rank));
    const labels = rankedArtists.map(a => a.name.split(' ')[0]);
    const data = rankedArtists.map(a => maxRank + 1 - a.rank);
    const colors = rankedArtists.map(a => `${a.color}cc`);
    const borderColors = rankedArtists.map(a => a.color);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,10,20,0.95)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
              label: ctx => {
                const artist = rankedArtists[ctx.dataIndex];
                return `Rank #${artist.rank}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.65)', font: { size: 11 } },
            grid: { display: false },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
          y: {
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, precision: 0 },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [artists, selectedIds]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ComparisonChart;
