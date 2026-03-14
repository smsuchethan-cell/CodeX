import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getForecast } from "../api/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastData {
  ds: string;
  yhat: number;
}

const ForecastChart: React.FC = () => {
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await getForecast();
        setData(response.data);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching forecast:", err);
        const message = err instanceof Error ? err.message : "Failed to fetch forecast";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
        <div className="spinner" />
        <span style={{ fontSize: "0.875rem" }}>Loading forecast...</span>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => {
      const date = new Date(d.ds);
      return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
    }),
    datasets: [
      {
        label: "Predicted Complaints",
        data: data.map((d) => d.yhat),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        borderWidth: 2.5,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "rgba(13, 18, 32, 0.9)",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.45,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.96)",
        titleFont: { family: "'Inter', sans-serif", size: 12, weight: "500" as const },
        bodyFont: { family: "'Inter', sans-serif", size: 14, weight: "bold" as const },
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        callbacks: {
          title: (context: { label: string }[]) => context[0].label,
          label: (context: { parsed: { y: number } }) => `${context.parsed.y.toFixed(0)} complaints predicted`,
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 10 },
          color: "#475569",
        }
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        border: { display: false, dash: [4, 4] },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 10 },
          color: "#475569",
          stepSize: 5,
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {error && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            fontSize: "0.65rem",
            color: "var(--warning)",
            fontWeight: "600",
            background: "rgba(251,191,36,0.08)",
            padding: "0.15rem 0.5rem",
            borderRadius: "4px",
            border: "1px solid rgba(251,191,36,0.15)",
            zIndex: 1,
          }}
        >
          ⚡ Demo
        </div>
      )}
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ForecastChart;
