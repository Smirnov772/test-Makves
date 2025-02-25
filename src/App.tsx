import "./styles.css";
import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceArea,
} from "recharts";

function calculateZScore(values: number[]): number[] {
    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    const stdDev = Math.sqrt(
        values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    );

    return values.map((val) => (val - mean) / stdDev);
}

const data = [
    { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
    { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
    { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
    { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
    { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
    { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
    { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

const uvValues = data.map((item) => item.uv);
const pvValues = data.map((item) => item.pv);

const zScoresUV = calculateZScore(uvValues);
const zScoresPV = calculateZScore(pvValues);

const zScoreComparison = data.map((item, index) => ({
    ...item,
    zScoreDifference: Math.abs(zScoresUV[index] - zScoresPV[index]),
}));

export default function App() {
    // Функция для определения областей, которые нужно закрасить
    const getHighlightedAreas = () => {
        const areas = [];
        let startIndex = null;

        for (let i = 0; i < zScoreComparison.length; i++) {
            if (zScoreComparison[i].zScoreDifference > 1) {
                if (startIndex === null) {
                    startIndex = i; // Начало области
                }
            } else {
                if (startIndex !== null) {
                    // Конец области
                    areas.push({ start: startIndex, end: i - 1 });
                    startIndex = null;
                }
            }
        }

        // Если область доходит до конца данных
        if (startIndex !== null) {
            areas.push({ start: startIndex, end: zScoreComparison.length - 1 });
        }

        return areas;
    };

    const highlightedAreas = getHighlightedAreas();

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={zScoreComparison} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {/* Закрашиваем области */}
                {highlightedAreas.map((area, index) => (
                    <ReferenceArea
                        key={index}
                        x1={data[area.start].name}
                        x2={data[area.end].name}
                        y1={0}
                        y2={Math.max(...uvValues, ...pvValues)}
                        fill="red"
                        fillOpacity={0.3}
                    />
                ))}
                <Line
                    type="monotone"
                    dataKey="pv"
                    stroke="#8884d8"
                    dot={(props) => {
                        const { cx, cy, payload } = props;
                        const color = payload.zScoreDifference > 1 ? "#ff0000" : "#8884d8";
                        return <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} />;
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="#82ca9d"
                    dot={(props) => {
                        const { cx, cy, payload } = props;
                        const color = payload.zScoreDifference > 1 ? "#ff0000" : "#82ca9d";
                        return <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} />;
                    }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
