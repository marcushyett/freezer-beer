'use client';

import { useMemo } from 'react';
import { Card, Typography, Alert } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { ProjectionPoint } from '@/lib/cooling-calculator';

const { Text } = Typography;

interface OutsideCoolingGraphProps {
  projectionData: ProjectionPoint[];
  initialTemp: number;
  targetTemp: number;
}

export default function OutsideCoolingGraph({
  projectionData,
  initialTemp,
  targetTemp,
}: OutsideCoolingGraphProps) {
  // Find when target is reached
  const targetReachedPoint = useMemo(() => {
    return projectionData.find(p => p.targetReached);
  }, [projectionData]);

  // Check for freezing risk
  const freezingRiskPoint = useMemo(() => {
    return projectionData.find(p => p.freezingRisk);
  }, [projectionData]);

  // Format chart data
  const chartData = useMemo(() => {
    return projectionData.map(point => ({
      time: point.time,
      timeLabel: new Date(point.time).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      }),
      'Beer Temp': point.beerTemp,
      'Outside Temp': point.ambientTemp,
    }));
  }, [projectionData]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    }
  };

  return (
    <Card
      style={{
        maxWidth: 600,
        width: '100%',
        background: 'transparent',
        border: '1px solid #1a1a1a',
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: '10px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Temperature Projection (7 Days)
        </Text>
      </div>

      {/* Warnings and info */}
      {targetReachedPoint && (
        <Alert
          message={`Target reached in ${Math.round((targetReachedPoint.time - projectionData[0].time) / (1000 * 60 * 60))} hours`}
          description={`Take your beer out at ${new Date(targetReachedPoint.time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`}
          type="success"
          showIcon
          style={{
            marginBottom: 12,
            background: 'transparent',
            border: '1px solid #52c41a',
            fontSize: '11px',
          }}
        />
      )}

      {freezingRiskPoint && (
        <Alert
          message="Freezing risk detected!"
          description={`Beer will drop below 1°C at ${new Date(freezingRiskPoint.time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}. Remove before this time to avoid freezing.`}
          type="warning"
          showIcon
          style={{
            marginBottom: 12,
            background: 'transparent',
            border: '1px solid #faad14',
            fontSize: '11px',
          }}
        />
      )}

      {!targetReachedPoint && (
        <Alert
          message="Target not reached"
          description="Based on the 7-day forecast, your beer will not reach the target temperature outdoors. Consider using a freezer or fridge."
          type="info"
          showIcon
          style={{
            marginBottom: 12,
            background: 'transparent',
            border: '1px solid #1890ff',
            fontSize: '11px',
          }}
        />
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatTime}
            stroke="#666666"
            style={{ fontSize: '10px' }}
            tickCount={6}
          />
          <YAxis
            stroke="#666666"
            style={{ fontSize: '10px' }}
            label={{ value: '°C', angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: '10px' } }}
          />
          <Tooltip
            contentStyle={{
              background: '#000000',
              border: '1px solid #333333',
              borderRadius: '4px',
              fontSize: '11px',
            }}
            labelFormatter={(value) => new Date(value as number).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
          <Legend
            wrapperStyle={{ fontSize: '10px' }}
            iconType="line"
          />

          {/* Reference lines */}
          <ReferenceLine
            y={targetTemp}
            label={{ value: `Target (${targetTemp}°C)`, position: 'right', fill: '#52c41a', fontSize: 10 }}
            stroke="#52c41a"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={initialTemp}
            label={{ value: `Start (${initialTemp}°C)`, position: 'right', fill: '#888888', fontSize: 10 }}
            stroke="#888888"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={1}
            label={{ value: 'Freezing Risk (1°C)', position: 'right', fill: '#faad14', fontSize: 10 }}
            stroke="#faad14"
            strokeDasharray="5 5"
          />

          {/* Freezing risk area */}
          {freezingRiskPoint && (
            <ReferenceArea
              y1={-10}
              y2={1}
              fill="#faad14"
              fillOpacity={0.1}
            />
          )}

          {/* Temperature lines */}
          <Line
            type="monotone"
            dataKey="Beer Temp"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Outside Temp"
            stroke="#1890ff"
            strokeWidth={1}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 12, fontSize: '10px', color: '#666666', textAlign: 'center' }}>
        Forecast updates hourly. Actual results may vary based on weather conditions.
      </div>
    </Card>
  );
}
