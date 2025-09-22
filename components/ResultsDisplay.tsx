
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { PredictionResult, Recommendation } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className = "" }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const RecommendationCard: React.FC<{ item: Recommendation }> = ({ item }) => {
    const impactColor = {
        'High': 'bg-red-100 text-red-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-green-100 text-green-800',
    }[item.impact];

    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${impactColor}`}>{item.impact} Impact</span>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
            {item.potentialYieldIncrease && (
                <p className="text-sm font-medium text-green-600 mt-2">+ {item.potentialYieldIncrease}% Potential Yield</p>
            )}
        </div>
    );
};


// Custom tooltip for the yield bar chart
const CustomBarTooltip: React.FC<any> = ({ active, payload, label, yieldUnit, confidenceScore }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{`Predicted Yield: ${payload[0].value.toFixed(2)} ${yieldUnit}`}</p>
          <p className="text-sm text-gray-600">{`Confidence: ${(confidenceScore * 100).toFixed(0)}%`}</p>
        </div>
      );
    }
    return null;
  };


const ResultsDisplay: React.FC<{ result: PredictionResult }> = ({ result }) => {
    const yieldData = [{ name: 'Predicted Yield', value: result.predictedYield }];
    const riskData = result.riskFactors.map(risk => ({ name: risk, value: 1 }));

    return (
        <div className="mt-8 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Prediction Summary" className="lg:col-span-2">
                    <p className="text-gray-600">{result.summary}</p>
                    <div className="mt-6 flex items-baseline space-x-4">
                        <p className="text-5xl font-extrabold text-green-600">{result.predictedYield.toFixed(2)}</p>
                        <span className="text-xl font-medium text-gray-500">{result.yieldUnit}</span>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">Confidence Score: <span className="font-bold text-gray-700">{(result.confidenceScore * 100).toFixed(0)}%</span></p>
                    </div>
                </Card>
                <Card title="Yield Potential">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={yieldData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                                cursor={{fill: 'rgba(16, 185, 129, 0.1)'}}
                                content={<CustomBarTooltip yieldUnit={result.yieldUnit} confidenceScore={result.confidenceScore} />}
                            />
                            <Bar dataKey="value" fill="#10B981" barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Key Risk Factors">
                 {riskData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="space-y-2">
                            {result.riskFactors.map((risk, index) => (
                                <li key={index} className="flex items-center">
                                    <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                                    {risk}
                                </li>
                            ))}
                        </ul>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                    {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [name, 'Risk Factor']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                 ) : (
                    <p className="text-gray-500">No significant risk factors identified.</p>
                 )}
            </Card>

            <Card title="Actionable Recommendations">
                <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                        <RecommendationCard key={index} item={rec} />
                    ))}
                </div>
            </Card>

            <Card title="Weather Impact Analysis">
                <p className="text-gray-600">{result.weatherImpactAnalysis}</p>
            </Card>

        </div>
    );
};

export default ResultsDisplay;
